# =============================================================================
# Makefile - Collab-PM Development Commands
# =============================================================================
# Usage: make <target>
# Run 'make help' for a list of available targets
# =============================================================================

.PHONY: help install dev build test lint format clean docker-up docker-down docker-build db-migrate db-push db-studio

# Default target
.DEFAULT_GOAL := help

# Colors for terminal output
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

# =============================================================================
# Help
# =============================================================================
help: ## Show this help message
	@echo "$(CYAN)Collab-PM Development Commands$(RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# =============================================================================
# Development
# =============================================================================
install: ## Install all dependencies
	pnpm install

dev: ## Start development servers
	pnpm dev

build: ## Build all packages for production
	pnpm build

test: ## Run all tests
	pnpm test

lint: ## Run linting
	pnpm lint

format: ## Format code with Prettier
	pnpm format

check-types: ## Run TypeScript type checking
	pnpm check-types

# =============================================================================
# Database
# =============================================================================
db-generate: ## Generate Prisma client
	pnpm --filter @collab-pm/api db:generate

db-migrate: ## Run database migrations
	pnpm --filter @collab-pm/api db:migrate

db-push: ## Push schema changes (development only)
	pnpm --filter @collab-pm/api db:push

db-studio: ## Open Prisma Studio
	pnpm --filter @collab-pm/api db:studio

db-reset: ## Reset database (WARNING: destroys all data)
	pnpm --filter @collab-pm/api prisma migrate reset

# =============================================================================
# Docker - Development
# =============================================================================
docker-dev: ## Start development environment with Docker
	docker compose -f docker-compose.dev.yml up -d

docker-dev-build: ## Build and start development environment
	docker compose -f docker-compose.dev.yml up -d --build

docker-dev-down: ## Stop development environment
	docker compose -f docker-compose.dev.yml down

docker-dev-logs: ## View development logs
	docker compose -f docker-compose.dev.yml logs -f

docker-dev-infra: ## Start only infrastructure (PostgreSQL, Redis)
	docker compose -f docker-compose.dev.yml up -d postgres redis

# =============================================================================
# Docker - Production
# =============================================================================
docker-prod: ## Start production environment
	docker compose -f docker-compose.prod.yml up -d

docker-prod-build: ## Build production images
	docker compose -f docker-compose.prod.yml build

docker-prod-down: ## Stop production environment
	docker compose -f docker-compose.prod.yml down

docker-prod-logs: ## View production logs
	docker compose -f docker-compose.prod.yml logs -f

# =============================================================================
# Docker - Utilities
# =============================================================================
docker-clean: ## Remove all containers, volumes, and images
	docker compose -f docker-compose.dev.yml down -v --rmi all
	docker compose -f docker-compose.prod.yml down -v --rmi all
	docker system prune -f

docker-ps: ## List running containers
	docker compose ps

docker-shell-api: ## Open shell in API container
	docker exec -it collab-pm-api sh

docker-shell-db: ## Open PostgreSQL CLI
	docker exec -it collab-pm-postgres psql -U collab -d collabpm

docker-shell-redis: ## Open Redis CLI
	docker exec -it collab-pm-redis redis-cli

# =============================================================================
# Cleanup
# =============================================================================
clean: ## Clean build artifacts and dependencies
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules
	rm -rf apps/*/.next
	rm -rf apps/*/dist
	rm -rf .turbo
	pnpm store prune

clean-docker: ## Clean Docker resources
	docker system prune -af
	docker volume prune -f

# =============================================================================
# Setup
# =============================================================================
setup: ## Initial project setup
	@echo "$(CYAN)Setting up Collab-PM...$(RESET)"
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	pnpm install
	@echo "$(GREEN)Copying environment files...$(RESET)"
	cp -n apps/api/.env.example apps/api/.env 2>/dev/null || true
	cp -n apps/interface/.env.example apps/interface/.env.local 2>/dev/null || true
	@echo "$(GREEN)Starting infrastructure...$(RESET)"
	docker compose -f docker-compose.dev.yml up -d postgres redis
	@echo "$(GREEN)Waiting for database...$(RESET)"
	sleep 5
	@echo "$(GREEN)Running database migrations...$(RESET)"
	pnpm --filter @collab-pm/api db:generate
	pnpm --filter @collab-pm/api db:migrate
	@echo "$(CYAN)Setup complete! Run 'make dev' to start development servers.$(RESET)"
