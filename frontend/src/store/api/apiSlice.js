import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../constants/apiEndpoints';

// Slice base para la API
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
  tagTypes: ['Products', 'Orders', 'Users', 'Categories', 'Cart'],
});

// Re-export hooks comunes
export const {
  useQuery,
  useMutation,
  useQuerySubscription,
  useLazyQuery,
} = api; 