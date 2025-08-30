#!/bin/bash

# Start backend development server

set -e

echo "🦀 Starting Rust Backend Server..."

cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
fi

# Set development environment
export RUST_LOG=debug

echo "🚀 Starting server on http://localhost:8080"
echo "📡 API endpoints:"
echo "   GET  /health       - Health check"
echo "   POST /api/convert  - Convert PNG to WebP"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cargo run
