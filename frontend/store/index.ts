import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import bookSlice from './slices/bookSlice';
import loanSlice from './slices/loanSlice';
import personSlice from './slices/personSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    book: bookSlice,
    loans: loanSlice,
    people: personSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

