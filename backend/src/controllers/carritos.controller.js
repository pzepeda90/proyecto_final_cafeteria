const CarritoService = require('../services/carrito.service');
const ProductoService = require('../services/producto.service');
const UsuarioService = require('../services/usuario.service');
const Joi = require('joi');
const { Op } = require('sequelize');

// Obtener el carrito del usuario autenticado
const obtenerCarrito = async (req, res) => {
  try {
    const carrito = await CarritoService.getByUsuarioId(req.usuario.id);
    res.json(carrito);
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ mensaje: 'Error al obtener el carrito' });
  }
};

// Obtener todos los carritos (Admin/Vendedor)
const obtenerTodosCarritos = async (req, res) => {
  try {
    const { page = 1, limit = 10, usuario_id } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };
    
    if (usuario_id) {
      options.usuario_id = parseInt(usuario_id);
    }
    
    const carritos = await CarritoService.findAll(options);
    res.json(carritos);
  } catch (error) {
    console.error('Error al obtener carritos:', error);
    res.status(500).json({ mensaje: 'Error al obtener carritos' });
  }
};

// Obtener carrito por ID de usuario (Admin/Vendedor)
const obtenerCarritoPorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario existe
    const usuario = await UsuarioService.findById(userId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    const carrito = await CarritoService.getByUsuarioId(userId);
    res.json(carrito);
  } catch (error) {
    console.error('Error al obtener carrito por usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener carrito' });
  }
};

// Obtener estadísticas de carritos (Admin)
const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await CarritoService.getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
};

// Agregar un producto al carrito
const agregarProducto = async (req, res) => {
  try {
    // Validar datos de entrada
    const schema = Joi.object({
      producto_id: Joi.number().integer().positive().required(),
      cantidad: Joi.number().integer().min(1).required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    const { producto_id, cantidad } = req.body;
    
    // Verificar que el producto existe y está disponible
    const producto = await ProductoService.findById(producto_id);
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    if (!producto.disponible) {
      return res.status(400).json({ mensaje: 'Producto no disponible' });
    }
    
    if (producto.stock < cantidad) {
      return res.status(400).json({ 
        mensaje: 'Stock insuficiente',
        stock_disponible: producto.stock
      });
    }
    
    // Obtener el carrito del usuario
    const carritoActual = await CarritoService.getByUsuarioId(req.usuario.id);
    
    // Agregar el producto al carrito
    const carritoActualizado = await CarritoService.addItem(
      carritoActual.carrito_id, 
      producto_id, 
      cantidad
    );
    
    res.json({
      mensaje: 'Producto agregado al carrito',
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ mensaje: 'Error al agregar producto al carrito' });
  }
};

// Agregar múltiples productos al carrito
const agregarMultiplesProductos = async (req, res) => {
  try {
    // Validar datos de entrada
    const schema = Joi.object({
      productos: Joi.array().items(
        Joi.object({
          producto_id: Joi.number().integer().positive().required(),
          cantidad: Joi.number().integer().min(1).required()
        })
      ).min(1).required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    const { productos } = req.body;
    
    // Obtener el carrito del usuario
    const carritoActual = await CarritoService.getByUsuarioId(req.usuario.id);
    
    // Agregar productos en lote
    const carritoActualizado = await CarritoService.addMultipleItems(
      carritoActual.carrito_id, 
      productos
    );
    
    res.json({
      mensaje: `${productos.length} productos agregados al carrito`,
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error('Error al agregar múltiples productos:', error);
    res.status(500).json({ mensaje: 'Error al agregar productos al carrito' });
  }
};

// Actualizar cantidad de un producto en el carrito
const actualizarCantidad = async (req, res) => {
  try {
    // Validar datos de entrada
    const schema = Joi.object({
      producto_id: Joi.number().integer().positive().required(),
      cantidad: Joi.number().integer().min(0).required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    const { producto_id, cantidad } = req.body;
    
    // Obtener el carrito del usuario
    const carritoActual = await CarritoService.getByUsuarioId(req.usuario.id);
    
    // Si cantidad es 0, eliminar el producto
    if (cantidad === 0) {
      const carritoActualizado = await CarritoService.removeItem(
        carritoActual.carrito_id, 
        producto_id
      );
      
      return res.json({
        mensaje: 'Producto eliminado del carrito',
        carrito: carritoActualizado
      });
    }
    
    // Actualizar la cantidad
    const carritoActualizado = await CarritoService.updateItemQuantity(
      carritoActual.carrito_id, 
      producto_id, 
      cantidad
    );
    
    res.json({
      mensaje: 'Cantidad actualizada',
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({ mensaje: 'Error al actualizar cantidad' });
  }
};

// Sincronizar carrito completo
const sincronizarCarrito = async (req, res) => {
  try {
    // Validar datos de entrada
    const schema = Joi.object({
      productos: Joi.array().items(
        Joi.object({
          producto_id: Joi.number().integer().positive().required(),
          cantidad: Joi.number().integer().min(1).required()
        })
      ).required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ mensaje: error.details[0].message });
    }
    
    const { productos } = req.body;
    
    // Obtener el carrito del usuario
    const carritoActual = await CarritoService.getByUsuarioId(req.usuario.id);
    
    // Sincronizar carrito
    const carritoActualizado = await CarritoService.syncCart(
      carritoActual.carrito_id, 
      productos
    );
    
    res.json({
      mensaje: 'Carrito sincronizado',
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error('Error al sincronizar carrito:', error);
    res.status(500).json({ mensaje: 'Error al sincronizar carrito' });
  }
};

// Eliminar un producto del carrito
const eliminarProducto = async (req, res) => {
  try {
    const { producto_id } = req.params;
    
    // Validar datos de entrada
    if (!producto_id) {
      return res.status(400).json({ mensaje: 'ID de producto es requerido' });
    }
    
    // Obtener el carrito del usuario
    const carritoActual = await CarritoService.getByUsuarioId(req.usuario.id);
    
    // Eliminar el producto del carrito
    const carritoActualizado = await CarritoService.removeItem(
      carritoActual.carrito_id, 
      producto_id
    );
    
    res.json({
      mensaje: 'Producto eliminado del carrito',
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ mensaje: 'Error al eliminar producto del carrito' });
  }
};

// Vaciar el carrito
const vaciarCarrito = async (req, res) => {
  try {
    // Obtener el carrito del usuario
    const carritoActual = await CarritoService.getByUsuarioId(req.usuario.id);
    
    // Vaciar el carrito
    const carritoActualizado = await CarritoService.clear(carritoActual.carrito_id);
    
    res.json({
      mensaje: 'Carrito vaciado correctamente',
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error('Error al vaciar el carrito:', error);
    res.status(500).json({ mensaje: 'Error al vaciar el carrito' });
  }
};

// Limpiar carritos abandonados (Admin)
const limpiarCarritosAbandonados = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await CarritoService.cleanAbandonedCarts(parseInt(days));
    
    res.json({
      mensaje: `${result.deletedCount} carritos abandonados eliminados`,
      days_threshold: parseInt(days),
      deleted_count: result.deletedCount
    });
  } catch (error) {
    console.error('Error al limpiar carritos abandonados:', error);
    res.status(500).json({ mensaje: 'Error al limpiar carritos abandonados' });
  }
};

module.exports = {
  obtenerCarrito,
  obtenerTodosCarritos,
  obtenerCarritoPorUsuario,
  obtenerEstadisticas,
  agregarProducto,
  agregarMultiplesProductos,
  actualizarCantidad,
  sincronizarCarrito,
  eliminarProducto,
  vaciarCarrito,
  limpiarCarritosAbandonados
}; 