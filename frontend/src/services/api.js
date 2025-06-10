import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../constants/apiEndpoints';

// Función para manejar errores de la API
const handleError = (error) => {
  if (error.status === 401) {
    // Aquí podríamos implementar la lógica de refresh token
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return error;
};

// Configuración base de la API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: [
    'User',
    'Products',
    'Product',
    'Categories',
    'Category',
    'Cart',
    'Orders',
    'Order',
    'OrderHistory',
    'Reviews',
    'Sellers',
    'PaymentMethods',
    'OrderStatus',
  ],
}); 