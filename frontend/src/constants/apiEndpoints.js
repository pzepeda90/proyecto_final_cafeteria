// Base URL de la API
export const API_BASE_URL = process.env.NODE_ENV === 'test' 
  ? process.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  : import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
// El mock para los tests se debe crear en __mocks__ o setupEnv.js

// Endpoints de Autenticación
export const AUTH_ENDPOINTS = {
  /**
   * POST /usuarios/login
   * Request: { email: string, password: string }
   * Response: { token: string, user: { id: number, nombre: string, email: string, role: string } }
   */
  LOGIN: '/usuarios/login',

  /**
   * POST /usuarios/registro
   * Request: { nombre: string, email: string, password: string, role: string }
   * Response: { message: string, user: { id: number, nombre: string, email: string, role: string } }
   */
  REGISTER: '/usuarios/registro',

  /**
   * GET /usuarios/perfil
   * Headers: { Authorization: Bearer token }
   * Response: { id: number, nombre: string, email: string, role: string }
   */
  PROFILE: '/usuarios/perfil',

  /**
   * PUT /usuarios/cambiar-password
   * Headers: { Authorization: Bearer token }
   * Request: { currentPassword: string, newPassword: string }
   * Response: { message: string }
   */
  CHANGE_PASSWORD: '/usuarios/cambiar-password',
};

// Endpoints de Usuarios
export const USER_ENDPOINTS = {
  ADDRESSES: '/usuarios/direcciones',
  ADDRESS: (id) => `/usuarios/direcciones/${id}`,
  SET_MAIN_ADDRESS: (id) => `/usuarios/direcciones/${id}/principal`,
};

// Endpoints de Productos
export const PRODUCT_ENDPOINTS = {
  BASE: '/productos',
  DETAIL: (id) => `/productos/${id}`,
  IMAGES: (id) => `/productos/${id}/imagenes`,
  REVIEWS: (id) => `/productos/${id}/reseñas`,
};

// Endpoints de Categorías
export const CATEGORY_ENDPOINTS = {
  BASE: '/categorias',
  DETAIL: (id) => `/categorias/${id}`,
};

// Endpoints de Vendedores
export const SELLER_ENDPOINTS = {
  BASE: '/vendedores',
  DETAIL: (id) => `/vendedores/${id}`,
};

// Endpoints de Carrito
export const CART_ENDPOINTS = {
  BASE: '/carritos',
  ADD: '/carritos/agregar',
  UPDATE: '/carritos/actualizar',
  REMOVE: (productId) => `/carritos/producto/${productId}`,
  CLEAR: '/carritos/vaciar',
};

// Endpoints de Pedidos
export const ORDER_ENDPOINTS = {
  BASE: '/pedidos',
  DETAIL: (id) => `/pedidos/${id}`,
  HISTORY: (id) => `/pedidos/${id}/historial`,
  UPDATE_STATUS: (id) => `/pedidos/${id}/estado`,
};

// Endpoints de Métodos de Pago
export const PAYMENT_METHOD_ENDPOINTS = {
  BASE: '/metodos-pago',
  DETAIL: (id) => `/metodos-pago/${id}`,
};

// Endpoints de Estados de Pedido
export const ORDER_STATUS_ENDPOINTS = {
  BASE: '/estados-pedido',
  DETAIL: (id) => `/estados-pedido/${id}`,
};

// Endpoints de Reseñas
export const REVIEW_ENDPOINTS = {
  BASE: '/reseñas',
  DETAIL: (id) => `/reseñas/${id}`,
}; 