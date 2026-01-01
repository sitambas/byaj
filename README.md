# ByajBook - Loan Management System

A comprehensive loan management system for digitalizing lending operations with support for web, mobile, and desktop platforms.

## Features

- 📊 **Dashboard** - Financial overview with charts and summaries
- 💰 **Loan Management** - Complete loan lifecycle management
- 👥 **People Management** - Customer/borrower management
- 📈 **Interest Calculator** - Calculate interest with various methods
- 📄 **Reports** - Generate comprehensive financial reports
- 💳 **Transactions** - Track all financial transactions
- 🏦 **Deposits** - Manage recurring deposits
- 👨‍💼 **Staff Management** - Multi-user support with roles
- 🔔 **Reminders** - Automated payment reminders
- 🎁 **Refer & Earn** - Referral system

## Tech Stack

### Backend
- Node.js
- Express.js / Nest.js
- PostgreSQL
- Prisma ORM
- JWT Authentication

### Frontend
- Next.js 14+ (App Router)
- Redux Toolkit
- Tailwind CSS
- React Hook Form
- Recharts

### Mobile
- React Native
- React Navigation
- Redux (shared store)

### Desktop
- Electron
- Cross-platform (Windows EXE, macOS DMG)

## Project Structure

```
byaj/
├── backend/          # Node.js backend API
├── frontend/         # Next.js web application
├── mobile/           # React Native mobile app
├── desktop/          # Electron desktop app
└── shared/           # Shared types and utilities
```

## 🚀 Quick Start

**New to the project?** Start here: [START_HERE.md](./START_HERE.md)

### Quick Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Edit with your database URL
npx prisma migrate dev
npm run dev

# Frontend (in a new terminal)
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

Visit `http://localhost:3000` to see the application!

## Development Phases

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed development roadmap.

## Features Documentation

See [FEATURE_ANALYSIS.md](./FEATURE_ANALYSIS.md) for complete feature breakdown.

## License

[Your License Here]

