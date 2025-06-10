import { createSlice } from '@reduxjs/toolkit';
import { ORDER_STATUS } from '../../constants/orderStatus';

const initialState = {
  orders: [
    {
      id: 1,
      date: '2024-03-15',
      status: 'Entregado',
      total: 125500,
      items: [
        { id: 1, name: 'Espresso Clásico', quantity: 2, price: 2500, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400' },
        { id: 4, name: 'Cheesecake New York', quantity: 1, price: 5500, image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=400' },
      ],
      shippingAddress: 'Calle Principal 123, Ciudad',
      paymentMethod: 'Tarjeta de crédito',
      notes: 'Entregar en recepción'
    },
    {
      id: 2,
      date: '2024-03-14',
      status: 'En Proceso',
      total: 85000,
      items: [
        { id: 7, name: 'Tostadas Francesas', quantity: 2, price: 8500, image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?q=80&w=400' },
        { id: 11, name: 'Limonada de Fresa', quantity: 3, price: 4500, image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=400' },
      ],
      shippingAddress: 'Avenida Central 456, Ciudad',
      paymentMethod: 'Efectivo',
      notes: 'Sin azúcar en la limonada'
    },
    {
      id: 3,
      date: '2024-03-13',
      status: 'Cancelado',
      total: 45000,
      items: [
        { id: 2, name: 'Cappuccino Italiano', quantity: 2, price: 3500, image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=400' },
        { id: 5, name: 'Brownie con Helado', quantity: 1, price: 6000, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400' },
      ],
      shippingAddress: 'Plaza Mayor 789, Ciudad',
      paymentMethod: 'Tarjeta de débito',
      notes: 'Cancelado por el cliente'
    }
  ],
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