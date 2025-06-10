const { Carrito, Usuario, DetalleCarrito, Producto } = require('../models/orm');
const { Op } = require('sequelize');

class CarritoService {
  /**
   * Obtiene el carrito de un usuario con todos sus detalles
   * @param {number} usuarioId - ID del usuario
   * @returns {Promise<Object>} - Carrito con detalles
   */
  static async getByUsuarioId(usuarioId) {
    try {
      // Obtener o crear el carrito del usuario
      let carrito = await Carrito.findOne({
        where: { usuario_id: usuarioId }
      });
      
      // Si no existe un carrito, lo creamos
      if (!carrito) {
        carrito = await Carrito.create({
          usuario_id: usuarioId
        });
      }
      
      // Obtener los detalles del carrito (productos)
      const detalles = await DetalleCarrito.findAll({
        where: { carrito_id: carrito.carrito_id },
        include: [{
          model: Producto,
          attributes: ['producto_id', 'nombre', 'precio', 'imagen_url', 'disponible']
        }]
      });
      
      // Calcular el total del carrito
      let subtotal = 0;
      const detallesJSON = detalles.map(detalle => {
        const detalleData = detalle.toJSON();
        subtotal += detalle.cantidad * detalleData.Producto.precio;
        return detalleData;
      });
      
      return {
        ...carrito.toJSON(),
        detalles: detallesJSON,
        subtotal,
        total: subtotal + (subtotal * 0.16) // 16% impuestos
      };
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      throw error;
    }
  }

  /**
   * Añade un producto al carrito
   * @param {number} carritoId - ID del carrito
   * @param {number} productoId - ID del producto
   * @param {number} cantidad - Cantidad del producto
   * @returns {Promise<Object>} - Carrito actualizado
   */
  static async addItem(carritoId, productoId, cantidad) {
    try {
      // Verificar si el producto ya está en el carrito
      const existingItem = await DetalleCarrito.findOne({
        where: {
          carrito_id: carritoId,
          producto_id: productoId
        }
      });
      
      if (existingItem) {
        // Actualizar la cantidad del producto existente
        existingItem.cantidad += cantidad;
        await existingItem.save();
      } else {
        // Agregar nuevo producto al carrito
        await DetalleCarrito.create({
          carrito_id: carritoId,
          producto_id: productoId,
          cantidad
        });
      }
      
      // Actualizar fecha de modificación del carrito
      await Carrito.update(
        { updated_at: new Date() },
        { where: { carrito_id: carritoId } }
      );
      
      // Obtener el usuario_id para el carrito
      const carrito = await Carrito.findByPk(carritoId);
      
      // Retornar el carrito actualizado
      return this.getByUsuarioId(carrito.usuario_id);
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      throw error;
    }
  }

  /**
   * Actualiza la cantidad de un producto en el carrito
   * @param {number} carritoId - ID del carrito
   * @param {number} productoId - ID del producto
   * @param {number} cantidad - Nueva cantidad
   * @returns {Promise<Object>} - Carrito actualizado
   */
  static async updateItem(carritoId, productoId, cantidad) {
    try {
      if (cantidad <= 0) {
        // Si la cantidad es 0 o menos, eliminar el producto del carrito
        await DetalleCarrito.destroy({
          where: {
            carrito_id: carritoId,
            producto_id: productoId
          }
        });
      } else {
        // Actualizar la cantidad
        await DetalleCarrito.update(
          { cantidad },
          {
            where: {
              carrito_id: carritoId,
              producto_id: productoId
            }
          }
        );
      }
      
      // Actualizar fecha de modificación del carrito
      await Carrito.update(
        { updated_at: new Date() },
        { where: { carrito_id: carritoId } }
      );
      
      // Obtener el usuario_id para el carrito
      const carrito = await Carrito.findByPk(carritoId);
      
      // Retornar el carrito actualizado
      return this.getByUsuarioId(carrito.usuario_id);
    } catch (error) {
      console.error('Error al actualizar producto en el carrito:', error);
      throw error;
    }
  }

  /**
   * Elimina un producto del carrito
   * @param {number} carritoId - ID del carrito
   * @param {number} productoId - ID del producto
   * @returns {Promise<Object>} - Carrito actualizado
   */
  static async removeItem(carritoId, productoId) {
    try {
      // Eliminar el producto del carrito
      await DetalleCarrito.destroy({
        where: {
          carrito_id: carritoId,
          producto_id: productoId
        }
      });
      
      // Actualizar fecha de modificación del carrito
      await Carrito.update(
        { updated_at: new Date() },
        { where: { carrito_id: carritoId } }
      );
      
      // Obtener el usuario_id para el carrito
      const carrito = await Carrito.findByPk(carritoId);
      
      // Retornar el carrito actualizado
      return this.getByUsuarioId(carrito.usuario_id);
    } catch (error) {
      console.error('Error al eliminar producto del carrito:', error);
      throw error;
    }
  }

  /**
   * Vacía por completo un carrito
   * @param {number} carritoId - ID del carrito
   * @returns {Promise<Object>} - Carrito vacío
   */
  static async clear(carritoId) {
    try {
      // Eliminar todos los productos del carrito
      await DetalleCarrito.destroy({
        where: { carrito_id: carritoId }
      });
      
      // Actualizar fecha de modificación del carrito
      await Carrito.update(
        { updated_at: new Date() },
        { where: { carrito_id: carritoId } }
      );
      
      // Obtener el usuario_id para el carrito
      const carrito = await Carrito.findByPk(carritoId);
      
      // Retornar el carrito actualizado (vacío)
      return this.getByUsuarioId(carrito.usuario_id);
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
      throw error;
    }
  }
}

module.exports = CarritoService; 