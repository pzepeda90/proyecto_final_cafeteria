const { ImagenProducto } = require('../models/orm');

class ImagenProductoService {
  /**
   * Encuentra todas las imágenes de un producto
   * @param {number} productoId - ID del producto
   * @returns {Promise<Array>} - Lista de imágenes
   */
  static async findByProductoId(productoId) {
    try {
      const imagenes = await ImagenProducto.findAll({
        where: { producto_id: productoId },
        order: [['orden', 'ASC']]
      });
      return imagenes.map(imagen => imagen.toJSON());
    } catch (error) {
      console.error('Error al buscar imágenes por producto ID:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva imagen de producto
   * @param {Object} data - Datos de la imagen
   * @returns {Promise<Object>} - Imagen creada
   */
  static async create(data) {
    try {
      const { producto_id, url, orden = 0 } = data;
      
      const nuevaImagen = await ImagenProducto.create({
        producto_id,
        url,
        orden
      });
      
      return nuevaImagen.toJSON();
    } catch (error) {
      console.error('Error al crear imagen de producto:', error);
      throw error;
    }
  }

  /**
   * Elimina una imagen de producto
   * @param {number} id - ID de la imagen
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const imagen = await ImagenProducto.findByPk(id);
      
      if (!imagen) {
        return false;
      }
      
      await imagen.destroy();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar imagen de producto:', error);
      throw error;
    }
  }
}

module.exports = ImagenProductoService; 