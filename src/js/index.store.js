import { configureStore } from '@reduxjs/toolkit';
import asyncState from '@App/AsyncState/async-state.redux.reducers';
import globe from '@App/Globe/globe.redux.reducers';
import navMenu from '@library/NavMenu/navMenu.redux.reducer';

const store = configureStore({
  reducer: {
    asyncState,
    globe,
    navMenu,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export default store;