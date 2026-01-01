# ByajBook - Loan Management System - Feature Analysis

## Overview
A comprehensive loan management system for digitalizing lending operations with support for web, mobile, and desktop platforms.

## Core Features Identified

### 1. Authentication & User Management
- **Login**: Phone number-based authentication (+91 country code)
- **User Profile**: Profile management with masked ID display
- **Language Support**: Hindi, English, Hinglish
- **Multi-context**: Book/Staff selection for different contexts

### 2. Dashboard
**Key Metrics Cards:**
- Total Outstanding
- Total Lent
- Total Borrowed
- People Owe
- You Owe

**Visualizations:**
- Donut chart showing Total Lent vs Interest
- Bar charts for financial overview
- Today's Due Loans section with filters (All, Due Today, Overdue, Collaterals)

**Actions:**
- Add Loan button (modal with Lend Money / Borrow Money options)
- Automated Reminders toggle

### 3. Book Management
- Create new books
- Select active book/context
- Book-based data segregation

### 4. Loan Accounts Management

#### 4.1 Lent Accounts
- List all lent loans with filters
- Summary: Total Loans, Principal Amount, Interest
- Table columns: Borrower, Principal, Interest, Total, Start Date, Status, Strategy, Actions
- Status types: Active, Settled, Deleted, Muted
- Strategy types: Fixed Amount, % Simple Interest, Compound Interest, With EMI

#### 4.2 Borrowed Accounts
- Similar structure to Lent Accounts
- Track borrowed money

#### 4.3 Add New Loan Flow (Multi-step Wizard)
**Step 1: Customer Details**
- Customer name
- Customer phone (with country code dropdown)
- Customer address (multi-line)

**Step 2: Loan Type**
- Options: "With Interest" or "Fixed Amount"
- Interest Calculation: "Monthly" or "Daily"

**Step 3: Loan Details**
- Start date (calendar picker)
- End date (auto-calculated or manual)
- Principal amount
- Rate of interest (%)
- Interest Every (dropdown: Daily, Weekly, Monthly, etc.)
- Checkboxes:
  - Add EMI
  - Do you wish to add compounding to this loan?
  - Date to Date Calculation?

**Step 4: Attachments**
- Collateral Details modal
- Product Details (name, type dropdown - Gold, etc.)
- Purity selection
- Weight (KG, Gram, Mili)
- Remarks
- Image upload for collateral

### 5. Loan Details Page (Individual Loan View)
**Left Section:**
- Borrower information card:
  - Name, Phone, Address
  - Avatar/profile picture
  - Bill Number (editable)
  - Start date, End date
  - Loan settings (expandable)
  - Signature (expandable)

**Center Section:**
- Donut chart: You lent vs Interest
- Loan attributes:
  - Account Type (LENT/BORROWED)
  - Rate of interest
  - EMI Cycle
  - Number of EMI

**Right Section:**
- Financial summary:
  - Time Duration (YR MO DYS)
  - Principal amount
  - Topup
  - Interest
  - Total
  - Amount Recovered
  - Amount Left
  - Additional Charge
  - Late payment charge
  - Waive off penalty checkbox
- Actions: Edit, Transactions, Add Topup
- EMI Details (expandable)
- Receipt (downloadable)

**Bottom Sections:**
- Attachments: Collateral images with delete option
- Reminders:
  - Send Reminder button
  - Automated reminders toggle
  - Request status cards: Pending, Accepted, Rejected

**Floating Action:**
- Record Payment button

### 6. People Management
**Summary Cards:**
- Total People
- Active People
- Contact Coverage (%)

**Features:**
- Search people
- Filters and sorting
- Table columns:
  - Person (name, avatar)
  - Contact Info (phone)
  - A/C No. (Account Number)
  - Status (Active/Inactive)
  - Loans Count
  - Actions

**Individual Person View:**
- Profile card with edit/delete options
- Summary: Total Lent, Total Borrowed, Total Loans
- Loan accounts table for that person
- Download Report button

### 7. Transactions
**Summary Cards:**
- Total Transactions count
- Total Amount
- Filtered Results count

**Features:**
- Search transactions
- Filters and sorting
- Table columns:
  - Transaction Details (borrower name, ID)
  - Amount
  - Type (PAYMENT, etc.)
  - Payment Mode (Cash, etc.)
  - Date
  - Actions

### 8. Reports Management
**Report Types:**
1. **Financial Reports:**
   - Interest Report (borrower-specific)
   - Lent Report
   - Collection Report
   - Mortgage Report

2. **Transaction Reports:**
   - Daily Statement
   - Transaction Report

3. **Summary Reports:**
   - Account Summary

4. **User-Specific Reports:**
   - Party Statement
   - User transaction report

**Features:**
- Each report shows usage count
- Borrower selection modal for specific reports
- Download functionality

### 9. Interest Calculator
**Input Fields:**
- Enter Amount
- Rate of interest
- Interest Every (dropdown)
- Checkbox: "Do you want to compound this interest"
- Radio buttons: Days / Date Range

**Actions:**
- Clear All
- Show forecast (displays chart/graph)

### 10. Deposits Management
**Features:**
- Add New Deposit modal:
  - Name
  - Phone
  - Amount
  - Send every (frequency)
  - Start date
- List of deposits
- Deposit management

### 11. Refer & Earn
**Features:**
- Referral code display (e.g., "POJ20Z60")
- Invite Friends button
- Total users referred count
- Free subscription rewards

### 12. My Staff
**Features:**
- Staff Management page
- Add staff modal:
  - Select role (dropdown)
  - Name
  - Phone number
- Staff list
- Staff management

### 13. Loan Settings (Sidebar)
**Options:**
- Delete Loan
- Other loan management options

### 14. Collateral/Mortgage Management
**Features:**
- Product Details (name, type)
- Purity selection
- Weight input (KG/Gram/Mili)
- Remarks
- Image upload
- Current valuation display

## User Flows

### Flow 1: Add New Loan
1. Click "+ Add Loan" → Modal appears
2. Select "Lend Money" or "Borrow Money"
3. **Step 1**: Enter customer details (name, phone, address)
4. **Step 2**: Select loan type (With Interest/Fixed Amount) and calculation method (Monthly/Daily)
5. **Step 3**: Enter loan details (dates, amount, interest rate, EMI options)
6. **Step 4**: Add attachments/collateral (optional)
7. Verify & Create Loan

### Flow 2: Record Payment
1. Navigate to Loan Details page
2. Click "Record Payment" button
3. Enter payment details (amount, date, mode)
4. Save transaction

### Flow 3: Generate Report
1. Navigate to Reports page
2. Select report type
3. For borrower-specific reports, select borrower from modal
4. Download report

### Flow 4: Manage People
1. Navigate to People page
2. Search/filter people
3. Click on person → View all loans
4. Can edit person details, download reports

## Technical Requirements

### Data Models Needed
1. **User/Staff**
2. **Book**
3. **Person/Customer**
4. **Loan** (with relationships to Person, Book)
5. **Transaction**
6. **Collateral/Mortgage**
7. **Deposit**
8. **Report**
9. **Reminder**

### Key Calculations
- Simple Interest
- Compound Interest
- EMI calculations
- Date-to-date interest
- Monthly vs Daily interest calculation

### State Management
- User authentication state
- Active book/context
- Loan filters and search
- Transaction filters
- Report generation state

## UI/UX Patterns
- Purple color scheme (#primary)
- Modal-based workflows
- Multi-step forms
- Expandable sections
- Floating action buttons
- Card-based layouts
- Responsive tables
- Search and filter patterns
- Chart visualizations (donut, bar charts)

