const { MetodoPago } = require('../models/orm');

class MetodoPagoService {
  /**
   * Encuentra todos los métodos de pago
   * @returns {Promise<Array>} - Lista de métodos de pago
   */
  static async findAll() {
    try {
      const metodos = await MetodoPago.findAll({
        order: [['nombre', 'ASC']]
      });
      return metodos.map(metodo => metodo.toJSON());
    } catch (error) {
      console.error('Error al buscar métodos de pago:', error);
      throw error;
    }
  }

  /**
   * Encuentra un método de pago por su ID
   * @param {number} id - ID del método de pago
   * @returns {Promise<Object>} - Método de pago encontrado
   */
  static async findById(id) {
    try {
      const metodo = await MetodoPago.findByPk(id);
      return metodo ? metodo.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar método de pago por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo método de pago
   * @param {Object} data - Datos del método de pago
   * @returns {Promise<Object>} - Método de pago creado
   */
  static async create(data) {
    try {
      const { nombre, descripcion, activo = true } = data;
      
      const nuevoMetodo = await MetodoPago.create({
        nombre,
        descripcion,
        activo
      });
      
      return nuevoMetodo.toJSON();
    } catch (error) {
      console.error('Error al crear método de pago:', error);
      throw error;
    }
  }

  /**
   * Actualiza un método de pago existente
   * @param {number} id - ID del método de pago
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} - Método de pago actualizado
   */
  static async update(id, data) {
    try {
      const metodo = await MetodoPago.findByPk(id);
      
      if (!metodo) {
        return null;
      }
      
      const { nombre, descripcion, activo } = data;
      
      if (nombre !== undefined) {
        metodo.nombre = nombre;
      }
      
      if (descripcion !== undefined) {
        metodo.descripcion = descripcion;
      }
      
      if (activo !== undefined) {
        metodo.activo = activo;
      }
      
      await metodo.save();
      
      return metodo.toJSON();
    } catch (error) {
      console.error('Error al actualizar método de pago:', error);
      throw error;
    }
  }

  /**
   * Elimina un método de pago
   * @param {number} id - ID del método de pago
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const metodo = await MetodoPago.findByPk(id);
      
      if (!metodo) {
        return null;
      }
      
      await metodo.destroy();
      
      return metodo.toJSON();
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
      throw error;
    }
  }
}

module.exports = MetodoPagoService; 