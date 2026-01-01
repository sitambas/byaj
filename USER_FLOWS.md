# User Flows - ByajBook

## Flow 1: User Authentication

```
[Login Page]
    ↓
Enter Phone Number (+91)
    ↓
[OTP Verification] (if implemented)
    ↓
[Select Book/Staff Context]
    ↓
[Dashboard]
```

## Flow 2: Add New Loan (Complete Flow)

```
[Dashboard]
    ↓
Click "+ Add Loan"
    ↓
[Modal: Lend Money / Borrow Money]
    ↓ Select "Lend Money"
    ↓
[Step 1: Customer Details]
    ├─ Enter Customer Name
    ├─ Enter Phone Number (+91)
    └─ Enter Address
    ↓ Click "Next"
    ↓
[Step 2: Loan Type]
    ├─ Select: "With Interest" or "Fixed Amount"
    └─ Select: "Monthly" or "Daily" calculation
    ↓ Click "Next"
    ↓
[Step 3: Loan Details]
    ├─ Start Date (calendar picker)
    ├─ End Date (auto or manual)
    ├─ Principal Amount
    ├─ Rate of Interest (%)
    ├─ Interest Every (dropdown)
    ├─ Checkboxes:
    │   ├─ Add EMI
    │   ├─ Add Compounding
    │   └─ Date to Date Calculation
    └─ Remarks (textarea)
    ↓ Click "Next"
    ↓
[Step 4: Attachments]
    ├─ Click "+" to add collateral
    │   └─ [Collateral Details Modal]
    │       ├─ Product Name
    │       ├─ Product Type (Gold, etc.)
    │       ├─ Purity
    │       ├─ Weight (KG/Gram/Mili)
    │       ├─ Upload Images
    │       └─ Remarks
    └─ View uploaded collaterals
    ↓ Click "Verify & Create Loan"
    ↓
[Loan Created Successfully]
    ↓
[Redirect to Loan Details Page]
```

## Flow 3: Record Payment

```
[Loan Details Page]
    ↓
Click "Record Payment" button
    ↓
[Payment Modal]
    ├─ Enter Amount
    ├─ Select Payment Mode (Cash, Bank, UPI)
    ├─ Select Date
    └─ Add Remarks (optional)
    ↓ Click "Save"
    ↓
[Payment Recorded]
    ↓
[Update Loan Details]
    ├─ Amount Recovered updated
    ├─ Amount Left updated
    └─ Transaction added to history
```

## Flow 4: View Loan Details

```
[Loan Accounts Page]
    ↓
Click on loan row (or action button)
    ↓
[Loan Details Page]
    ├─ [Left Section]
    │   ├─ Borrower Info Card
    │   │   ├─ Name, Phone, Address
    │   │   ├─ Bill Number (editable)
    │   │   ├─ Start/End Dates
    │   │   ├─ Loan Settings (expandable)
    │   │   └─ Signature (expandable)
    │   └─ Attachments Section
    │
    ├─ [Center Section]
    │   ├─ Donut Chart (Principal vs Interest)
    │   └─ Loan Attributes
    │       ├─ Account Type
    │       ├─ Rate of Interest
    │       ├─ EMI Cycle
    │       └─ Number of EMI
    │
    ├─ [Right Section]
    │   ├─ Financial Summary
    │   │   ├─ Time Duration
    │   │   ├─ Principal Amount
    │   │   ├─ Topup
    │   │   ├─ Interest
    │   │   ├─ Total
    │   │   ├─ Amount Recovered
    │   │   ├─ Amount Left
    │   │   └─ Additional Charges
    │   ├─ Actions: Edit, Transactions, Add Topup
    │   ├─ EMI Details (expandable)
    │   └─ Receipt (downloadable)
    │
    └─ [Bottom Sections]
        ├─ Reminders Section
        │   ├─ Send Reminder button
        │   ├─ Automated Reminders toggle
        │   └─ Request Status cards
        └─ Record Payment button
```

## Flow 5: Generate Report

```
[Reports Page]
    ↓
Click on Report Card (e.g., "Interest Report")
    ↓
[Select Borrower Modal] (if borrower-specific)
    ├─ Search borrowers
    └─ Select borrower
    ↓
[Report Generated]
    ├─ Display report data
    └─ Download button (PDF)
    ↓
[PDF Downloaded]
```

## Flow 6: Manage People

```
[People Page]
    ↓
[Search/Filter People]
    ├─ Search by name/phone
    └─ Filter by status
    ↓
Click on Person Row
    ↓
[Person Details Page]
    ├─ [Profile Card]
    │   ├─ Name, Phone, Address
    │   ├─ Account Number (editable)
    │   ├─ Edit/Delete buttons
    │   └─ Download Report button
    │
    ├─ [Summary Cards]
    │   ├─ Total Lent
    │   ├─ Total Borrowed
    │   └─ Total Loans
    │
    └─ [Loan Accounts Table]
        ├─ List all loans for this person
        └─ Click loan → Navigate to Loan Details
```

## Flow 7: Interest Calculator

