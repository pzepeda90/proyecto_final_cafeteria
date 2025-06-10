const Producto = require('../models/orm/producto.orm');

/**
 * Middleware para verificar que el producto pertenezca al vendedor
 */
const esProductoDelVendedor = async (req, res, next) => {
  try {
    // Verificar que el usuario tenga el objeto vendedor en req
    if (!req.vendedor) {
      return res.status(401).json({ mensaje: 'Acceso denegado. Se requiere autenticación como vendedor.' });
    }
    
    const { id } = req.params;
    const producto = await Producto.findByPk(id);
    
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Verificar que el producto pertenezca al vendedor logueado
    if (producto.vendedor_id !== req.vendedor.id) {
      return res.status(403).json({ mensaje: 'No tienes permisos para modificar este producto' });
    }
    
    // Si todo está bien, continuar
    next();
  } catch (error) {
    console.error('Error en middleware de verificación de productos:', error);
    res.status(500).json({ mensaje: 'Error en la verificación de producto' });
  }
};

module.exports = { esProductoDelVendedor }; 