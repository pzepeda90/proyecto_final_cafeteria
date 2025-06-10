const UsuarioService = require('./usuario.service');
const ProductoService = require('./producto.service');
const CategoriaService = require('./categoria.service');
const VendedorService = require('./vendedor.service');
const DireccionService = require('./direccion.service');
const CarritoService = require('./carrito.service');
const DetalleCarritoService = require('./detalle_carrito.service');
const PedidoService = require('./pedido.service');
const DetallePedidoService = require('./detalle_pedido.service');
const MetodoPagoService = require('./metodo_pago.service');
const EstadoPedidoService = require('./estado_pedido.service');
const HistorialEstadoPedidoService = require('./historial_estado_pedido.service');
const ImagenProductoService = require('./imagen_producto.service');
const ResenaService = require('./resena.service');
const RolService = require('./rol.service');

module.exports = {
  UsuarioService,
  ProductoService,
  CategoriaService,
  VendedorService,
  DireccionService,
  CarritoService,
  DetalleCarritoService,
  PedidoService,
  DetallePedidoService,
  MetodoPagoService,
  EstadoPedidoService,
  HistorialEstadoPedidoService,
  ImagenProductoService,
  ResenaService,
  RolService
}; 