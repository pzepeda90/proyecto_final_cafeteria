import { api } from '../api';
import { PRODUCT_ENDPOINTS } from '../../constants/apiEndpoints';

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: PRODUCT_ENDPOINTS.BASE,
        method: 'GET',
        params,
      }),
      providesTags: ['Products'],
    }),
    getProductById: builder.query({
      query: (id) => ({
        url: PRODUCT_ENDPOINTS.DETAIL(id),
        method: 'GET',
      }),
      providesTags: ['Product'],
    }),
    createProduct: builder.mutation({
      query: (productData) => ({
        url: PRODUCT_ENDPOINTS.BASE,
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: PRODUCT_ENDPOINTS.DETAIL(id),
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: ['Products', 'Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: PRODUCT_ENDPOINTS.DETAIL(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    addProductImage: builder.mutation({
      query: ({ id, imageData }) => ({
        url: PRODUCT_ENDPOINTS.IMAGES(id),
        method: 'POST',
        body: imageData,
      }),
      invalidatesTags: ['Product'],
    }),
    getProductReviews: builder.query({
      query: (id) => ({
        url: PRODUCT_ENDPOINTS.REVIEWS(id),
        method: 'GET',
      }),
      providesTags: ['Reviews'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddProductImageMutation,
  useGetProductReviewsQuery,
} = productsApi; 