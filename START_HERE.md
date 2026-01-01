
# 🚀 Start Development - ByajBook

## Quick Start Guide

### Prerequisites
- Node.js 18+ (or 20+ recommended)
- PostgreSQL database
- npm or yarn

### Step 1: Setup Backend

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Setup environment variables
cp .env.example .env
# Edit .env and add your DATABASE_URL

# Setup PostgreSQL database
# Create a database named 'byajbook' (or update DATABASE_URL)

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

Backend will run on: `http://localhost:3001`

### Step 2: Setup Frontend

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Setup environment variables
# Create .env.local file with:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

### Step 3: Access the Application

1. Open browser: `http://localhost:3000`
2. Navigate to `/dashboard` to see the dashboard
3. Start building features!

## Project Structure

```
byaj/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Utility functions
│   └── prisma/           # Database schema
│
├── frontend/             # Next.js application
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── store/           # Redux store
│   └── services/        # API service layer
│
├── mobile/              # React Native (to be implemented)
├── desktop/             # Electron (to be implemented)
└── shared/              # Shared types/utils
```

## Next Steps

1. **Backend**: Implement authentication API endpoints
2. **Frontend**: Create login page
3. **Database**: Seed initial data for testing
4. **Features**: Start with Dashboard API and UI

## Useful Commands

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate   # Run database migrations
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Database Setup

1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE byajbook;
```

3. Update `backend/.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/byajbook?schema=public"
```

4. Run migrations:
```bash
cd backend
npx prisma migrate dev
```

## Troubleshooting

### Prisma Issues
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env
- Run `npx prisma generate` after schema changes

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Change port in `package.json` scripts

### CORS Issues
- Ensure backend CORS is configured
- Check API URL in frontend `.env.local`

## Development Resources

- [Backend API Docs](./DEVELOPMENT_PLAN.md#key-api-endpoints)
- [Feature Analysis](./FEATURE_ANALYSIS.md)
- [User Flows](./USER_FLOWS.md)
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Development Checklist](./DEVELOPMENT_CHECKLIST.md)

---

**Happy Coding! 🎉**

