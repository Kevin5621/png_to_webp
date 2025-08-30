#!/bin/bash

# Start frontend development server

set -e

echo "⚛️  Starting Next.js Frontend Server..."

cd frontend

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.local.example..."
    cp .env.local.example .env.local
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting development server on http://localhost:3000"
echo "🔗 Backend API: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
