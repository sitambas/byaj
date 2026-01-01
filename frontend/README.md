# ByajBook Frontend

Next.js frontend application for ByajBook Loan Management System.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js App Router pages
- `components/` - React components
- `store/` - Redux store and slices
- `services/` - API service layer
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `types/` - TypeScript type definitions

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Redux Toolkit
- React Hook Form
- Axios
- Recharts
