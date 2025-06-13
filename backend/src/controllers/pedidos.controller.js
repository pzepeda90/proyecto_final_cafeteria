const PedidoService = require('../services/pedido.service');
const CarritoService = require('../services/carrito.service');
const DireccionService = require('../services/direccion.service');
const UsuarioService = require('../services/usuario.service');
const Joi = require('joi');

// Obtener todos los pedidos
const obtenerPedidos = async (req, res) => {
  try {
    const usuario = await UsuarioService.findById(req.usuario.id);
    let options = {};
    
    // Si es cliente, solo ver sus pedidos
    if (!usuario || !usuario.Roles || !usuario.Roles.some(rol => rol.nombre === 'admin')) {
      options.usuario_id = req.usuario.id;
    }
    
    // Filtros adicionales
    if (req.query.estado_pedido_id) {
      options.estado_pedido_id = req.query.estado_pedido_id;
    }
    
    if (req.query.fecha_inicio && req.query.fecha_fin) {
      options.fecha_inicio = req.query.fecha_inicio;
      options.fecha_fin = req.query.fecha_fin;
    }
    
    const pedidos = await PedidoService.findAll(options);
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos' });
  }
};

// Obtener un pedido por ID
const obtenerPedidoPorId = async (req, res) => {
  const { id } = req.params;
  
  try {
    const pedido = await PedidoService.findById(id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    // Verificar permisos (solo admin o el dueño del pedido)
    const usuario = await UsuarioService.findById(req.usuario.id);
    
    if (!usuario || !usuario.Roles || (!usuario.Roles.some(rol => rol.nombre === 'admin') && pedido.usuario_id !== req.usuario.id)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este pedido' });
    }
    
    res.json(pedido);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ mensaje: 'Error al obtener pedido' });
  }
};

// Crear nuevo pedido
const crearPedido = async (req, res, next) => {
  try {
    const schema = Joi.object({
      metodo_pago_id: Joi.number().integer().required(),
      direccion_id: Joi.number().integer().allow(null).optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { metodo_pago_id, direccion_id } = req.body;
    
    // Obtener el carrito del usuario
    const carrito = await CarritoService.getByUsuarioId(req.usuario.id);
    
    if (!carrito || !carrito.detalles || carrito.detalles.length === 0) {
      return res.status(400).json({ mensaje: 'El carrito está vacío' });
    }
    
    // Obtener o validar la dirección
    let direccionFinal = direccion_id;
    
    if (!direccionFinal) {
      // Si no se proporcionó dirección, usar la principal
      const direccionPrincipal = await DireccionService.getPrincipalByUsuarioId(req.usuario.id);
      
      if (!direccionPrincipal) {
        return res.status(400).json({ mensaje: 'Se requiere una dirección de envío' });
      }
      
      direccionFinal = direccionPrincipal.direccion_id;
    } else {
      // Verificar que la dirección pertenezca al usuario
      const direccion = await DireccionService.findById(direccionFinal);
      
      if (!direccion || direccion.usuario_id !== req.usuario.id) {
        return res.status(400).json({ mensaje: 'Dirección inválida' });
      }
    }
    
    // Preparar los productos para el pedido
    const productos = carrito.detalles.map(detalle => ({
      producto_id: detalle.producto_id,
      cantidad: detalle.cantidad,
      precio_unitario: detalle.Producto.precio
    }));
    
    // Crear el pedido
    const pedido = await PedidoService.create({
      usuario_id: req.usuario.id,
      metodo_pago_id,
      direccion_id: direccionFinal,
      carrito_id: carrito.carrito_id,
      productos
    });
    
    // Vaciar el carrito después de crear el pedido
    await CarritoService.clear(carrito.carrito_id);
    
    res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido
    });
  } catch (error) {
    next(error);
  }
};

