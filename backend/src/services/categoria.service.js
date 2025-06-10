const { Categoria, Producto } = require('../models/orm');

class CategoriaService {
  /**
   * Obtiene todas las categorías
   * @returns {Promise<Array>} - Lista de categorías
   */
  static async findAll() {
    try {
      const categorias = await Categoria.findAll({
        order: [['nombre', 'ASC']]
      });
      return categorias.map(categoria => categoria.toJSON());
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtiene una categoría por su ID
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object>} - Categoría encontrada
   */
  static async findById(id) {
    try {
      const categoria = await Categoria.findByPk(id, {
        include: [{ model: Producto }]
      });
      return categoria ? categoria.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar categoría por ID:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva categoría
   * @param {Object} data - Datos de la categoría
   * @returns {Promise<Object>} - Categoría creada
   */
  static async create(data) {
    try {
      const categoria = await Categoria.create(data);
      return categoria.toJSON();
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  }

  /**
   * Actualiza una categoría
   * @param {number} id - ID de la categoría
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} - Categoría actualizada
   */
  static async update(id, data) {
    try {
      const categoria = await Categoria.findByPk(id);
      
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }
      
      if (data.nombre !== undefined) categoria.nombre = data.nombre;
      if (data.descripcion !== undefined) categoria.descripcion = data.descripcion;
      if (data.imagen_url !== undefined) categoria.imagen_url = data.imagen_url;
      
      await categoria.save();
      
      return categoria.toJSON();
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  }

  /**
   * Elimina una categoría
   * @param {number} id - ID de la categoría
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const categoria = await Categoria.findByPk(id);
      
      if (!categoria) {
        throw new Error('Categoría no encontrada');
      }
      
      // Verificar si hay productos asociados
      const productosCount = await Producto.count({
        where: { categoria_id: id }
      });
      
      if (productosCount > 0) {
        throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
      }
      
      await categoria.destroy();
      return true;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }
}

module.exports = CategoriaService; 