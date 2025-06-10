/**
 * Constantes para la aplicación
 */

module.exports = {
  // Constantes para paginación
  ELEMENTOS_POR_PAGINA: 10,
  PAGINA_DEFAULT: 1,
  
  // Constantes para ordenamiento
  CAMPO_ORDEN_DEFAULT: 'created_at',
  DIRECCION_ORDEN_DEFAULT: 'DESC',
  
  // Constantes para usuarios
  ROL_ADMIN: 'admin',
  ROL_USUARIO: 'usuario',
  ROL_VENDEDOR: 'vendedor',
  
  // Constantes para pedidos
  ESTADO_PEDIDO_NUEVO: 1,
  ESTADO_PEDIDO_PROCESANDO: 2,
  ESTADO_PEDIDO_ENVIADO: 3,
  ESTADO_PEDIDO_ENTREGADO: 4,
  ESTADO_PEDIDO_CANCELADO: 5,
  
  // Constantes para carrito
  CANTIDAD_MINIMA: 1,
  CANTIDAD_MAXIMA: 10,
  
  // Constantes para seguridad
  TOKEN_EXPIRACION: '24h'
}; 