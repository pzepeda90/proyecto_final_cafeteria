const { Rol } = require('../models/orm');

class RolService {
  /**
   * Encuentra todos los roles
   * @returns {Promise<Array>} - Lista de roles
   */
  static async findAll() {
    try {
      const roles = await Rol.findAll({
        order: [['nombre', 'ASC']]
      });
      return roles.map(rol => rol.toJSON());
    } catch (error) {
      console.error('Error al buscar roles:', error);
      throw error;
    }
  }

  /**
   * Encuentra un rol por su ID
   * @param {number} id - ID del rol
   * @returns {Promise<Object>} - Rol encontrado
   */
  static async findById(id) {
    try {
      const rol = await Rol.findByPk(id);
      return rol ? rol.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar rol por ID:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo rol
   * @param {Object} data - Datos del rol
   * @returns {Promise<Object>} - Rol creado
   */
  static async create(data) {
    try {
      const { nombre, descripcion } = data;
      
      const nuevoRol = await Rol.create({
        nombre,
        descripcion
      });
      
      return nuevoRol.toJSON();
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  }

  /**
   * Actualiza un rol existente
   * @param {number} id - ID del rol
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} - Rol actualizado
   */
  static async update(id, data) {
    try {
      const rol = await Rol.findByPk(id);
      
      if (!rol) {
        return null;
      }
      
      const { nombre, descripcion } = data;
      
      if (nombre !== undefined) {
        rol.nombre = nombre;
      }
      
      if (descripcion !== undefined) {
        rol.descripcion = descripcion;
      }
      
      await rol.save();
      
      return rol.toJSON();
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      throw error;
    }
  }

  /**
   * Elimina un rol
   * @param {number} id - ID del rol
   * @returns {Promise<Object>} - Rol eliminado
   */
  static async delete(id) {
    try {
      const rol = await Rol.findByPk(id);
      
      if (!rol) {
        return null;
      }
      
      const rolEliminado = rol.toJSON();
      
      await rol.destroy();
      
      return rolEliminado;
    } catch (error) {
      console.error('Error al eliminar rol:', error);
      throw error;
    }
  }
}

module.exports = RolService; 