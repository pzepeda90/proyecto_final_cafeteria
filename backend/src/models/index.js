// Importar todos los modelos desde el directorio ORM
const {
  sequelize,
  Usuario,
  Rol,
  UsuarioRol,
  Vendedor,
  Categoria,
  Producto,
  ImagenProducto,
  Direccion,
  Carrito,
  DetalleCarrito,
  Pedido,
  DetallePedido,
  MetodoPago,
  EstadoPedido,
  HistorialEstadoPedido,
  Resena,
  Mesa
} = require('./orm');

// Para mantener compatibilidad con el modelo Product anterior
const Product = require('./product')(sequelize);

module.exports = {
  sequelize,
  Usuario,
  Rol,
  UsuarioRol,
  Vendedor,
  Categoria,
  Producto,
  Product, // Mantener para compatibilidad
  ImagenProducto,
  Direccion,
  Carrito,
  DetalleCarrito,
  Pedido,
  DetallePedido,
  MetodoPago,
  EstadoPedido,
  HistorialEstadoPedido,
  Resena,
  Mesa
}; 