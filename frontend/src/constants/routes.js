import { ROLES } from './roles';

// Rutas públicas
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_REVIEWS: '/products/:id/resenas',
  ABOUT: '/about',
  CONTACT: '/contact',
};

// Rutas privadas por rol
export const PRIVATE_ROUTES = {
  // Rutas comunes para todos los roles
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PRODUCTS: '/products',
  SETTINGS: '/settings',
  CART: '/cart',
  
  // Rutas específicas para ADMIN
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ORDERS: '/admin/orders',
    PRODUCTS: '/admin/products',
    NEW_PRODUCT: '/admin/products/new',
    EDIT_PRODUCT: (id = ':id') => `/admin/products/${id}/edit`,
    USERS: '/admin/users',
  },

  // Rutas específicas para VENDEDOR
  [ROLES.VENDEDOR]: {
    MY_PRODUCTS: '/seller/products',
    MY_ORDERS: '/seller/orders',
    POS: '/seller/pos',
  },

  // Rutas específicas para CLIENTE
  CLIENTE: {
    MY_ORDERS: '/my-orders',
    MY_ADDRESSES: '/addresses',
    MY_REVIEWS: '/reviews',
  },
};

// Funciones helper para generar rutas dinámicas
export const ROUTE_GENERATORS = {
  PRODUCT_REVIEWS: (id) => `/products/${id}/resenas`,
};

// Rutas por defecto según rol
export const DEFAULT_ROUTES_BY_ROLE = {
  [ROLES.ADMIN]: PRIVATE_ROUTES.ADMIN.PRODUCTS,
  [ROLES.VENDEDOR]: PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS,
  [ROLES.CLIENTE]: PRIVATE_ROUTES.DASHBOARD,
}; 