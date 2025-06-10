import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import { api } from './api/apiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export default store; 