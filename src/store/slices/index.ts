import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExampleState {
  exampleValue: string;
}

const initialState: ExampleState = {
  exampleValue: '',
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    setExampleValue(state, action: PayloadAction<string>) {
      state.exampleValue = action.payload;
    },
  },
});

export const { setExampleValue } = exampleSlice.actions;
export default exampleSlice.reducer;