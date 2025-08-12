import { configureStore } from '@reduxjs/toolkit';
import asyncState from '@App/AsyncState/async-state.redux.reducers';
import globe from '@App/Globe/globe.redux.reducers';

const store = configureStore({
  reducer: {
    asyncState,
    globe,
  },
});

export default store;