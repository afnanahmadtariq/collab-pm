# ============================================
# Stage 1: Base - Install dependencies
# ============================================
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install dependencies required for Prisma and native modules
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# ============================================
# Stage 2: Dependencies - Install all deps
# ============================================
FROM base AS deps

# Copy workspace configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: Builder - Build the application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm --filter @collab-pm/api db:generate

# Build the API
RUN pnpm --filter @collab-pm/api build

# ============================================
# Stage 4: Production Runner
# ============================================
FROM node:20-alpine AS runner

# Install required runtime dependencies
RUN apk add --no-cache libc6-compat openssl dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 collab

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Copy built application
COPY --from=builder --chown=collab:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=collab:nodejs /app/apps/api/package.json ./
COPY --from=builder --chown=collab:nodejs /app/apps/api/prisma ./prisma
COPY --from=builder --chown=collab:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=collab:nodejs /app/apps/api/node_modules/.prisma ./node_modules/.prisma

# Switch to non-root user
USER collab

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
