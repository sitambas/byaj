# ByajBook Backend API

Node.js + Express backend for ByajBook Loan Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/byajbook?schema=public"
JWT_SECRET="your-secret-key"
PORT=3001
```

4. Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start development server:
```bash
npm run dev
```

## Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── services/      # Business logic
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   ├── utils/         # Utility functions
│   └── types/        # TypeScript types
├── prisma/
│   └── schema.prisma  # Database schema
└── dist/             # Compiled JavaScript
```

## API Endpoints

### Health Check
- `GET /health` - Server health check
- `GET /api` - API information

### Authentication (to be implemented)
- `POST /api/auth/login` - Login with phone number
- `POST /api/auth/verify` - Verify OTP
- `GET /api/auth/me` - Get current user

### Books (to be implemented)
- `GET /api/books` - List all books
- `POST /api/books` - Create book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### People (to be implemented)
- `GET /api/people` - List people
- `POST /api/people` - Create person
- `GET /api/people/:id` - Get person details
- `PUT /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person

### Loans (to be implemented)
- `GET /api/loans` - List loans
- `POST /api/loans` - Create loan
- `GET /api/loans/:id` - Get loan details
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan
- `POST /api/loans/:id/payments` - Record payment

## Database

Using Prisma ORM with PostgreSQL.

### Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

## Development

```bash
# Development mode (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

