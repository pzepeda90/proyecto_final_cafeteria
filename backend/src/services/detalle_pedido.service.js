const { DetallePedido, Producto } = require('../models/orm');

class DetallePedidoService {
  /**
   * Encuentra todos los detalles de un pedido
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<Array>} - Lista de detalles
   */
  static async findByPedidoId(pedidoId) {
    try {
      const detalles = await DetallePedido.findAll({
        where: { pedido_id: pedidoId },
        include: [{
          model: Producto,
          attributes: ['producto_id', 'nombre', 'precio', 'imagen_url', 'disponible']
        }]
      });
      return detalles.map(detalle => detalle.toJSON());
    } catch (error) {
      console.error('Error al buscar detalles del pedido por ID:', error);
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
      const detalle = await DetallePedido.findByPk(id, {
        include: [{
          model: Producto,
          attributes: ['producto_id', 'nombre', 'precio', 'imagen_url', 'disponible']
        }]
      });
      return detalle ? detalle.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar detalle del pedido por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo detalle de pedido
   * @param {Object} data - Datos del detalle
   * @returns {Promise<Object>} - Detalle creado
   */
  static async create(data) {
    try {
      const { pedido_id, producto_id, cantidad, precio_unitario } = data;
      
      const nuevoDetalle = await DetallePedido.create({
        pedido_id,
        producto_id,
        cantidad,
        precio_unitario,
        subtotal: precio_unitario * cantidad
      });
      
      return nuevoDetalle.toJSON();
    } catch (error) {
      console.error('Error al crear detalle del pedido:', error);
      throw error;
    }
  }

  /**
   * Actualiza un detalle de pedido existente
   * @param {number} id - ID del detalle
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} - Detalle actualizado
   */
  static async update(id, data) {
    try {
      const { cantidad, precio_unitario } = data;
      
      const detalle = await DetallePedido.findByPk(id);
      
      if (!detalle) {
        return null;
      }
      
      if (cantidad) {
        detalle.cantidad = cantidad;
      }
      
      if (precio_unitario) {
        detalle.precio_unitario = precio_unitario;
      }
      
      if (cantidad || precio_unitario) {
        detalle.subtotal = detalle.precio_unitario * detalle.cantidad;
      }
      
      await detalle.save();
      
      return detalle.toJSON();
    } catch (error) {
      console.error('Error al actualizar detalle del pedido:', error);
      throw error;
    }
  }

  /**
   * Elimina un detalle de pedido
   * @param {number} id - ID del detalle
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const detalle = await DetallePedido.findByPk(id);
      
      if (!detalle) {
        return false;
      }
      
      await detalle.destroy();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar detalle del pedido:', error);
      throw error;
    }
  }
}

module.exports = DetallePedidoService; 