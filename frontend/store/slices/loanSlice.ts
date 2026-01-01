import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Loan {
  id: string;
  billNumber: string;
  personId: string;
  principalAmount: number;
  interestRate: number;
  status: string;
  strategy: string;
}

interface LoanState {
  loans: Loan[];
  selectedLoan: Loan | null;
  loading: boolean;
  filters: {
    status?: string;
    strategy?: string;
    search?: string;
  };
}

const initialState: LoanState = {
  loans: [],
  selectedLoan: null,
  loading: false,
  filters: {},
};

const loanSlice = createSlice({
  name: 'loans',
  initialState,
  reducers: {
    setLoans: (state, action: PayloadAction<Loan[]>) => {
      state.loans = action.payload;
    },
    setSelectedLoan: (state, action: PayloadAction<Loan | null>) => {
      state.selectedLoan = action.payload;
    },
    setFilters: (state, action: PayloadAction<LoanState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setLoans, setSelectedLoan, setFilters, setLoading } = loanSlice.actions;
export default loanSlice.reducer;

