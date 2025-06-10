const { EstadoPedido } = require('../models/orm');

class EstadoPedidoService {
  /**
   * Encuentra todos los estados de pedido
   * @returns {Promise<Array>} - Lista de estados de pedido
   */
  static async findAll() {
    try {
      const estados = await EstadoPedido.findAll({
        order: [['nombre', 'ASC']]
      });
      return estados.map(estado => estado.toJSON());
    } catch (error) {
      console.error('Error al buscar estados de pedido:', error);
      throw error;
    }
  }

  /**
   * Encuentra un estado de pedido por su ID
   * @param {number} id - ID del estado de pedido
   * @returns {Promise<Object>} - Estado de pedido encontrado
   */
  static async findById(id) {
    try {
      const estado = await EstadoPedido.findByPk(id);
      return estado ? estado.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar estado de pedido por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo estado de pedido
   * @param {Object} data - Datos del estado de pedido
   * @returns {Promise<Object>} - Estado de pedido creado
   */
  static async create(data) {
    try {
      const { nombre, descripcion, color } = data;
      
      const nuevoEstado = await EstadoPedido.create({
        nombre,
        descripcion,
        color
      });
      
      return nuevoEstado.toJSON();
    } catch (error) {
      console.error('Error al crear estado de pedido:', error);
      throw error;
    }
  }

  /**
   * Actualiza un estado de pedido existente
   * @param {number} id - ID del estado de pedido
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} - Estado de pedido actualizado
   */
  static async update(id, data) {
    try {
      const estado = await EstadoPedido.findByPk(id);
      
      if (!estado) {
        return null;
      }
      
      const { nombre, descripcion, color } = data;
      
      if (nombre !== undefined) {
        estado.nombre = nombre;
      }
      
      if (descripcion !== undefined) {
        estado.descripcion = descripcion;
      }
      
      if (color !== undefined) {
        estado.color = color;
      }
      
      await estado.save();
      
      return estado.toJSON();
    } catch (error) {
      console.error('Error al actualizar estado de pedido:', error);
      throw error;
    }
  }

  /**
   * Elimina un estado de pedido
   * @param {number} id - ID del estado de pedido
   * @returns {Promise<Object>} - Estado de pedido eliminado
   */
  static async delete(id) {
    try {
      const estado = await EstadoPedido.findByPk(id);
      
      if (!estado) {
        return null;
      }
      
      await estado.destroy();
      
      return estado.toJSON();
    } catch (error) {
      console.error('Error al eliminar estado de pedido:', error);
      throw error;
    }
  }
}

module.exports = EstadoPedidoService; 