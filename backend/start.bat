@echo off
REM Backend Startup Script for ByajBook (Windows)
REM This script sets up and starts the backend server

echo 🚀 Starting ByajBook Backend Server...
echo.

cd /d "%~dp0"

REM Check if .env exists, if not create it
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo # Database
        echo DATABASE_URL="file:./prisma/dev.db"
        echo.
        echo # JWT Configuration
        echo JWT_SECRET="your-secret-key-change-in-production"
        echo JWT_EXPIRES_IN="7d"
        echo.
        echo # Server Configuration
        echo PORT=4000
        echo NODE_ENV=development
        echo.
        echo # Frontend URL (for CORS)
        echo FRONTEND_URL="http://localhost:3000"
    ) > .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Check if Prisma client is generated
if not exist "node_modules\.prisma" (
    echo 🔧 Generating Prisma client...
    call npx prisma generate
    echo ✅ Prisma client generated
) else (
    echo ✅ Prisma client already generated
)

REM Check if database exists, if not run migrations
if not exist "prisma\dev.db" (
    echo 🗄️  Database not found. Running migrations...
    call npx prisma migrate dev --name init
    echo ✅ Database initialized
) else (
    echo ✅ Database exists
)

echo.
echo 🎯 Starting development server...
echo 📍 Server will be available at: http://localhost:4000
echo 📍 Health check: http://localhost:4000/health
echo.

REM Start the server
call npm run dev

