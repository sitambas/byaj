// Loan category configuration
// Add new loan types here to make them available throughout the application

export const LOAN_CATEGORIES = {
  PERSONAL_LOAN: 'Personal Loan',
  MOBILE_LOAN: 'Mobile Loan',
  TV_LOAN: 'TV Loan',
  // Add more loan types here as needed
  // Example:
  // GOLD_LOAN: 'Gold Loan',
  // VEHICLE_LOAN: 'Vehicle Loan',
} as const;

export type LoanCategoryKey = keyof typeof LOAN_CATEGORIES;

export const getLoanCategoryLabel = (categoryKey: string): string => {
  return LOAN_CATEGORIES[categoryKey as LoanCategoryKey] || categoryKey;
};

export const getLoanCategoryFromRemarks = (remarks: string | null | undefined): string => {
  if (!remarks) return 'N/A';
  const categoryMatch = remarks.match(/Loan Category:\s*(\w+)/);
  if (categoryMatch) {
    return getLoanCategoryLabel(categoryMatch[1]);
  }
  return 'N/A';
};

