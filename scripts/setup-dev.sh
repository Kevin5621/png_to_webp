#!/bin/bash

# PNG to WebP Converter - Development Setup Script
# This script automates the setup process for both backend and frontend

set -e  # Exit on any error

echo "🚀 Setting up PNG to WebP Converter Development Environment"
echo "============================================================"

# Check if we're in the right directory
if [ ! -f "scripts/setup-dev.sh" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Rust
if ! command_exists rustc; then
    echo "❌ Rust is not installed. Please install Rust from https://rustup.rs/"
    exit 1
fi
echo "✅ Rust found: $(rustc --version)"

# Check Node.js
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Check npm
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi
echo "✅ npm found: $(npm --version)"

echo ""

# Setup Backend
echo "🦀 Setting up Rust Backend..."
cd backend

# Copy environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Created .env file from .env.example"
fi

# Install dependencies and build
echo "📦 Installing Rust dependencies..."
cargo check
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ..

# Setup Frontend
echo "⚛️  Setting up Next.js Frontend..."
cd frontend

# Copy environment file
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo "📝 Created .env.local file from .env.local.example"
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Create additional missing dependencies for backend
echo "🔧 Adding missing backend dependencies..."
cd backend

# Add missing dependencies to Cargo.toml
cargo add base64
cargo add chrono --features serde

echo "✅ Additional dependencies added"

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend server:"
echo "   cd backend && cargo run"
echo ""
echo "2. In another terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔧 Development commands:"
echo "   Backend:  ./scripts/start-backend.sh"
echo "   Frontend: ./scripts/start-frontend.sh"
echo "   Both:     ./scripts/start-dev.sh"
