import { api } from '../api';
import { AUTH_ENDPOINTS } from '../../constants/apiEndpoints';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: AUTH_ENDPOINTS.LOGIN,
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: AUTH_ENDPOINTS.REGISTER,
        method: 'POST',
        body: userData,
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: AUTH_ENDPOINTS.PROFILE,
        method: 'GET',
      }),
    }),
    updateProfile: builder.mutation({
      query: (userData) => ({
        url: AUTH_ENDPOINTS.PROFILE,
        method: 'PUT',
        body: userData,
      }),
    }),
    changePassword: builder.mutation({
      query: (passwords) => ({
        url: AUTH_ENDPOINTS.CHANGE_PASSWORD,
        method: 'PUT',
        body: passwords,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi; 