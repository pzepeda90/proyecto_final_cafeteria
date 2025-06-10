import { api } from '../api';
import { ORDER_ENDPOINTS } from '../../constants/apiEndpoints';

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: (params) => ({
        url: ORDER_ENDPOINTS.BASE,
        method: 'GET',
        params,
      }),
      providesTags: ['Orders'],
    }),
    getOrderById: builder.query({
      query: (id) => ({
        url: ORDER_ENDPOINTS.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: ORDER_ENDPOINTS.BASE,
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders', 'Cart'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...statusData }) => ({
        url: ORDER_ENDPOINTS.UPDATE_STATUS(id),
        method: 'PUT',
        body: statusData,
      }),
      invalidatesTags: ['Orders', 'Order'],
    }),
    getOrderHistory: builder.query({
      query: (id) => ({
        url: ORDER_ENDPOINTS.HISTORY(id),
        method: 'GET',
      }),
      providesTags: ['OrderHistory'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetOrderHistoryQuery,
} = ordersApi; 