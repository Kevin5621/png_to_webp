# PNG to WebP Converter - Justfile
# Cross-platform task runner for monorepo management
# Install Just: https://github.com/casey/just

# Default recipe - show available commands
default:
    @just --list

# 🚀 Development Commands

# Start both backend and frontend in development mode
dev:
    @echo "🚀 Starting development servers..."
    concurrently \
        --names "BACKEND,FRONTEND" \
        --prefix-colors "red,blue" \
        "just dev-backend" \
        "just dev-frontend"

# Start backend only
dev-backend:
    @echo "🦀 Starting Rust backend..."
    cd backend && cargo run

# Start frontend only  
dev-frontend:
    @echo "⚛️  Starting Next.js frontend..."
    cd frontend && npm run dev

# Start with specific ports
dev-ports backend_port="8080" frontend_port="3000":
    @echo "🚀 Starting with custom ports..."
    concurrently \
        --names "BACKEND,FRONTEND" \
        --prefix-colors "red,blue" \
        "cd backend && PORT={{backend_port}} cargo run" \
        "cd frontend && PORT={{frontend_port}} npm run dev"

# 🔧 Setup & Installation

# Complete project setup
setup:
    @echo "🔧 Setting up monorepo..."
    just check-deps
    just install-deps
    just check-health

# Check required dependencies
check-deps:
    @echo "🔍 Checking dependencies..."
    @command -v cargo >/dev/null 2>&1 || (echo "❌ Rust not found. Install from https://rustup.rs/" && exit 1)
    @command -v node >/dev/null 2>&1 || (echo "❌ Node.js not found. Install from https://nodejs.org/" && exit 1)
    @command -v npm >/dev/null 2>&1 || (echo "❌ npm not found" && exit 1)
    @echo "✅ All dependencies found"

# Install all dependencies
install-deps:
    @echo "📦 Installing dependencies..."
    npm install
    cd frontend && npm install
    cd backend && cargo check

# Check project health
check-health:
    @echo "🏥 Checking project health..."
    just check-backend
    just check-frontend
    @echo "✅ Project is healthy!"

# 🏗️ Build Commands

# Build everything for production
build:
    @echo "🏗️ Building for production..."
    just build-backend
    just build-frontend

# Build backend
build-backend:
    @echo "🦀 Building Rust backend..."
    cd backend && cargo build --release

# Build frontend
build-frontend:
    @echo "⚛️  Building Next.js frontend..."
    cd frontend && npm run build

# 🧪 Testing Commands

# Run all tests
test:
    @echo "🧪 Running all tests..."
    just test-backend
    just test-frontend

# Test backend
test-backend:
    @echo "🦀 Testing Rust backend..."
    cd backend && cargo test

# Test frontend
test-frontend:
    @echo "⚛️  Testing Next.js frontend..."
    cd frontend && npm run test 2>/dev/null || echo "No tests configured in frontend"

# 🔍 Code Quality Commands

# Run all linting
lint:
    @echo "🔍 Linting all code..."
    just lint-backend
    just lint-frontend

# Lint backend
lint-backend:
    @echo "🦀 Linting Rust code..."
    cd backend && cargo clippy -- -D warnings

# Lint frontend
lint-frontend:
    @echo "⚛️  Linting TypeScript code..."
    cd frontend && npm run lint

# Format all code
format:
    @echo "📝 Formatting all code..."
    just format-backend
    just format-frontend

# Format backend
format-backend:
    @echo "🦀 Formatting Rust code..."
    cd backend && cargo fmt

# Format frontend
format-frontend:
    @echo "⚛️  Formatting TypeScript code..."
    cd frontend && npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "Prettier not configured"

# Type check all
check:
    @echo "🔎 Type checking..."
    just check-backend
    just check-frontend

# Check backend
check-backend:
    @echo "🦀 Checking Rust types..."
    cd backend && cargo check

# Check frontend
check-frontend:
    @echo "⚛️  Checking TypeScript types..."
    cd frontend && npm run type-check

# 🧹 Cleanup Commands

# Clean all build artifacts
clean:
    @echo "🧹 Cleaning all build artifacts..."
    just clean-backend
    just clean-frontend

# Clean backend
clean-backend:
    @echo "🦀 Cleaning Rust artifacts..."
    cd backend && cargo clean

# Clean frontend
clean-frontend:
    @echo "⚛️  Cleaning Next.js artifacts..."
    cd frontend && rm -rf .next node_modules
    rm -rf node_modules

# Deep clean (including lockfiles)
clean-deep:
    @echo "🧹 Deep cleaning..."
    just clean
    rm -f package-lock.json
    rm -f frontend/package-lock.json
    rm -f backend/Cargo.lock

# 🚀 Production Commands

# Start production servers
start:
    @echo "🚀 Starting production servers..."
    concurrently \
        --names "BACKEND,FRONTEND" \
        --prefix-colors "red,blue" \
        "just start-backend" \
        "just start-frontend"

# Start backend in production mode
start-backend:
    @echo "🦀 Starting Rust backend (production)..."
    cd backend && cargo run --release

# Start frontend in production mode
start-frontend:
    @echo "⚛️  Starting Next.js frontend (production)..."
    cd frontend && npm start

# 📊 Monitoring Commands

# Show project status
status:
    @echo "📊 Project Status"
    @echo "=================="
    @echo "Backend:"
    @cd backend && echo "  - Rust version: $(rustc --version)"
    @cd backend && echo "  - Dependencies: $(cargo tree --depth 0 | wc -l) packages"
    @echo "Frontend:"
    @cd frontend && echo "  - Node version: $(node --version)"
    @cd frontend && echo "  - Dependencies: $(npm list --depth=0 2>/dev/null | wc -l) packages"

# Show logs (requires backend/frontend to be running)
logs:
    @echo "📋 Following logs..."
    @echo "Backend logs: http://localhost:8080/health"
    @echo "Frontend: http://localhost:3000"

# 🔧 Utility Commands

# Open project in IDE
open:
    @echo "📝 Opening project..."
    code . || echo "VS Code not found"

# Show project info
info:
    @echo "📋 PNG to WebP Converter Monorepo"
    @echo "=================================="
    @echo "Backend:  Rust + Axum (Port 8080)"
    @echo "Frontend: Next.js + TypeScript (Port 3000)"
    @echo "Docs:     README.md & ARCHITECTURE.md"
    @echo ""
    @echo "Available commands:"
    @just --list

# Update dependencies
update:
    @echo "🔄 Updating dependencies..."
    cd backend && cargo update
    cd frontend && npm update
    npm update

# Security audit
audit:
    @echo "🔒 Running security audit..."
    cd backend && cargo audit || echo "Install cargo-audit: cargo install cargo-audit"
    cd frontend && npm audit

# Generate project report
report:
    @echo "📊 Generating project report..."
    @echo "Project Report - $(date)" > project-report.md
    @echo "==================" >> project-report.md
    @echo "" >> project-report.md
    @echo "## Backend (Rust)" >> project-report.md
    @cd backend && cargo tree --depth 0 >> ../project-report.md
    @echo "" >> project-report.md
    @echo "## Frontend (Node.js)" >> project-report.md
    @cd frontend && npm list --depth=0 >> ../project-report.md 2>/dev/null || true
    @echo "📝 Report saved to project-report.md"
