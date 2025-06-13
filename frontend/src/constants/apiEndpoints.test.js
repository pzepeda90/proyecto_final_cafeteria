// Base URL de la API para tests
export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Endpoints de Autenticación
export const AUTH_ENDPOINTS = {
  LOGIN: '/usuarios/login',
  REGISTER: '/usuarios/registro',
  PROFILE: '/usuarios/perfil',
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

// Tests
describe('API Endpoints', () => {
  describe('API_BASE_URL', () => {
    it('debería tener un valor por defecto', () => {
      expect(API_BASE_URL).toBe('http://localhost:3000/api');
    });
  });

  describe('AUTH_ENDPOINTS', () => {
    it('debería tener todos los endpoints de autenticación', () => {
      expect(AUTH_ENDPOINTS).toEqual({
        LOGIN: '/usuarios/login',
        REGISTER: '/usuarios/registro',
        PROFILE: '/usuarios/perfil',
        CHANGE_PASSWORD: '/usuarios/cambiar-password'
      });
    });
  });

  describe('USER_ENDPOINTS', () => {
    it('debería tener todos los endpoints de usuarios', () => {
      expect(USER_ENDPOINTS).toEqual({
        ADDRESSES: '/usuarios/direcciones',
        ADDRESS: expect.any(Function),
        SET_MAIN_ADDRESS: expect.any(Function)
      });
    });

    it('debería generar correctamente la URL para una dirección específica', () => {
      const id = 123;
      expect(USER_ENDPOINTS.ADDRESS(id)).toBe('/usuarios/direcciones/123');
    });

    it('debería generar correctamente la URL para establecer dirección principal', () => {
      const id = 123;
      expect(USER_ENDPOINTS.SET_MAIN_ADDRESS(id)).toBe('/usuarios/direcciones/123/principal');
    });
  });

  describe('PRODUCT_ENDPOINTS', () => {
    it('debería tener todos los endpoints de productos', () => {
      expect(PRODUCT_ENDPOINTS).toEqual({
        BASE: '/productos',
        DETAIL: expect.any(Function),
        IMAGES: expect.any(Function),
        REVIEWS: expect.any(Function)
      });
    });

    it('debería generar correctamente la URL para un producto específico', () => {
      const id = 123;
      expect(PRODUCT_ENDPOINTS.DETAIL(id)).toBe('/productos/123');
    });

    it('debería generar correctamente la URL para las imágenes de un producto', () => {
      const id = 123;
      expect(PRODUCT_ENDPOINTS.IMAGES(id)).toBe('/productos/123/imagenes');
    });

    it('debería generar correctamente la URL para las reseñas de un producto', () => {
      const id = 123;
      expect(PRODUCT_ENDPOINTS.REVIEWS(id)).toBe('/productos/123/reseñas');
    });
  });

  describe('CART_ENDPOINTS', () => {
    it('debería tener todas las rutas del carrito', () => {
      expect(CART_ENDPOINTS.BASE).toBe('/carritos');
      expect(CART_ENDPOINTS.ADD).toBe('/carritos/agregar');
      expect(CART_ENDPOINTS.UPDATE).toBe('/carritos/actualizar');
      expect(CART_ENDPOINTS.REMOVE(1)).toBe('/carritos/producto/1');
      expect(CART_ENDPOINTS.CLEAR).toBe('/carritos/vaciar');
    });
  });
}); 