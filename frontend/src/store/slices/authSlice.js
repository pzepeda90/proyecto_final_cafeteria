import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    startLoading: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.status = 'succeeded';
      state.error = null;
      state.isAuthenticated = true;
      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    loginFailure: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
      state.isAuthenticated = false;
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    registerSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.status = 'succeeded';
      state.error = null;
      state.isAuthenticated = true;
      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    registerFailure: (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      state.isAuthenticated = false;
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Actualizar localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearError: (state) => {
      state.error = null;
      state.status = 'idle';
    },
    // Restaurar sesión desde localStorage
    restoreSession: (state) => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        state.token = token;
        state.user = JSON.parse(user);
        state.isAuthenticated = true;
        state.status = 'succeeded';
      }
    },
  },
});

// Exportar acciones
export const {
  startLoading,
  loginSuccess,
  loginFailure,
  registerSuccess,
  registerFailure,
  logout,
  updateProfile,
  clearError,
  restoreSession,
} = authSlice.actions;

// Selectores
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer; 