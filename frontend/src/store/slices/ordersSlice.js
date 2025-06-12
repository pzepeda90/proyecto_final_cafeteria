import { createSlice } from '@reduxjs/toolkit';
import { ORDER_STATUS } from '../../constants/orderStatus';

const initialState = {
  orders: [],
  selectedOrder: null,
  filters: {
    status: null,
    dateRange: {
      start: null,
      end: null,
    },
    search: '',
    userId: null,
    vendorId: null,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  statistics: {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    ordersByStatus: {},
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.orders = action.payload;
      state.status = 'succeeded';
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
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
    setStatistics: (state, action) => {
      state.statistics = {
        ...state.statistics,
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
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action) => {
      const index = state.orders.findIndex(o => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = {
          ...state.orders[index],
          ...action.payload,
        };
      }
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        order.status = status;
      }
    },
    deleteOrder: (state, action) => {
      state.orders = state.orders.filter(o => o.id !== action.payload);
      if (state.selectedOrder?.id === action.payload) {
        state.selectedOrder = null;
      }
    },
    resetState: () => initialState,
    setOrdersStatus: (state, action) => {
      state.status = action.payload;
    },
    setOrdersError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    }
  },
});

export const {
  setOrders,
  setSelectedOrder,
  updateFilters,
  setPagination,
  setStatistics,
  setStatus,
  setError,
  addOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  resetState,
  setOrdersStatus,
  setOrdersError
} = ordersSlice.actions;

export const selectAllOrders = (state) => state.orders.orders;
export const selectOrderById = (state, orderId) => 
  state.orders.orders.find(order => order.id === orderId);
export const selectOrdersStatus = (state) => state.orders.status;
export const selectOrdersError = (state) => state.orders.error;

export default ordersSlice.reducer; 