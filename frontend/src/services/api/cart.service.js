import { api } from '../api';
import { CART_ENDPOINTS } from '../../constants/apiEndpoints';

export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener carrito del usuario actual
    getCart: builder.query({
      query: () => ({
        url: CART_ENDPOINTS.BASE,
        method: 'GET',
      }),
      providesTags: ['Cart'],
    }),

    // Obtener todos los carritos (admin y vendedor)
    getAllCarts: builder.query({
      query: (params) => ({
        url: `${CART_ENDPOINTS.BASE}/all`,
        method: 'GET',
        params,
      }),
      providesTags: ['Carts'],
    }),

    // Obtener carrito por ID de usuario
    getCartByUserId: builder.query({
      query: (userId) => ({
        url: `${CART_ENDPOINTS.BASE}/user/${userId}`,
        method: 'GET',
      }),
      providesTags: ['Cart'],
    }),

    addToCart: builder.mutation({
      query: (cartItem) => ({
        url: CART_ENDPOINTS.ADD,
        method: 'POST',
        body: cartItem,
      }),
      invalidatesTags: ['Cart', 'Carts'],
    }),

    updateCartItem: builder.mutation({
      query: ({ cartId, ...cartItem }) => ({
        url: `${CART_ENDPOINTS.UPDATE}/${cartId}`,
        method: 'PUT',
        body: cartItem,
      }),
      invalidatesTags: ['Cart', 'Carts'],
    }),

    removeFromCart: builder.mutation({
      query: ({ cartId, productId }) => ({
        url: CART_ENDPOINTS.REMOVE(productId),
        method: 'DELETE',
        body: { cartId },
      }),
      invalidatesTags: ['Cart', 'Carts'],
    }),

    clearCart: builder.mutation({
      query: (cartId) => ({
        url: `${CART_ENDPOINTS.CLEAR}/${cartId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart', 'Carts'],
    }),
  }),
});

export const {
  useGetCartQuery,
  useGetAllCartsQuery,
  useGetCartByUserIdQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi; 