const { Direccion, Usuario } = require('../models/orm');

class DireccionService {
  /**
   * Obtiene todas las direcciones de un usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Array>} - Lista de direcciones
   */
  static async findByUsuarioId(usuarioId) {
    try {
      const direcciones = await Direccion.findAll({
        where: { usuario_id: usuarioId },
        order: [['principal', 'DESC'], ['created_at', 'DESC']]
      });
      return direcciones.map(direccion => direccion.toJSON());
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene una dirección por su ID
   * @param {number} id - ID de la dirección
   * @returns {Promise<Object>} - Dirección encontrada
   */
  static async findById(id) {
    try {
      const direccion = await Direccion.findByPk(id);
      return direccion ? direccion.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar dirección por ID:', error);
      throw error;
    }
  }

  /**
   * Obtiene la dirección principal de un usuario
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} - Dirección principal
   */
  static async findPrincipal(usuarioId) {
    try {
      const direccion = await Direccion.findOne({
        where: { 
          usuario_id: usuarioId,
          principal: true
        }
      });
      return direccion ? direccion.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar dirección principal:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva dirección
   * @param {Object} data - Datos de la dirección
   * @returns {Promise<Object>} - Dirección creada
   */
  static async create(data) {
    try {
      const { usuario_id, calle, numero, ciudad, comuna, codigo_postal, pais, principal } = data;
      
      // Si es principal, actualizar todas las demás como no principales
      if (principal) {
        await Direccion.update(
          { principal: false },
          { where: { usuario_id } }
        );
      }
      
      const direccion = await Direccion.create({
        usuario_id,
        calle,
        numero,
        ciudad,
        comuna,
        codigo_postal,
        pais,
        principal: principal || false
      });
      
      return direccion.toJSON();
    } catch (error) {
      console.error('Error al crear dirección:', error);
      throw error;
    }
  }

  /**
   * Actualiza una dirección
   * @param {number} id - ID de la dirección
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} - Dirección actualizada
   */
  static async update(id, data) {
    try {
      const direccion = await Direccion.findByPk(id);
      
      if (!direccion) {
        throw new Error('Dirección no encontrada');
      }
      
      // Si se está estableciendo como principal, actualizar las demás
      if (data.principal && !direccion.principal) {
        await Direccion.update(
          { principal: false },
          { where: { usuario_id: direccion.usuario_id } }
        );
      }
      
      if (data.calle !== undefined) direccion.calle = data.calle;
      if (data.numero !== undefined) direccion.numero = data.numero;
      if (data.ciudad !== undefined) direccion.ciudad = data.ciudad;
      if (data.comuna !== undefined) direccion.comuna = data.comuna;
      if (data.codigo_postal !== undefined) direccion.codigo_postal = data.codigo_postal;
      if (data.pais !== undefined) direccion.pais = data.pais;
      if (data.principal !== undefined) direccion.principal = data.principal;
      
      await direccion.save();
      
      return direccion.toJSON();
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
      throw error;
    }
  }

  /**
   * Establece una dirección como principal
   * @param {number} id - ID de la dirección
   * @returns {Promise<Object>} - Dirección actualizada
   */
  static async setPrincipal(id) {
    try {
      const direccion = await Direccion.findByPk(id);
      
      if (!direccion) {
        throw new Error('Dirección no encontrada');
      }
      
      // Actualizar todas las direcciones del usuario como no principales
      await Direccion.update(
        { principal: false },
        { where: { usuario_id: direccion.usuario_id } }
      );
      
      // Establecer esta como principal
      direccion.principal = true;
      await direccion.save();
      
      return direccion.toJSON();
    } catch (error) {
      console.error('Error al establecer dirección como principal:', error);
      throw error;
    }
  }

  /**
   * Elimina una dirección
   * @param {number} id - ID de la dirección
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const direccion = await Direccion.findByPk(id);
      
      if (!direccion) {
        throw new Error('Dirección no encontrada');
      }
      
      await direccion.destroy();
      
      // Si era la principal, establecer otra como principal si existe
      if (direccion.principal) {
        const otraDireccion = await Direccion.findOne({
          where: { usuario_id: direccion.usuario_id }
        });
        
        if (otraDireccion) {
          otraDireccion.principal = true;
          await otraDireccion.save();
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      throw error;
    }
  }
}

module.exports = DireccionService; 