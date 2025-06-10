import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
  quantity: 0,
  shippingAddress: null,
  paymentMethod: null,
  notes: '',
  userId: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  allCarts: [], // Para admin y vendedores
};

// Función auxiliar para calcular totales
const calculateTotals = (items) => {
  return items.reduce(
    (acc, item) => {
      const itemTotal = item.price * item.quantity;
      return {
        total: acc.total + itemTotal,
        quantity: acc.quantity + item.quantity,
      };
    },
    { total: 0, quantity: 0 }
  );
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { id, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ ...action.payload, quantity });
      }

      const totals = calculateTotals(state.items);
      state.total = totals.total;
      state.quantity = totals.quantity;
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      const totals = calculateTotals(state.items);
      state.total = totals.total;
      state.quantity = totals.quantity;
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item) {
        item.quantity = quantity;
        const totals = calculateTotals(state.items);
        state.total = totals.total;
        state.quantity = totals.quantity;
      }
    },
    setShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setNotes: (state, action) => {
      state.notes = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.quantity = 0;
      state.shippingAddress = null;
      state.paymentMethod = null;
      state.notes = '';
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setAllCarts: (state, action) => {
      state.allCarts = action.payload;
    },
    addCart: (state, action) => {
      state.allCarts.push(action.payload);
    },
    updateCart: (state, action) => {
      const index = state.allCarts.findIndex(cart => cart.id === action.payload.id);
      if (index !== -1) {
        state.allCarts[index] = action.payload;
      }
    },
    deleteCart: (state, action) => {
      state.allCarts = state.allCarts.filter(cart => cart.id !== action.payload);
    },
    resetState: () => initialState,
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setShippingAddress,
  setPaymentMethod,
  setNotes,
  clearCart,
  setStatus,
  setError,
  setUserId,
  setAllCarts,
  addCart,
  updateCart,
  deleteCart,
  resetState,
} = cartSlice.actions;

export default cartSlice.reducer; 