```
[Interest Calculator Page]
    ↓
[Enter Details]
    ├─ Enter Amount
    ├─ Rate of Interest
    ├─ Interest Every (dropdown)
    ├─ Check: "Do you want to compound this interest"
    └─ Select: "Days" or "Date Range"
    ↓
Click "Show forecast"
    ↓
[Forecast Display]
    ├─ Chart visualization
    ├─ Interest breakdown
    └─ Total amount calculation
```

## Flow 8: Filter and Search Loans

```
[Loan Accounts Page]
    ↓
[Apply Filters]
    ├─ Search by borrower name/phone
    ├─ Filter by Status (Active, Settled, Deleted, Muted)
    ├─ Filter by Strategy (Fixed Amount, Simple Interest, etc.)
    ├─ Filter by Ownership (Added by me, Added by others)
    └─ Sort by (Most Recent, Amount, etc.)
    ↓
[Filtered Results Displayed]
    ├─ Updated loan count
    └─ Filtered table
    ↓
Click "Clear All" to reset filters
```

## Flow 9: Add Collateral to Existing Loan

```
[Loan Details Page]
    ↓
Scroll to Attachments Section
    ↓
Click "+" or "Add Collateral"
    ↓
[Collateral Details Modal]
    ├─ Product Details
    │   ├─ Product Name
    │   └─ Product Type (dropdown: Gold, Cash Loan, etc.)
    ├─ Purity (if applicable)
    ├─ Enter Weight
    │   ├─ Select Unit: KG, Gram, Mili
    │   └─ Enter value
    ├─ Upload Images
    ├─ Remarks
    └─ Current Valuation (auto-calculated or manual)
    ↓
Click "Add Mortgage"
    ↓
[Collateral Added]
    ↓
[Display in Attachments Section]
```

## Flow 10: Setup Automated Reminders

```
[Loan Details Page]
    ↓
Scroll to Reminders Section
    ↓
Click "Setup automated reminders"
    ↓
[Reminder Configuration Modal]
    ├─ Enable/Disable toggle
    ├─ Frequency (Daily, Weekly, Monthly)
    ├─ Days before due date
    ├─ Message template
    └─ Delivery method (SMS, Email)
    ↓
Click "Save"
    ↓
[Reminders Active]
    └─ Green badge: "Automatic reminders active"
```

## Flow 11: View Transactions

```
[Transactions Page]
    ↓
[Summary Cards Displayed]
    ├─ Total Transactions count
    ├─ Total Amount
    └─ Filtered Results count
    ↓
[Search/Filter]
    ├─ Search transactions
    └─ Apply filters
    ↓
[Transaction Table]
    ├─ Transaction Details (borrower, ID)
    ├─ Amount
    ├─ Type (PAYMENT, etc.)
    ├─ Payment Mode
    ├─ Date
    └─ Actions
    ↓
Click on transaction row
    ↓
[Transaction Details] (if implemented)
```

## Flow 12: Add New Deposit

```
[Deposits Page]
    ↓
Click "+ Add New Deposit"
    ↓
[New Deposit Modal]
    ├─ Name
    ├─ Phone
    ├─ Amount
    ├─ Send every (frequency: Daily, Weekly, Monthly)
    └─ Start date
    ↓
Click "Save"
    ↓
[Deposit Created]
    ↓
[Displayed in Deposits List]
```

## Flow 13: Staff Management

```
[My Staff Page]
    ↓
Click "+ Add staff"
    ↓
[Add Staff Modal]
    ├─ Select role (dropdown)
    ├─ Name
    └─ Phone number
    ↓
Click "Add staff"
    ↓
[Staff Added]
    ↓
[Displayed in Staff List]
```

## Flow 14: Refer & Earn

```
[Refer & Earn Page]
    ↓
[View Referral Code]
    ├─ Display referral code (e.g., "POJ20Z60")
    └─ Total users referred count
    ↓
Click "Invite Friends"
    ↓
[Share Options]
    ├─ Copy referral link
    ├─ Share via WhatsApp
    ├─ Share via Email
    └─ Share via SMS
    ↓
[Friend Signs Up]
    ↓
[Reward Unlocked]
    └─ Free subscription for one month
```

## Flow 15: Delete Loan

```
[Loan Details Page]
    ↓
Click "Loan settings" (expandable)
    ↓
[Loan Settings Sidebar Opens]
    ↓
Click "Delete Loan"
    ↓
[Confirmation Modal]
    ├─ Warning message
    └─ Confirm/Cancel buttons
    ↓
Click "Confirm"
    ↓
[Loan Deleted]
    ↓
[Redirect to Loan Accounts Page]
```

## Navigation Patterns

### Main Navigation
- **Sidebar**: Always visible, purple background
- **Active Item**: Highlighted in lighter purple
- **Sub-items**: Indented under parent (e.g., Lent Accounts, Borrowed Accounts under Loan accounts)

### Breadcrumbs
- Format: `< [Previous Page]`
- Example: `< Loan details`, `< All Loans`

### Modals
- Used for: Forms, Confirmations, Selections
- Close: X button in top-right or Cancel button
- Actions: Primary action button (purple), Secondary action (gray/red)

### Floating Action Buttons
- Position: Bottom-right corner
- Common: "+ Add Loan" button
- Sticky: Remains visible while scrolling

