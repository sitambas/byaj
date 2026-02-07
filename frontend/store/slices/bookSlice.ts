import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Book {
  id: string;
  name: string;
  userId: string;
  owner?: {
    id: string;
    name: string | null;
    phone: string;
  };
}

interface BookState {
  books: Book[];
  selectedBook: Book | null;
  loading: boolean;
}

const initialState: BookState = {
  books: [],
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
    setSelectedBook: (state, action: PayloadAction<Book | null>) => {
      state.selectedBook = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setBooks, setSelectedBook, setLoading } = bookSlice.actions;
export default bookSlice.reducer;

