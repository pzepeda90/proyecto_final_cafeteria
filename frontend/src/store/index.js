import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from '../services/api';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import usersReducer from './slices/usersSlice';
import ordersReducer from './slices/ordersSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    products: productsReducer,
    users: usersReducer,
    orders: ordersReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorar acciones específicas o paths que contengan datos no serializables
        ignoredActions: ['auth/loginSuccess'],
        ignoredPaths: ['auth.user.token'],
      },
    }).concat(api.middleware),
});

setupListeners(store.dispatch);

export default store; 