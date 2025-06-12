const sequelize = require('../sequelize');
const Usuario = require('./usuario.orm');
const Rol = require('./rol.orm');
const UsuarioRol = require('./usuario_rol.orm');
const Vendedor = require('./vendedor.orm');
const Categoria = require('./categoria.orm');
const Producto = require('./producto.orm');
const ImagenProducto = require('./imagen_producto.orm');
const Direccion = require('./direccion.orm');
const Carrito = require('./carrito.orm');
const DetalleCarrito = require('./detalle_carrito.orm');
const Pedido = require('./pedido.orm');
const DetallePedido = require('./detalle_pedido.orm');
const MetodoPago = require('./metodo_pago.orm');
const EstadoPedido = require('./estado_pedido.orm');
const HistorialEstadoPedido = require('./historial_estado_pedido.orm');
const Resena = require('./resena.orm');
const Mesa = require('./mesa.orm');

// Relaciones Usuario-Rol (N:M)
Usuario.belongsToMany(Rol, { 
  through: UsuarioRol, 
  foreignKey: 'usuario_id',
  otherKey: 'rol_id'
});
Rol.belongsToMany(Usuario, { 
  through: UsuarioRol, 
  foreignKey: 'rol_id',
  otherKey: 'usuario_id'
});

// Relación Usuario-Dirección (1:N)
Usuario.hasMany(Direccion, { 
  foreignKey: 'usuario_id',
  onDelete: 'CASCADE'
});
Direccion.belongsTo(Usuario, { 
  foreignKey: 'usuario_id'
});

// Relación Usuario-Carrito (1:1)
Usuario.hasOne(Carrito, { 
  foreignKey: 'usuario_id',
  onDelete: 'CASCADE'
});
Carrito.belongsTo(Usuario, { 
  foreignKey: 'usuario_id'
});

// Relación Carrito-DetalleCarrito (1:N)
Carrito.hasMany(DetalleCarrito, { 
  foreignKey: 'carrito_id',
  onDelete: 'CASCADE'
});
DetalleCarrito.belongsTo(Carrito, { 
  foreignKey: 'carrito_id'
});

// Relación Producto-DetalleCarrito (1:N)
Producto.hasMany(DetalleCarrito, { 
  foreignKey: 'producto_id'
});
DetalleCarrito.belongsTo(Producto, { 
  foreignKey: 'producto_id'
});

// Relación Producto-ImagenProducto (1:N)
Producto.hasMany(ImagenProducto, { 
  foreignKey: 'producto_id',
  onDelete: 'CASCADE'
});
ImagenProducto.belongsTo(Producto, { 
  foreignKey: 'producto_id'
});

// Relación Producto-Resena (1:N)
Producto.hasMany(Resena, { 
  foreignKey: 'producto_id',
  onDelete: 'CASCADE'
});
Resena.belongsTo(Producto, { 
  foreignKey: 'producto_id'
});

// Relación Usuario-Resena (1:N)
Usuario.hasMany(Resena, { 
  foreignKey: 'usuario_id'
});
Resena.belongsTo(Usuario, { 
  foreignKey: 'usuario_id'
});

// Relación Pedido-DetallePedido (1:N)
Pedido.hasMany(DetallePedido, { 
  foreignKey: 'pedido_id',
  onDelete: 'CASCADE'
});
DetallePedido.belongsTo(Pedido, { 
  foreignKey: 'pedido_id'
});

// Relación Producto-DetallePedido (1:N)
Producto.hasMany(DetallePedido, { 
  foreignKey: 'producto_id'
});
DetallePedido.belongsTo(Producto, { 
  foreignKey: 'producto_id'
});

// Relación Pedido-HistorialEstadoPedido (1:N)
Pedido.hasMany(HistorialEstadoPedido, { 
  foreignKey: 'pedido_id',
  onDelete: 'CASCADE'
});
HistorialEstadoPedido.belongsTo(Pedido, { 
  foreignKey: 'pedido_id'
});

// Relación EstadoPedido-HistorialEstadoPedido (1:N)
EstadoPedido.hasMany(HistorialEstadoPedido, { 
  foreignKey: 'estado_pedido_id'
});
HistorialEstadoPedido.belongsTo(EstadoPedido, { 
  foreignKey: 'estado_pedido_id'
});

// Relación Categoria-Producto (1:N)
Categoria.hasMany(Producto, { 
  foreignKey: 'categoria_id'
});
Producto.belongsTo(Categoria, { 
  foreignKey: 'categoria_id'
});

// Relación Vendedor-Producto (1:N)
Vendedor.hasMany(Producto, { 
  foreignKey: 'vendedor_id'
});
Producto.belongsTo(Vendedor, { 
  foreignKey: 'vendedor_id'
});

module.exports = {
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
}; 