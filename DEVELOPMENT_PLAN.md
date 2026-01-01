# Development Plan - ByajBook Loan Management System

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js or Nest.js (recommended for scalability)
- **Database**: PostgreSQL (for relational data) + Redis (for caching)
- **ORM**: Prisma or TypeORM
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 or local storage
- **PDF Generation**: PDFKit or Puppeteer
- **Email/SMS**: Twilio or similar service

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui or Headless UI
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form + Zod validation
- **Date Picker**: react-datepicker or date-fns
- **File Upload**: react-dropzone

### Mobile
- **Framework**: React Native (shared codebase with web)
- **Navigation**: React Navigation
- **State**: Redux (shared with web)

### Desktop
- **Framework**: Electron (for cross-platform desktop app)
- **Packaging**: 
  - Windows: electron-builder (EXE)
  - macOS: electron-builder (DMG)
  - Linux: AppImage/DEB

## Project Structure

```
byaj/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── types/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── tests/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/
│   │   ├── store/            # Redux store
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── lib/
│   ├── public/
│   └── package.json
│
├── mobile/
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── store/            # Shared Redux store
│   │   └── services/
│   └── package.json
│
├── desktop/
│   ├── src/
│   │   ├── main.js          # Electron main process
│   │   └── preload.js
│   ├── public/              # Shared with frontend
│   └── package.json
│
├── shared/                  # Shared types and utilities
│   ├── types/
│   ├── utils/
│   └── constants/
│
└── docs/
```

## Development Phases

### Phase 1: Foundation (Week 1-2)
1. **Backend Setup**
   - Initialize Node.js project
   - Setup database schema (Prisma)
   - Setup authentication (JWT)
   - Create base API structure
   - Setup file upload handling

2. **Frontend Setup**
   - Initialize Next.js project
   - Setup Redux store
   - Configure Tailwind CSS
   - Create base layout (sidebar, header)
   - Setup routing

3. **Database Schema**
   - User/Staff models
   - Book model
   - Person/Customer model
   - Loan model
   - Transaction model
   - Collateral model
   - Deposit model

### Phase 2: Core Features (Week 3-6)
1. **Authentication**
   - Phone-based login
   - JWT token management
   - User context switching

2. **Dashboard**
   - Summary cards API
   - Chart data API
   - Due loans API
   - Dashboard UI components

3. **Book Management**
   - CRUD operations
   - Book selection/context

4. **People Management**
   - Add/Edit/Delete people
   - Search and filters
   - People list view
   - Individual person view

### Phase 3: Loan Management (Week 7-10)
1. **Add Loan Flow**
   - Multi-step form components
   - Customer details step
   - Loan type selection
   - Loan details form
   - Attachments/collateral
   - Loan creation API

2. **Loan List Views**
   - Lent accounts list
   - Borrowed accounts list
   - Filters and sorting
   - Search functionality

3. **Loan Details Page**
   - Loan information display
   - Financial calculations
   - Chart visualizations
   - Transaction history
   - Payment recording

4. **Interest Calculations**
   - Simple interest
   - Compound interest
   - EMI calculations
   - Date-to-date calculations
   - Monthly vs Daily calculations

### Phase 4: Advanced Features (Week 11-14)
1. **Transactions**
   - Transaction recording
   - Transaction list
   - Filters and search
   - Payment modes

2. **Reports**
   - Interest report
   - Transaction report
   - Party statement
   - Account summary
   - PDF generation

3. **Interest Calculator**
   - Calculator UI
   - Forecast visualization
   - Chart display

4. **Deposits**
   - Deposit management
   - Recurring deposits
   - Deposit tracking

5. **Collateral Management**
   - Add/edit collateral
   - Image upload
   - Valuation tracking

### Phase 5: Additional Features (Week 15-16)
1. **Refer & Earn**
   - Referral code generation
   - Referral tracking
   - Rewards system

2. **Staff Management**
   - Staff CRUD
   - Role management
   - Permissions

3. **Reminders**
   - Automated reminders
   - Manual reminders
   - SMS/Email integration

### Phase 6: Mobile App (Week 17-20)
1. **React Native Setup**
   - Project initialization
   - Navigation setup
   - Shared Redux store
   - API integration

