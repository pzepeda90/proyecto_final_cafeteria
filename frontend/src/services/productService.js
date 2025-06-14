import axios from 'axios';

// Configuración directa como ordersService que funciona
const productsAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
productsAPI.interceptors.request.use(
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
productsAPI.interceptors.response.use(
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

const productService = {
  // Obtener todos los productos
  async getProducts() {
    try {
      const response = await productsAPI.get('/productos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      throw error;
    }
  },

  // Obtener producto por ID
  async getProductById(id) {
    try {
      const response = await productsAPI.get(`/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener el producto:', error);
      throw error;
    }
  },

  // Alias para compatibilidad
  async obtenerProducto(id) {
    return this.getProductById(id);
  },

  // Obtener productos por categoría
  async getProductsByCategory(categoryId) {
    try {
      const response = await productsAPI.get(`/productos?categoria=${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener los productos por categoría:', error);
      throw error;
    }
  },

  // Buscar productos
  async searchProducts(query) {
    try {
      const response = await productsAPI.get(`/productos?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw error;
    }
  }
};

// Exportar tanto el objeto como funciones individuales para compatibilidad
export const { getProducts, getProductById, getProductsByCategory, searchProducts } = productService;
export default productService; 