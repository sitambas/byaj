import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Book {
  id: string;
  name: string;
  userId?: string;
  isOwner?: boolean;
  owner?: {
    id: string;
    name: string | null;
    phone: string;
  };
}

interface BookState {
  books: Book[];
  userBranches: Book[];
  selectedBook: Book | null;
  loading: boolean;
}

const initialState: BookState = {
  books: [],
  userBranches: [],
  selectedBook: null,
  loading: false,
};

const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    setBooks: (state, action: PayloadAction<Book[]>) => {
      state.books = action.payload;
    },
    setUserBranches: (state, action: PayloadAction<Book[]>) => {
      state.userBranches = action.payload;
      // Auto-select if only one branch
      if (action.payload.length === 1 && !state.selectedBook) {
        state.selectedBook = action.payload[0];
      }
    },
    setSelectedBook: (state, action: PayloadAction<Book | null>) => {
      state.selectedBook = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setBooks, setUserBranches, setSelectedBook, setLoading } = bookSlice.actions;
export default bookSlice.reducer;

