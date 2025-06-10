import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  users: [],
  selectedUser: null,
  filters: {
    role: null,
    search: '',
    status: 'active', // 'active' | 'inactive' | 'all'
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.users = action.payload;
      state.status = 'succeeded';
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
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
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action) => {
      const index = state.users.findIndex(u => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = {
          ...state.users[index],
          ...action.payload,
        };
      }
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter(u => u.id !== action.payload);
    },
    updateUserStatus: (state, action) => {
      const { userId, status } = action.payload;
      const index = state.users.findIndex(u => u.id === userId);
      if (index !== -1) {
        state.users[index].status = status;
      }
    },
    resetState: () => initialState,
  },
});

export const {
  setUsers,
  setSelectedUser,
  updateFilters,
  setPagination,
  setStatus,
  setError,
  addUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetState,
} = usersSlice.actions;

export default usersSlice.reducer; 