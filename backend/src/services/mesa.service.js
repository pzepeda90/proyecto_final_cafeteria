const { Mesa } = require('../models/orm');

class MesaService {
  /**
   * Obtiene todas las mesas activas
   * @returns {Promise<Array>} - Lista de mesas
   */
  static async findAll() {
    try {
      const mesas = await Mesa.findAll({
        where: { activa: true },
        order: [['numero', 'ASC']]
      });
      return mesas;
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      throw error;
    }
  }

  /**
   * Obtiene mesas disponibles
   * @returns {Promise<Array>} - Lista de mesas disponibles
   */
  static async findAvailable() {
    try {
      const mesas = await Mesa.findAll({
        where: { 
          activa: true,
          estado: 'disponible'
        },
        order: [['numero', 'ASC']]
      });
      return mesas;
    } catch (error) {
      console.error('Error al obtener mesas disponibles:', error);
      throw error;
    }
  }

  /**
   * Encuentra una mesa por su ID
   * @param {number} id - ID de la mesa
   * @returns {Promise<Object>} - Mesa encontrada
   */
  static async findById(id) {
    try {
      const mesa = await Mesa.findOne({
        where: { mesa_id: id, activa: true }
      });
      return mesa;
    } catch (error) {
      console.error('Error al buscar mesa por ID:', error);
      throw error;
    }
  }

  /**
   * Encuentra una mesa por su número
   * @param {string} numero - Número de la mesa
   * @returns {Promise<Object>} - Mesa encontrada
   */
  static async findByNumber(numero) {
    try {
      const mesa = await Mesa.findOne({
        where: { numero, activa: true }
      });
      return mesa;
    } catch (error) {
      console.error('Error al buscar mesa por número:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una mesa
   * @param {number} id - ID de la mesa
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} - Mesa actualizada
   */
  static async updateStatus(id, estado) {
    try {
      const mesa = await Mesa.findByPk(id);
      
      if (!mesa) {
        throw new Error('Mesa no encontrada');
      }

      mesa.estado = estado;
      await mesa.save();
      
      return mesa;
    } catch (error) {
      console.error('Error al actualizar estado de mesa:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva mesa
   * @param {Object} mesaData - Datos de la mesa
   * @returns {Promise<Object>} - Mesa creada
   */
  static async create(mesaData) {
    try {
      const mesa = await Mesa.create(mesaData);
      return mesa;
    } catch (error) {
      console.error('Error al crear mesa:', error);
      throw error;
    }
  }

  /**
   * Actualiza una mesa
   * @param {number} id - ID de la mesa
   * @param {Object} mesaData - Nuevos datos de la mesa
   * @returns {Promise<Object>} - Mesa actualizada
   */
  static async update(id, mesaData) {
    try {
      const mesa = await Mesa.findByPk(id);
      
      if (!mesa) {
        throw new Error('Mesa no encontrada');
      }

      Object.assign(mesa, mesaData);
      await mesa.save();
      
      return mesa;
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      throw error;
    }
  }

  /**
   * Elimina una mesa (marca como inactiva)
   * @param {number} id - ID de la mesa
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const mesa = await Mesa.findByPk(id);
      
      if (!mesa) {
        throw new Error('Mesa no encontrada');
      }

      mesa.activa = false;
      await mesa.save();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      throw error;
    }
  }
}

module.exports = MesaService; 