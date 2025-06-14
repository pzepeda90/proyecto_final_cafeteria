const { Resena, Usuario, Producto } = require('../models/orm');

class ResenaService {
  /**
   * Encuentra todas las reseñas de un producto
   * @param {number} productoId - ID del producto
   * @returns {Promise<Array>} - Lista de reseñas
   */
  static async findByProductoId(productoId) {
    try {
      const resenas = await Resena.findAll({
        where: { producto_id: productoId },
        include: [{
          model: Usuario,
          attributes: ['nombre', 'apellido']
        }],
        order: [['fecha_resena', 'DESC']]
      });
      return resenas.map(resena => resena.toJSON());
    } catch (error) {
      console.error('Error al buscar reseñas por producto ID:', error);
      throw error;
    }
  }

  /**
   * Encuentra una reseña por su ID
   * @param {number} id - ID de la reseña
   * @returns {Promise<Object>} - Reseña encontrada
   */
  static async findById(id) {
    try {
      const resena = await Resena.findByPk(id, {
        include: [{
          model: Usuario,
          attributes: ['nombre', 'apellido']
        }, {
          model: Producto,
          attributes: ['nombre']
        }]
      });
      return resena ? resena.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar reseña por ID:', error);
      throw error;
    }
  }

  /**
   * Encuentra reseñas por usuario ID
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Array>} - Lista de reseñas del usuario
   */
  static async findByUsuarioId(usuarioId) {
    try {
      const resenas = await Resena.findAll({
        where: { usuario_id: usuarioId },
        include: [{
          model: Producto,
          attributes: ['nombre', 'imagen_url']
        }],
        order: [['fecha_resena', 'DESC']]
      });
      return resenas.map(resena => resena.toJSON());
    } catch (error) {
      console.error('Error al buscar reseñas por usuario ID:', error);
      throw error;
    }
  }

  /**
   * Encuentra reseña por usuario y producto
   * @param {number} usuarioId - ID del usuario
   * @param {number} productoId - ID del producto
   * @returns {Promise<Object>} - Reseña encontrada
   */
  static async findByUsuarioAndProducto(usuarioId, productoId) {
    try {
      const resena = await Resena.findOne({
        where: { 
          usuario_id: usuarioId,
          producto_id: productoId 
        }
      });
      return resena ? resena.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar reseña por usuario y producto:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva reseña
   * @param {Object} data - Datos de la reseña
   * @returns {Promise<Object>} - Reseña creada
   */
  static async create(data) {
    try {
      const { usuario_id, producto_id, calificacion, comentario } = data;
      
      const nuevaResena = await Resena.create({
        usuario_id,
        producto_id,
        calificacion,
        comentario,
        fecha_resena: new Date()
      });
      
      const resenaCompleta = await this.findById(nuevaResena.resena_id);
      
      return resenaCompleta;
    } catch (error) {
      console.error('Error al crear reseña:', error);
      throw error;
    }
  }

  /**
   * Actualiza una reseña existente
   * @param {number} id - ID de la reseña
   * @param {Object} data - Nuevos datos
   * @returns {Promise<Object>} - Reseña actualizada
   */
  static async update(id, data) {
    try {
      const resena = await Resena.findByPk(id);
      
      if (!resena) {
        return null;
      }
      
      const { calificacion, comentario } = data;
      
      if (calificacion !== undefined) {
        resena.calificacion = calificacion;
      }
      
      if (comentario !== undefined) {
        resena.comentario = comentario;
      }
      
      await resena.save();
      
      const resenaActualizada = await this.findById(id);
      
      return resenaActualizada;
    } catch (error) {
      console.error('Error al actualizar reseña:', error);
      throw error;
    }
  }

  /**
   * Elimina una reseña
   * @param {number} id - ID de la reseña
   * @returns {Promise<Object>} - Reseña eliminada
   */
  static async delete(id) {
    try {
      const resena = await Resena.findByPk(id);
      
      if (!resena) {
        return null;
      }
      
      const resenaEliminada = await this.findById(id);
      
      await resena.destroy();
      
      return resenaEliminada;
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de reseñas de un producto
   * @param {number} productoId - ID del producto
   * @returns {Promise<Object>} - Estadísticas de reseñas
   */
  static async getStatsProducto(productoId) {
    try {
      const resenas = await this.findByProductoId(productoId);
      
      const stats = {
        totalResenas: resenas.length,
        promedioCalificacion: resenas.length > 0 
          ? (resenas.reduce((sum, r) => sum + r.calificacion, 0) / resenas.length).toFixed(1)
          : 0,
        distribucionCalificaciones: {
          5: resenas.filter(r => r.calificacion === 5).length,
          4: resenas.filter(r => r.calificacion === 4).length,
          3: resenas.filter(r => r.calificacion === 3).length,
          2: resenas.filter(r => r.calificacion === 2).length,
          1: resenas.filter(r => r.calificacion === 1).length
        }
      };

      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de reseñas:', error);
      throw error;
    }
  }
}

module.exports = ResenaService; 