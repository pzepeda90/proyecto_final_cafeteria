const { DetalleCarrito, Producto } = require('../models/orm');

class DetalleCarritoService {
  /**
   * Encuentra todos los detalles de un carrito
   * @param {number} carritoId - ID del carrito
   * @returns {Promise<Array>} - Lista de detalles
   */
  static async findByCarritoId(carritoId) {
    try {
      const detalles = await DetalleCarrito.findAll({
        where: { carrito_id: carritoId },
        include: [{
          model: Producto,
          attributes: ['producto_id', 'nombre', 'precio', 'imagen_url', 'disponible']
        }]
      });
      return detalles.map(detalle => detalle.toJSON());
    } catch (error) {
      console.error('Error al buscar detalles del carrito por ID:', error);
      throw error;
    }
  }

  /**
   * Encuentra un detalle específico por su ID
   * @param {number} id - ID del detalle
   * @returns {Promise<Object>} - Detalle encontrado
   */
  static async findById(id) {
    try {
      const detalle = await DetalleCarrito.findByPk(id, {
        include: [{
          model: Producto,
          attributes: ['producto_id', 'nombre', 'precio', 'imagen_url', 'disponible']
        }]
      });
      return detalle ? detalle.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar detalle del carrito por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo detalle de carrito
   * @param {Object} data - Datos del detalle
   * @returns {Promise<Object>} - Detalle creado
   */
  static async create(data) {
    try {
      const { carrito_id, producto_id, cantidad } = data;
      
      const nuevoDetalle = await DetalleCarrito.create({
        carrito_id,
        producto_id,
        cantidad
      });
      
      return nuevoDetalle.toJSON();
    } catch (error) {
      console.error('Error al crear detalle del carrito:', error);
      throw error;
    }
  }

  /**
   * Actualiza un detalle de carrito existente
   * @param {number} id - ID del detalle
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} - Detalle actualizado
   */
  static async update(id, data) {
    try {
      const { cantidad } = data;
      
      const detalle = await DetalleCarrito.findByPk(id);
      
      if (!detalle) {
        return null;
      }
      
      detalle.cantidad = cantidad;
      await detalle.save();
      
      return detalle.toJSON();
    } catch (error) {
      console.error('Error al actualizar detalle del carrito:', error);
      throw error;
    }
  }

  /**
   * Elimina un detalle de carrito
   * @param {number} id - ID del detalle
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const detalle = await DetalleCarrito.findByPk(id);
      
      if (!detalle) {
        return false;
      }
      
      await detalle.destroy();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar detalle del carrito:', error);
      throw error;
    }
  }
}

module.exports = DetalleCarritoService; 