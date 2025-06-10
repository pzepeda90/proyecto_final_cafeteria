const { HistorialEstadoPedido, EstadoPedido } = require('../models/orm');

class HistorialEstadoPedidoService {
  /**
   * Encuentra todos los registros de historial para un pedido
   * @param {number} pedidoId - ID del pedido
   * @returns {Promise<Array>} - Lista de registros de historial
   */
  static async findByPedidoId(pedidoId) {
    try {
      const registros = await HistorialEstadoPedido.findAll({
        where: { pedido_id: pedidoId },
        include: [{ model: EstadoPedido }],
        order: [['fecha_cambio', 'DESC']]
      });
      return registros.map(registro => registro.toJSON());
    } catch (error) {
      console.error('Error al buscar historial por pedido ID:', error);
      throw error;
    }
  }

  /**
   * Encuentra un registro específico por su ID
   * @param {number} id - ID del registro
   * @returns {Promise<Object>} - Registro encontrado
   */
  static async findById(id) {
    try {
      const registro = await HistorialEstadoPedido.findByPk(id, {
        include: [{ model: EstadoPedido }]
      });
      return registro ? registro.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar registro de historial por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo registro de historial
   * @param {Object} data - Datos del registro
   * @returns {Promise<Object>} - Registro creado
   */
  static async create(data) {
    try {
      const { pedido_id, estado_pedido_id, comentario } = data;
      
      const nuevoRegistro = await HistorialEstadoPedido.create({
        pedido_id,
        estado_pedido_id,
        fecha_cambio: new Date(),
        comentario
      });
      
      const registroCompleto = await HistorialEstadoPedido.findByPk(nuevoRegistro.historial_id, {
        include: [{ model: EstadoPedido }]
      });
      
      return registroCompleto.toJSON();
    } catch (error) {
      console.error('Error al crear registro de historial:', error);
      throw error;
    }
  }

  /**
   * Actualiza un registro de historial existente
   * @param {number} id - ID del registro
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} - Registro actualizado
   */
  static async update(id, data) {
    try {
      const registro = await HistorialEstadoPedido.findByPk(id);
      
      if (!registro) {
        return null;
      }
      
      const { estado_pedido_id, comentario } = data;
      
      if (estado_pedido_id !== undefined) {
        registro.estado_pedido_id = estado_pedido_id;
      }
      
      if (comentario !== undefined) {
        registro.comentario = comentario;
      }
      
      await registro.save();
      
      const registroActualizado = await HistorialEstadoPedido.findByPk(id, {
        include: [{ model: EstadoPedido }]
      });
      
      return registroActualizado.toJSON();
    } catch (error) {
      console.error('Error al actualizar registro de historial:', error);
      throw error;
    }
  }

  /**
   * Elimina un registro de historial
   * @param {number} id - ID del registro
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const registro = await HistorialEstadoPedido.findByPk(id);
      
      if (!registro) {
        return false;
      }
      
      await registro.destroy();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar registro de historial:', error);
      throw error;
    }
  }
}

module.exports = HistorialEstadoPedidoService; 