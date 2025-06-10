const { Producto, Categoria, Vendedor, ImagenProducto } = require('../models/orm');
const { Op } = require('sequelize');

class ProductoService {
  /**
   * Obtiene todos los productos con filtros opcionales
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>} - Lista de productos
   */
  static async findAll(options = {}) {
    try {
      const whereClause = {};
      
      if (options.categoria_id) {
        whereClause.categoria_id = options.categoria_id;
      }
      
      if (options.disponible !== undefined) {
        whereClause.disponible = options.disponible;
      }
      
      if (options.vendedor_id) {
        whereClause.vendedor_id = options.vendedor_id;
      }
      
      if (options.busqueda) {
        whereClause.nombre = { [Op.iLike]: `%${options.busqueda}%` };
      }
      
      const productos = await Producto.findAll({
        where: whereClause,
        include: [
          { model: Categoria },
          { model: Vendedor },
          { model: ImagenProducto }
        ],
        order: [['nombre', 'ASC']]
      });
      
      return productos.map(producto => producto.toJSON());
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }
  
  /**
   * Encuentra un producto por su ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} - Producto encontrado
   */
  static async findById(id) {
    try {
      const producto = await Producto.findOne({
        where: { producto_id: id },
        include: [
          { model: Categoria },
          { model: Vendedor },
          { model: ImagenProducto }
        ]
      });
      
      return producto ? producto.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar producto por ID:', error);
      throw error;
    }
  }
  
  /**
   * Crea un nuevo producto
   * @param {Object} productoData - Datos del producto
   * @returns {Promise<Object>} - Producto creado
   */
  static async create(productoData) {
    try {
      const {
        categoria_id,
        nombre,
        descripcion,
        precio,
        imagen_url,
        stock,
        disponible = true,
        vendedor_id
      } = productoData;
      
      const nuevoProducto = await Producto.create({
        categoria_id,
        nombre,
        descripcion,
        precio,
        imagen_url,
        stock: stock || 0,
        disponible,
        vendedor_id
      });
      
      // Agregar imágenes adicionales si se proporcionan
      if (productoData.imagenes_adicionales && Array.isArray(productoData.imagenes_adicionales)) {
        for (let i = 0; i < productoData.imagenes_adicionales.length; i++) {
          await ImagenProducto.create({
            producto_id: nuevoProducto.producto_id,
            url: productoData.imagenes_adicionales[i],
            orden: i + 1
          });
        }
      }
      
      // Obtener el producto completo con imágenes
      return this.findById(nuevoProducto.producto_id);
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza un producto existente
   * @param {number} id - ID del producto
   * @param {Object} productoData - Datos actualizados
   * @returns {Promise<Object>} - Producto actualizado
   */
  static async update(id, productoData) {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      // Actualizar propiedades
      if (productoData.categoria_id !== undefined) producto.categoria_id = productoData.categoria_id;
      if (productoData.nombre !== undefined) producto.nombre = productoData.nombre;
      if (productoData.descripcion !== undefined) producto.descripcion = productoData.descripcion;
      if (productoData.precio !== undefined) producto.precio = productoData.precio;
      if (productoData.imagen_url !== undefined) producto.imagen_url = productoData.imagen_url;
      if (productoData.stock !== undefined) producto.stock = productoData.stock;
      if (productoData.disponible !== undefined) producto.disponible = productoData.disponible;
      
      // Guardar cambios
      await producto.save();
      
      // Devolver producto actualizado con sus relaciones
      return this.findById(id);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un producto
   * @param {number} id - ID del producto
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const producto = await Producto.findByPk(id);
      
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      
      // Eliminar imágenes asociadas
      await ImagenProducto.destroy({ where: { producto_id: id } });
      
      // Eliminar el producto
      await producto.destroy();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }
  
  /**
   * Añade una imagen a un producto
   * @param {number} productoId - ID del producto
   * @param {string} url - URL de la imagen
   * @param {string} descripcion - Descripción de la imagen
   * @returns {Promise<Object>} - Imagen creada
   */
  static async addImage(productoId, url, descripcion = '') {
    try {
      // Obtener el orden más alto actual
      const imagenes = await ImagenProducto.findAll({
        where: { producto_id: productoId },
        order: [['orden', 'DESC']]
      });
      
      const orden = imagenes.length > 0 ? imagenes[0].orden + 1 : 1;
      
      // Crear la nueva imagen
      const imagen = await ImagenProducto.create({
        producto_id: productoId,
        url,
        descripcion,
        orden
      });
      
      return imagen.toJSON();
    } catch (error) {
      console.error('Error al agregar imagen al producto:', error);
      throw error;
    }
  }
}

module.exports = ProductoService; 