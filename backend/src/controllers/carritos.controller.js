const CarritoService = require('../services/carrito.service');
const ProductoService = require('../services/producto.service');
const Joi = require('joi');

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

// Agregar un producto al carrito
const agregarProducto = async (req, res, next) => {
  try {
    const schema = Joi.object({
      producto_id: Joi.number().integer().required(),
      cantidad: Joi.number().integer().min(1).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { producto_id, cantidad } = req.body;
    
    // Verificar que el producto exista y esté disponible
    const producto = await ProductoService.findById(producto_id);
    
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    if (!producto.disponible) {
      return res.status(400).json({ mensaje: 'El producto no está disponible' });
    }
    
    // Verificar disponibilidad de stock
    if (producto.stock < cantidad) {
      return res.status(400).json({ 
        mensaje: 'No hay suficiente stock disponible', 
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
    next(error);
  }
};

// Actualizar la cantidad de un producto en el carrito
const actualizarCantidad = async (req, res) => {
  try {
    const { producto_id, cantidad } = req.body;
    
    // Validar datos de entrada
    if (!producto_id || cantidad == null) {
      return res.status(400).json({ mensaje: 'Producto y cantidad son requeridos' });
    }
    
    // Verificar que el producto exista
    const producto = await ProductoService.findById(producto_id);
    
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Si la cantidad es mayor a 0, verificar disponibilidad de stock
    if (cantidad > 0 && producto.stock < cantidad) {
      return res.status(400).json({ 
        mensaje: 'No hay suficiente stock disponible', 
        stock_disponible: producto.stock 
      });
    }
    
    // Obtener el carrito del usuario
    const carritoActual = await CarritoService.getByUsuarioId(req.usuario.id);
    
    // Actualizar la cantidad del producto
    const carritoActualizado = await CarritoService.updateItem(
      carritoActual.carrito_id, 
      producto_id, 
      cantidad
    );
    
    res.json({
      mensaje: cantidad > 0 ? 'Cantidad actualizada' : 'Producto eliminado del carrito',
      carrito: carritoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar cantidad en el carrito:', error);
    res.status(500).json({ mensaje: 'Error al actualizar cantidad en el carrito' });
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

module.exports = {
  obtenerCarrito,
  agregarProducto,
  actualizarCantidad,
  eliminarProducto,
  vaciarCarrito
}; 