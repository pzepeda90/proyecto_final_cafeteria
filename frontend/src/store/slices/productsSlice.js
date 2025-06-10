import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [],
  categories: [],
  selectedProduct: null,
  selectedCategory: null,
  filters: {
    category: null,
    search: '',
    priceRange: {
      min: 0,
      max: null,
    },
    sortBy: 'name', // 'name', 'price', 'rating'
    sortOrder: 'asc', // 'asc', 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
      state.status = 'succeeded';
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    updateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    setPagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action) => {
      const index = state.products.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(p => p.id !== action.payload);
    },
    addCategory: (state, action) => {
      state.categories.push(action.payload);
    },
    updateCategory: (state, action) => {
      const index = state.categories.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    },
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    resetState: () => initialState,
  },
});

export const {
  setProducts,
  setCategories,
  setSelectedProduct,
  setSelectedCategory,
  updateFilters,
  setPagination,
  setStatus,
  setError,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  updateCategory,
  deleteCategory,
  resetState,
} = productsSlice.actions;

export default productsSlice.reducer; 