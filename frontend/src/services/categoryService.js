import axios from 'axios';
import { API_URL } from '../config/api';

// Configuración directa como ordersService que funciona
const categoriesAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
categoriesAPI.interceptors.request.use(
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

// Interceptor para manejar respuestas
categoriesAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token ha expirado o no es válido, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

const categoryService = {
  // Obtener todas las categorías
  async getCategories() {
    try {
      const response = await categoriesAPI.get('/categorias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener las categorías:', error);
      throw error;
    }
  },

  // Obtener categoría por ID
  async getCategoryById(id) {
    try {
      const response = await categoriesAPI.get(`/categorias/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener la categoría:', error);
      throw error;
    }
  }
};

export default categoryService; 