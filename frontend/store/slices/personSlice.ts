import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Person {
  id: string;
  name: string;
  phone: string;
  address?: string;
  accountNo?: string;
}

interface PersonState {
  people: Person[];
  selectedPerson: Person | null;
  loading: boolean;
  filters: {
    search?: string;
    status?: string;
  };
}

const initialState: PersonState = {
  people: [],
  selectedPerson: null,
  loading: false,
  filters: {},
};

const personSlice = createSlice({
  name: 'people',
  initialState,
  reducers: {
    setPeople: (state, action: PayloadAction<Person[]>) => {
      state.people = action.payload;
    },
    setSelectedPerson: (state, action: PayloadAction<Person | null>) => {
      state.selectedPerson = action.payload;
    },
    setFilters: (state, action: PayloadAction<PersonState['filters']>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setPeople, setSelectedPerson, setFilters, setLoading } = personSlice.actions;
export default personSlice.reducer;

