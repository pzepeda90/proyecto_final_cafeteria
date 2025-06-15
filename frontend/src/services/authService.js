import axios from 'axios';
import { API_URL } from '../config/api';

// Configuración de axios con interceptores
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/usuarios/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al iniciar sesión' };
    }
  },

  // Registrar usuario
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/usuarios/registro', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al registrar usuario' };
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await axiosInstance.get('/usuarios/verificar');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al verificar token' };
    }
  },

  // Actualizar perfil
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/usuarios/perfil', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar perfil' };
    }
  },

  // Cambiar contraseña
  changePassword: async (passwords) => {
    try {
      const response = await axiosInstance.put('/usuarios/cambiar-password', passwords);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar contraseña' };
    }
  },

  // Recuperar contraseña (solicitud)
  requestPasswordReset: async (email) => {
    try {
      const response = await axiosInstance.post('/usuarios/recuperar-password', {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Error al solicitar recuperación de contraseña',
      };
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axiosInstance.post('/usuarios/restablecer-password', {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        message: 'Error al restablecer contraseña',
      };
    }
  },
};

export default authService; 