2. **Core Screens**
   - Login
   - Dashboard
   - Loan list
   - Loan details
   - Add loan flow
   - People management

### Phase 7: Desktop App (Week 21-22)
1. **Electron Setup**
   - Main process setup
   - Preload scripts
   - Window management

2. **Packaging**
   - Windows EXE build
   - macOS DMG build
   - Auto-updater setup

### Phase 8: Testing & Optimization (Week 23-24)
1. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

2. **Performance**
   - Database optimization
   - API optimization
   - Frontend optimization

3. **Security**
   - Security audit
   - Data encryption
   - Input validation

## Key API Endpoints

### Authentication
- `POST /api/auth/login` - Phone-based login
- `POST /api/auth/verify` - OTP verification
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - List books
- `POST /api/books` - Create book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### People
- `GET /api/people` - List people (with filters)
- `POST /api/people` - Create person
- `GET /api/people/:id` - Get person details
- `PUT /api/people/:id` - Update person
- `DELETE /api/people/:id` - Delete person

### Loans
- `GET /api/loans` - List loans (with filters)
- `POST /api/loans` - Create loan
- `GET /api/loans/:id` - Get loan details
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan
- `POST /api/loans/:id/payments` - Record payment
- `GET /api/loans/:id/transactions` - Get loan transactions

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction details

### Reports
- `GET /api/reports/interest` - Interest report
- `GET /api/reports/transaction` - Transaction report
- `GET /api/reports/party-statement` - Party statement
- `GET /api/reports/account-summary` - Account summary

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary
- `GET /api/dashboard/charts` - Chart data
- `GET /api/dashboard/due-loans` - Due loans

## Database Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  phone     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  books     Book[]
  staff     Staff?
}

model Book {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  loans     Loan[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Person {
  id        String   @id @default(cuid())
  name      String
  phone     String
  address   String?
  accountNo String?
  bookId    String
  book      Book     @relation(fields: [bookId], references: [id])
  loans     Loan[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Loan {
  id                String       @id @default(cuid())
  billNumber        String
  personId          String
  person            Person       @relation(fields: [personId], references: [id])
  bookId            String
  book              Book         @relation(fields: [bookId], references: [id])
  accountType       String       // LENT or BORROWED
  loanType          String       // WITH_INTEREST or FIXED_AMOUNT
  interestCalc      String       // MONTHLY or DAILY
  principalAmount   Float
  interestRate      Float
  interestEvery     String       // DAILY, WEEKLY, MONTHLY
  startDate         DateTime
  endDate           DateTime?
  hasEMI            Boolean      @default(false)
  hasCompounding    Boolean      @default(false)
  dateToDateCalc    Boolean      @default(false)
  status            String       // ACTIVE, SETTLED, DELETED, MUTED
  strategy          String       // FIXED_AMOUNT, SIMPLE_INTEREST, COMPOUND_INTEREST, WITH_EMI
  remarks           String?
  transactions      Transaction[]
  collaterals       Collateral[]
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

model Transaction {
  id          String   @id @default(cuid())
  loanId      String
  loan        Loan     @relation(fields: [loanId], references: [id])
  amount      Float
  type        String   // PAYMENT, TOPUP, etc.
  paymentMode String   // CASH, BANK, UPI, etc.
  date        DateTime
  remarks     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Collateral {
  id          String   @id @default(cuid())
  loanId      String
  loan        Loan     @relation(fields: [loanId], references: [id])
  productName String
  productType String   // GOLD, CASH_LOAN, etc.
  purity      String?
  weight      Float?
  weightUnit  String?  // KG, GRAM, MILI
  value       Float    @default(0)
  remarks     String?
  images      String[] // Array of image URLs
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Deposit {
  id          String   @id @default(cuid())
  name       String
  phone       String
  amount     Float
  frequency  String   // DAILY, WEEKLY, MONTHLY
  startDate  DateTime
  bookId     String
  book       Book     @relation(fields: [bookId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

## Next Steps

1. Initialize backend project with Express/Nest.js
2. Setup Prisma with PostgreSQL
3. Initialize Next.js frontend
4. Setup Redux store structure
5. Create base UI components
6. Implement authentication flow
7. Build dashboard
8. Implement loan management features