// Crear pedido directo (para POS)
const crearPedidoDirecto = async (req, res, next) => {
  try {
    const schema = Joi.object({
      metodo_pago_id: Joi.number().integer().required(),
      direccion_id: Joi.number().integer().allow(null).optional(),
      tipo_entrega: Joi.string().valid('local', 'domicilio', 'takeaway').default('local'),
      notas: Joi.string().allow('', null).optional(),
      productos: Joi.array().items(
        Joi.object({
          producto_id: Joi.number().integer().required(),
          cantidad: Joi.number().integer().min(1).required(),
          precio_unitario: Joi.number().positive().required()
        })
      ).min(1).required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { metodo_pago_id, direccion_id, tipo_entrega, notas, productos } = req.body;
    
    // Validar que los productos existan y tengan stock suficiente
    for (const producto of productos) {
      const productoExistente = await require('../services/producto.service').findById(producto.producto_id);
      if (!productoExistente) {
        return res.status(400).json({ mensaje: `Producto con ID ${producto.producto_id} no encontrado` });
      }
      if (productoExistente.stock < producto.cantidad) {
        return res.status(400).json({ 
          mensaje: `Stock insuficiente para ${productoExistente.nombre}. Stock disponible: ${productoExistente.stock}` 
        });
      }
    }
    
    // Crear el pedido directo
    const pedido = await PedidoService.createDirect({
      usuario_id: req.usuario.id,
      metodo_pago_id,
      direccion_id,
      tipo_entrega,
      notas,
      productos
    });
    
    res.status(201).json({
      mensaje: 'Pedido directo creado correctamente',
      pedido
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar estado de pedido
const actualizarEstadoPedido = async (req, res, next) => {
  try {
    const schema = Joi.object({
      estado_pedido_id: Joi.number().integer().required(),
      comentario: Joi.string().allow('', null).optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { id } = req.params;
    const { estado_pedido_id, comentario } = req.body;
    
    // Verificar si el pedido existe
    const pedidoExistente = await PedidoService.findById(id);
    
    if (!pedidoExistente) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    // Solo administradores pueden cambiar el estado
    const usuario = await UsuarioService.findById(req.usuario.id);
    
    if (!usuario || !usuario.Roles || !usuario.Roles.some(rol => rol.nombre === 'admin')) {
      return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este pedido' });
    }
    
    // Actualizar el estado
    const pedidoActualizado = await PedidoService.actualizarEstado(
      id, 
      estado_pedido_id, 
      comentario || 'Estado actualizado'
    );
    
    res.json({
      mensaje: 'Estado de pedido actualizado correctamente',
      pedido: pedidoActualizado
    });
  } catch (error) {
    next(error);
  }
};

// Obtener pedidos del usuario autenticado
const obtenerMisPedidos = async (req, res) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query;
    
    const options = {
      usuario_id: req.usuario.id,
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    if (estado) {
      options.estado = estado;
    }
    
    const pedidos = await PedidoService.findByUsuario(options);
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener mis pedidos:', error);
    res.status(500).json({ mensaje: 'Error al obtener pedidos' });
  }
};

// Obtener estadísticas de pedidos (Admin/Vendedor)
const obtenerEstadisticas = async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query;
    
    const stats = await PedidoService.getStatistics(periodo);
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
};

// Cancelar pedido (Cliente o Admin)
const cancelarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    // Verificar si el pedido existe
    const pedido = await PedidoService.findById(id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    // Verificar permisos (solo admin o el dueño del pedido)
    const usuario = await UsuarioService.findById(req.usuario.id);
    const esAdmin = usuario && usuario.Roles && usuario.Roles.some(rol => rol.nombre === 'admin');
    
    if (!esAdmin && pedido.usuario_id !== req.usuario.id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para cancelar este pedido' });
    }
    
    // Verificar si el pedido se puede cancelar
    const estadosNoCancelables = ['entregado', 'cancelado'];
    if (estadosNoCancelables.includes(pedido.EstadoPedido?.nombre)) {
      return res.status(400).json({ 
        mensaje: `No se puede cancelar un pedido ${pedido.EstadoPedido.nombre}` 
      });
    }
    
    // Cancelar el pedido
    const pedidoCancelado = await PedidoService.cancel(id, motivo);
    
    res.json({
      mensaje: 'Pedido cancelado correctamente',
      pedido: pedidoCancelado
    });
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({ mensaje: 'Error al cancelar pedido' });
  }
};

// Actualizar múltiples pedidos (Admin/Vendedor)
const actualizarMultiplesPedidos = async (req, res) => {
  try {
    const schema = Joi.object({
      pedidos: Joi.array().items(
        Joi.object({
          pedido_id: Joi.number().integer().required(),
          estado_pedido_id: Joi.number().integer().required(),
          comentario: Joi.string().allow('', null).optional()
        })
      ).min(1).required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    const { pedidos } = req.body;
    
    // Actualizar pedidos en lote
    const resultados = await PedidoService.updateMultiple(pedidos);
    
    res.json({
      mensaje: `${resultados.updated} pedidos actualizados correctamente`,
      resultados
    });
  } catch (error) {
    console.error('Error al actualizar múltiples pedidos:', error);
    res.status(500).json({ mensaje: 'Error al actualizar pedidos' });
  }
};

// Eliminar pedido (Solo Admin)
const eliminarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el pedido existe
    const pedido = await PedidoService.findById(id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    // Eliminar el pedido
    await PedidoService.delete(id);
    
    res.json({
      mensaje: 'Pedido eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    res.status(500).json({ mensaje: 'Error al eliminar pedido' });
  }
};

// Obtener historial de estados de un pedido
const obtenerHistorialEstados = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar si el pedido existe
    const pedido = await PedidoService.findById(id);
    
    if (!pedido) {
      return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    }
    
    // Verificar permisos (solo admin o el dueño del pedido)
    const usuario = await UsuarioService.findById(req.usuario.id);
    
    if (!usuario || !usuario.Roles || (!usuario.Roles.some(rol => rol.nombre === 'admin') && pedido.usuario_id !== req.usuario.id)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver este pedido' });
    }
    
    res.json(pedido.HistorialEstadoPedidos);
  } catch (error) {
    console.error('Error al obtener historial de estados:', error);
    res.status(500).json({ mensaje: 'Error al obtener historial de estados' });
  }
};

module.exports = {
  obtenerPedidos,
  obtenerMisPedidos,
  obtenerEstadisticas,
  obtenerPedidoPorId,
  obtenerHistorialEstados,
  crearPedido,
  crearPedidoDirecto,
  actualizarEstadoPedido,
  cancelarPedido,
  actualizarMultiplesPedidos,
  eliminarPedido
}; 