#!/bin/bash

# Backend Startup Script for ByajBook
# This script sets up and starts the backend server

set -e

echo "🚀 Starting ByajBook Backend Server..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if .env exists, if not create it
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Configuration
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=4000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3000"
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    echo "✅ Prisma client generated"
else
    echo "✅ Prisma client already generated"
fi

# Check if database exists, if not run migrations
if [ ! -f "prisma/dev.db" ]; then
    echo "🗄️  Database not found. Running migrations..."
    npx prisma migrate dev --name init
    echo "✅ Database initialized"
else
    echo "✅ Database exists"
fi

echo ""
echo "🎯 Starting development server..."
echo "📍 Server will be available at: http://localhost:4000"
echo "📍 Health check: http://localhost:4000/health"
echo ""

# Start the server
npm run dev

