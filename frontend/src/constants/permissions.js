// Permisos del sistema
export const PERMISSIONS = {
  // Permisos de Productos
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_OWN_PRODUCTS: 'manage_own_products',
  VIEW_PRODUCTS: 'view_products',

  // Permisos de Categorías
  MANAGE_CATEGORIES: 'manage_categories',

  // Permisos de Vendedores
  MANAGE_SELLERS: 'manage_sellers',

  // Permisos de Pedidos
  MANAGE_ORDERS: 'manage_orders',
  VIEW_ALL_ORDERS: 'view_all_orders',
  VIEW_OWN_ORDERS: 'view_own_orders',
  UPDATE_ORDER_STATUS: 'update_order_status',
  UPDATE_OWN_ORDER_STATUS: 'update_own_order_status',

  // Permisos de Métodos de Pago
  MANAGE_PAYMENT_METHODS: 'manage_payment_methods',

  // Permisos de Estados de Pedido
  MANAGE_ORDER_STATUS: 'manage_order_status',

  // Permisos de Cliente
  MANAGE_CART: 'manage_cart',
  PLACE_ORDERS: 'place_orders',
  MANAGE_PROFILE: 'manage_profile',
  MANAGE_ADDRESSES: 'manage_addresses',
  CREATE_REVIEWS: 'create_reviews',
};

// Grupos de permisos por funcionalidad
export const PERMISSION_GROUPS = {
  PRODUCTS: [
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_OWN_PRODUCTS,
    PERMISSIONS.VIEW_PRODUCTS,
  ],
  ORDERS: [
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_ALL_ORDERS,
    PERMISSIONS.VIEW_OWN_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.UPDATE_OWN_ORDER_STATUS,
  ],
  CUSTOMER: [
    PERMISSIONS.MANAGE_CART,
    PERMISSIONS.PLACE_ORDERS,
    PERMISSIONS.MANAGE_PROFILE,
    PERMISSIONS.MANAGE_ADDRESSES,
    PERMISSIONS.CREATE_REVIEWS,
  ],
}; 