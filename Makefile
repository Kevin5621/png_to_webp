# PNG to WebP Converter - Makefile
# Alternative to Justfile for environments without Just
.PHONY: help dev build test lint clean setup

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
BLUE=\033[0;34m
YELLOW=\033[1;33m
NC=\033[0m # No Color

# Default target
help: ## Show this help
	@echo "PNG to WebP Converter - Monorepo Commands"
	@echo "========================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(BLUE)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# 🚀 Development Commands
dev: ## Start both backend and frontend in development mode
	@echo "$(GREEN)🚀 Starting development servers...$(NC)"
	@npm run dev

dev-backend: ## Start backend only
	@echo "$(RED)🦀 Starting Rust backend...$(NC)"
	@cd backend && cargo run

dev-frontend: ## Start frontend only
	@echo "$(BLUE)⚛️  Starting Next.js frontend...$(NC)"
	@cd frontend && npm run dev

# 🔧 Setup Commands
setup: ## Complete project setup
	@echo "$(YELLOW)🔧 Setting up monorepo...$(NC)"
	@make check-deps
	@make install-deps
	@make check-health

check-deps: ## Check required dependencies
	@echo "$(YELLOW)🔍 Checking dependencies...$(NC)"
	@command -v cargo >/dev/null 2>&1 || (echo "❌ Rust not found. Install from https://rustup.rs/" && exit 1)
	@command -v node >/dev/null 2>&1 || (echo "❌ Node.js not found. Install from https://nodejs.org/" && exit 1)
	@command -v npm >/dev/null 2>&1 || (echo "❌ npm not found" && exit 1)
	@echo "$(GREEN)✅ All dependencies found$(NC)"

install-deps: ## Install all dependencies
	@echo "$(YELLOW)📦 Installing dependencies...$(NC)"
	@npm install
	@cd frontend && npm install
	@cd backend && cargo check

check-health: ## Check project health
	@echo "$(YELLOW)🏥 Checking project health...$(NC)"
	@make check-backend
	@make check-frontend
	@echo "$(GREEN)✅ Project is healthy!$(NC)"

# 🏗️ Build Commands
build: ## Build everything for production
	@echo "$(YELLOW)🏗️ Building for production...$(NC)"
	@npm run build

build-backend: ## Build backend
	@echo "$(RED)🦀 Building Rust backend...$(NC)"
	@cd backend && cargo build --release

build-frontend: ## Build frontend
	@echo "$(BLUE)⚛️  Building Next.js frontend...$(NC)"
	@cd frontend && npm run build

# 🧪 Testing Commands
test: ## Run all tests
	@echo "$(YELLOW)🧪 Running all tests...$(NC)"
	@npm run test

test-backend: ## Test backend
	@echo "$(RED)🦀 Testing Rust backend...$(NC)"
	@cd backend && cargo test

test-frontend: ## Test frontend
	@echo "$(BLUE)⚛️  Testing Next.js frontend...$(NC)"
	@cd frontend && npm run test 2>/dev/null || echo "No tests configured in frontend"

# 🔍 Code Quality Commands
lint: ## Run all linting
	@echo "$(YELLOW)🔍 Linting all code...$(NC)"
	@npm run lint

lint-backend: ## Lint backend
	@echo "$(RED)🦀 Linting Rust code...$(NC)"
	@cd backend && cargo clippy

lint-frontend: ## Lint frontend
	@echo "$(BLUE)⚛️  Linting TypeScript code...$(NC)"
	@cd frontend && npm run lint

format: ## Format all code
	@echo "$(YELLOW)📝 Formatting all code...$(NC)"
	@npm run format

format-backend: ## Format backend
	@echo "$(RED)🦀 Formatting Rust code...$(NC)"
	@cd backend && cargo fmt

format-frontend: ## Format frontend
	@echo "$(BLUE)⚛️  Formatting TypeScript code...$(NC)"
	@cd frontend && npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "Prettier not configured"

check: ## Type check all
	@echo "$(YELLOW)🔎 Type checking...$(NC)"
	@npm run check

check-backend: ## Check backend
	@echo "$(RED)🦀 Checking Rust types...$(NC)"
	@cd backend && cargo check

check-frontend: ## Check frontend
	@echo "$(BLUE)⚛️  Checking TypeScript types...$(NC)"
	@cd frontend && npm run type-check

# 🧹 Cleanup Commands
clean: ## Clean all build artifacts
	@echo "$(YELLOW)🧹 Cleaning all build artifacts...$(NC)"
	@npm run clean

clean-backend: ## Clean backend
	@echo "$(RED)🦀 Cleaning Rust artifacts...$(NC)"
	@cd backend && cargo clean

clean-frontend: ## Clean frontend
	@echo "$(BLUE)⚛️  Cleaning Next.js artifacts...$(NC)"
	@cd frontend && rm -rf .next node_modules
	@rm -rf node_modules

clean-deep: ## Deep clean (including lockfiles)
	@echo "$(YELLOW)🧹 Deep cleaning...$(NC)"
	@make clean
	@rm -f package-lock.json
	@rm -f frontend/package-lock.json
	@rm -f backend/Cargo.lock

# 🚀 Production Commands
start: ## Start production servers
	@echo "$(GREEN)🚀 Starting production servers...$(NC)"
	@npm run start:prod

start-backend: ## Start backend in production mode
	@echo "$(RED)🦀 Starting Rust backend (production)...$(NC)"
	@cd backend && cargo run --release

start-frontend: ## Start frontend in production mode
	@echo "$(BLUE)⚛️  Starting Next.js frontend (production)...$(NC)"
	@cd frontend && npm start

# 📊 Utility Commands
status: ## Show project status
	@echo "$(GREEN)📊 Project Status$(NC)"
	@echo "=================="
	@echo "Backend:"
	@cd backend && echo "  - Rust version: $$(rustc --version)"
	@echo "Frontend:"
	@cd frontend && echo "  - Node version: $$(node --version)"

update: ## Update dependencies
	@echo "$(YELLOW)🔄 Updating dependencies...$(NC)"
	@cd backend && cargo update
	@cd frontend && npm update
	@npm update

open: ## Open project in IDE
	@echo "$(GREEN)📝 Opening project...$(NC)"
	@code . || echo "VS Code not found"
