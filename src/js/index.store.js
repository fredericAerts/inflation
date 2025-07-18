import { configureStore } from '@reduxjs/toolkit';
import asyncState from '@App/AsyncState/async-state.redux.reducers';

const store = configureStore({
  reducer: {
    asyncState,
  },
});

export default store;