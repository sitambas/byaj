# Database Setup Instructions

## Option 1: Using Docker (Recommended)

If you have Docker installed:

1. Start PostgreSQL using Docker Compose:
```bash
cd /Users/sitambas/New-Poject/P-Project/byaj
docker-compose up -d
```

2. Wait for PostgreSQL to be ready (about 10-15 seconds)

3. Run database migrations:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## Option 2: Install PostgreSQL Locally (macOS)

### Using Homebrew:

1. Install PostgreSQL:
```bash
brew install postgresql@15
```

2. Start PostgreSQL service:
```bash
brew services start postgresql@15
```

3. Create the database:
```bash
createdb byajbook
```

4. Update your `.env` file in the `backend` directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/byajbook?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3002"
```

5. Run database migrations:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## Option 3: Use SQLite for Development (Easiest)

If you want to quickly test without setting up PostgreSQL:

1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Update `.env`:
```env
DATABASE_URL="file:./dev.db"
```

3. Run migrations:
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

## Verify Database Connection

After setup, test the connection:
```bash
cd backend
npx prisma studio
```

This will open a web interface to view your database.

## Troubleshooting

- **Port 5432 already in use**: Change the port in docker-compose.yml or your PostgreSQL config
- **Connection refused**: Make sure PostgreSQL is running (`brew services list` or `docker ps`)
- **Database doesn't exist**: Create it with `createdb byajbook` or let Prisma create it during migration

