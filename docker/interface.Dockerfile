# ============================================
# Stage 1: Base - Install dependencies
# ============================================
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ============================================
# Stage 2: Dependencies - Install all deps
# ============================================
FROM base AS deps

# Copy workspace configuration files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/interface/package.json ./apps/interface/
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
COPY --from=deps /app/apps/interface/node_modules ./apps/interface/node_modules

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_APP_URL

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN pnpm --filter interface build

# ============================================
# Stage 4: Production Runner
# ============================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/apps/interface/public ./public

# Set correct permissions for prerendered pages
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/apps/interface/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/interface/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]
