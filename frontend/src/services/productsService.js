import axios from 'axios';
import { apiCache, CACHE_TTL } from '../utils/cache';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Configurar axios con interceptores
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para añadir token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`🔧 ProductsService Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('❌ ProductsService Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ProductsService Response: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ ProductsService Response Error:', error);
    
    if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Producto no encontrado.');
    }
    
    if (error.response?.status === 400) {
      const mensaje = error.response.data?.mensaje || error.response.data?.message || 'Datos inválidos';
      throw new Error(mensaje);
    }
    
    throw new Error(error.response?.data?.mensaje || error.message || 'Error desconocido');
  }
);

class ProductsService {
  /**
   * Obtener todos los productos con filtros opcionales
   */
  static async getProducts(filters = {}) {
    console.log('🔍 Obteniendo productos con filtros:', filters);
    
    // Generar clave de cache
    const cacheKey = apiCache.generateKey('/productos', filters);
    
    // Intentar obtener del cache
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const params = new URLSearchParams();
    if (filters.categoria_id) params.append('categoria_id', filters.categoria_id);
    if (filters.disponible !== undefined) params.append('disponible', filters.disponible);
    if (filters.vendedor_id) params.append('vendedor_id', filters.vendedor_id);
    if (filters.busqueda) params.append('busqueda', filters.busqueda);
    
    const url = `/productos?${params.toString()}`;
    console.log('📡 Haciendo petición a:', url);
    
    const response = await axiosInstance.get(url);
    console.log('✅ Productos obtenidos:', response.data.length, 'productos');
    
    // Guardar en cache
    apiCache.set(cacheKey, response.data, CACHE_TTL.PRODUCTS);
    
    return response.data;
  }

  /**
   * Obtener un producto por ID
   */
  static async getProductById(id) {
    console.log('🔍 Obteniendo producto por ID:', id);
    const response = await axiosInstance.get(`/productos/${id}`);
    return response.data;
  }

  /**
   * Crear un nuevo producto
   */
  static async createProduct(productData) {
    console.log('➕ Creando producto:', productData);
    
    // Mapear campos del frontend al backend
    const backendData = {
      nombre: productData.nombre || productData.name,
      descripcion: productData.descripcion || productData.description,
      precio: parseFloat(productData.precio || productData.price),
      categoria_id: parseInt(productData.categoria_id || productData.category_id),
      imagen_url: productData.imagen_url || productData.image || productData.image_url,
      stock: parseInt(productData.stock || 0),
      disponible: productData.disponible !== undefined ? productData.disponible : (productData.available !== undefined ? productData.available : true),
      vendedor_id: productData.vendedor_id || 3 // ID del vendedor existente
    };

    console.log('📤 Datos mapeados para backend:', backendData);
    
    const response = await axiosInstance.post('/productos', backendData);
    
    // Invalidar cache después de crear
    this.invalidateProductsCache();
    
    return response.data;
  }

  /**
   * Actualizar un producto existente
   */
  static async updateProduct(id, productData) {
    console.log('📝 Actualizando producto:', id, productData);
    
    // Mapear campos del frontend al backend
    const backendData = {
      nombre: productData.nombre || productData.name,
      descripcion: productData.descripcion || productData.description,
      precio: parseFloat(productData.precio || productData.price),
      categoria_id: parseInt(productData.categoria_id || productData.category_id),
      imagen_url: productData.imagen_url || productData.image || productData.image_url,
      stock: parseInt(productData.stock || 0),
      disponible: productData.disponible !== undefined ? productData.disponible : (productData.available !== undefined ? productData.available : true)
    };

    console.log('📤 Datos de actualización mapeados:', backendData);
    
    const response = await axiosInstance.put(`/productos/${id}`, backendData);
    
    // Invalidar cache después de actualizar
    this.invalidateProductsCache();
    
    return response.data;
  }

  /**
   * Eliminar un producto
   */
  static async deleteProduct(id) {
    console.log('🗑️ Eliminando producto:', id);
    const response = await axiosInstance.delete(`/productos/${id}`);
    
    // Invalidar cache después de eliminar
    this.invalidateProductsCache();
    
    return response.data;
  }

  /**
   * Obtener categorías para el formulario
   */
  static async getCategories() {
    console.log('📂 Obteniendo categorías');
    
    // Generar clave de cache
    const cacheKey = apiCache.generateKey('/categorias');
    
    // Intentar obtener del cache
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    const response = await axiosInstance.get('/categorias');
    
    // Guardar en cache (categorías son muy estables)
    apiCache.set(cacheKey, response.data, CACHE_TTL.CATEGORIES);
    
    return response.data;
  }

  /**
   * Invalidar cache de productos (llamar después de crear/actualizar/eliminar)
   */
  static invalidateProductsCache() {
    console.log('🔄 Invalidando cache de productos');
    apiCache.invalidatePattern('/productos');
  }
}

export default ProductsService; 