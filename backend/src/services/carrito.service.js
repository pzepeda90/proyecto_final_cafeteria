const { Carrito, DetalleCarrito, Producto, Usuario } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../models/sequelize');

class CarritoService {
  
  // Obtener carrito por ID de usuario con optimización
  static async getByUsuarioId(usuarioId) {
    try {
      let carrito = await Carrito.findOne({
        where: { usuario_id: usuarioId },
        include: [
          {
            model: DetalleCarrito,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto',
                attributes: ['producto_id', 'nombre', 'precio', 'imagen_url', 'stock', 'disponible']
              }
            ],
            order: [['created_at', 'DESC']]
          }
        ]
      });

      // Si no existe carrito, crear uno nuevo
      if (!carrito) {
        carrito = await Carrito.create({
          usuario_id: usuarioId,
          total: 0.00
        });
        
        // Recargar con las relaciones
        carrito = await Carrito.findByPk(carrito.carrito_id, {
          include: [
            {
              model: DetalleCarrito,
              as: 'detalles',
              include: [
                {
                  model: Producto,
                  as: 'producto',
                  attributes: ['producto_id', 'nombre', 'precio', 'imagen_url', 'stock', 'disponible']
                }
              ]
            }
          ]
        });
      }

      return carrito;
    } catch (error) {
      console.error('Error en getByUsuarioId:', error);
      throw error;
    }
  }

  // Obtener todos los carritos con paginación (Admin/Vendedor)
  static async findAll(options = {}) {
    try {
      const { page = 1, limit = 10, usuario_id } = options;
      const offset = (page - 1) * limit;
      
      const whereClause = {};
      if (usuario_id) {
        whereClause.usuario_id = usuario_id;
      }

      const { count, rows } = await Carrito.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: 'usuario',
            attributes: ['usuario_id', 'nombre', 'apellido', 'email']
          },
          {
            model: DetalleCarrito,
            as: 'detalles',
            attributes: ['detalle_carrito_id', 'producto_id', 'cantidad'],
            include: [
              {
                model: Producto,
                as: 'producto',
                attributes: ['nombre', 'precio']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['updated_at', 'DESC']]
      });

      return {
        carritos: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  // Obtener estadísticas de carritos
  static async getStatistics() {
    try {
      const [stats] = await sequelize.query(`
        SELECT 
          COUNT(*) as total_carritos,
          COUNT(CASE WHEN total > 0 THEN 1 END) as carritos_activos,
          COALESCE(SUM(total), 0) as valor_total,
          COALESCE(AVG(
            (SELECT COUNT(*) FROM detalles_carrito dc WHERE dc.carrito_id = carritos.carrito_id)
          ), 0) as promedio_items
        FROM carritos
      `);

      return stats;
    } catch (error) {
      console.error('Error en getStatistics:', error);
      throw error;
    }
  }

  // Agregar producto al carrito con optimización
  static async addItem(carritoId, productoId, cantidad) {
    const transaction = await sequelize.transaction();
    
    try {
      // Verificar si el producto ya existe en el carrito
      const detalleExistente = await DetalleCarrito.findOne({
        where: {
          carrito_id: carritoId,
          producto_id: productoId
        },
        transaction
      });

      if (detalleExistente) {
        // Actualizar cantidad existente
        await detalleExistente.update({
          cantidad: detalleExistente.cantidad + cantidad
        }, { transaction });
      } else {
        // Crear nuevo detalle
        await DetalleCarrito.create({
          carrito_id: carritoId,
          producto_id: productoId,
          cantidad: cantidad
        }, { transaction });
      }

      // Recalcular total del carrito
      await this.recalcularTotal(carritoId, transaction);
      
      await transaction.commit();

      // Retornar carrito actualizado
      return await this.getByCarritoId(carritoId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error en addItem:', error);
      throw error;
    }
  }

  // Agregar múltiples productos al carrito
  static async addMultipleItems(carritoId, productos) {
    const transaction = await sequelize.transaction();
    
    try {
      for (const { producto_id, cantidad } of productos) {
        // Verificar si el producto ya existe en el carrito
        const detalleExistente = await DetalleCarrito.findOne({
          where: {
            carrito_id: carritoId,
            producto_id: producto_id
          },
          transaction
        });

        if (detalleExistente) {
          // Actualizar cantidad existente
          await detalleExistente.update({
            cantidad: detalleExistente.cantidad + cantidad
          }, { transaction });
        } else {
          // Crear nuevo detalle
          await DetalleCarrito.create({
            carrito_id: carritoId,
            producto_id: producto_id,
            cantidad: cantidad
          }, { transaction });
        }
      }

      // Recalcular total del carrito
      await this.recalcularTotal(carritoId, transaction);
      
      await transaction.commit();

      // Retornar carrito actualizado
      return await this.getByCarritoId(carritoId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error en addMultipleItems:', error);
      throw error;
    }
  }

  // Actualizar cantidad de producto
  static async updateItemQuantity(carritoId, productoId, cantidad) {
    const transaction = await sequelize.transaction();
    
    try {
      const detalle = await DetalleCarrito.findOne({
        where: {
          carrito_id: carritoId,
          producto_id: productoId
        },
        transaction
      });

      if (!detalle) {
        throw new Error('Producto no encontrado en el carrito');
      }

      await detalle.update({ cantidad }, { transaction });

      // Recalcular total del carrito
      await this.recalcularTotal(carritoId, transaction);
      
      await transaction.commit();

      // Retornar carrito actualizado
      return await this.getByCarritoId(carritoId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error en updateItemQuantity:', error);
      throw error;
    }
  }

  // Sincronizar carrito completo
  static async syncCart(carritoId, productos) {
    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar todos los detalles existentes
      await DetalleCarrito.destroy({
        where: { carrito_id: carritoId },
        transaction
      });

      // Agregar nuevos productos
      if (productos.length > 0) {
        const detalles = productos.map(({ producto_id, cantidad }) => ({
          carrito_id: carritoId,
          producto_id,
          cantidad
        }));

        await DetalleCarrito.bulkCreate(detalles, { transaction });
      }

      // Recalcular total del carrito
      await this.recalcularTotal(carritoId, transaction);
      
      await transaction.commit();

      // Retornar carrito actualizado
      return await this.getByCarritoId(carritoId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error en syncCart:', error);
      throw error;
    }
  }

  // Eliminar producto del carrito
  static async removeItem(carritoId, productoId) {
    const transaction = await sequelize.transaction();
    
    try {
      const deleted = await DetalleCarrito.destroy({
        where: {
          carrito_id: carritoId,
          producto_id: productoId
        },
        transaction
      });

      if (deleted === 0) {
        throw new Error('Producto no encontrado en el carrito');
      }

      // Recalcular total del carrito
      await this.recalcularTotal(carritoId, transaction);
      
      await transaction.commit();

      // Retornar carrito actualizado
      return await this.getByCarritoId(carritoId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error en removeItem:', error);
      throw error;
    }
  }

  // Vaciar carrito
  static async clear(carritoId) {
    const transaction = await sequelize.transaction();
    
    try {
      // Eliminar todos los detalles
      await DetalleCarrito.destroy({
        where: { carrito_id: carritoId },
        transaction
      });

      // Actualizar total a 0
      await Carrito.update(
        { total: 0.00 },
        { 
          where: { carrito_id: carritoId },
          transaction 
        }
      );
      
      await transaction.commit();

      // Retornar carrito actualizado
      return await this.getByCarritoId(carritoId);
    } catch (error) {
      await transaction.rollback();
      console.error('Error en clear:', error);
      throw error;
    }
  }

  // Limpiar carritos abandonados
  static async cleanAbandonedCarts(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Encontrar carritos abandonados
      const carritosAbandonados = await Carrito.findAll({
        where: {
          updated_at: {
            [Op.lt]: cutoffDate
          },
          total: {
            [Op.gt]: 0
          }
        },
        attributes: ['carrito_id']
      });

      const carritoIds = carritosAbandonados.map(c => c.carrito_id);

      if (carritoIds.length === 0) {
        return { deletedCount: 0 };
      }

      // Eliminar detalles de carritos abandonados
      await DetalleCarrito.destroy({
        where: {
          carrito_id: {
            [Op.in]: carritoIds
          }
        }
      });

      // Actualizar carritos a total 0
      const [updatedCount] = await Carrito.update(
        { total: 0.00 },
        {
          where: {
            carrito_id: {
              [Op.in]: carritoIds
            }
          }
        }
      );

      return { deletedCount: updatedCount };
    } catch (error) {
      console.error('Error en cleanAbandonedCarts:', error);
      throw error;
    }
  }

  // Obtener carrito por ID con optimización
  static async getByCarritoId(carritoId) {
    try {
      const carrito = await Carrito.findByPk(carritoId, {
        include: [
          {
            model: DetalleCarrito,
            as: 'detalles',
            include: [
              {
                model: Producto,
                as: 'producto',
                attributes: ['producto_id', 'nombre', 'precio', 'imagen_url', 'stock', 'disponible']
              }
            ],
            order: [['created_at', 'DESC']]
          }
        ]
      });

      return carrito;
    } catch (error) {
      console.error('Error en getByCarritoId:', error);
      throw error;
    }
  }

  // Recalcular total del carrito (método privado optimizado)
  static async recalcularTotal(carritoId, transaction = null) {
    try {
      const [result] = await sequelize.query(`
        SELECT COALESCE(SUM(dc.cantidad * p.precio), 0) as total
        FROM detalles_carrito dc
        JOIN productos p ON dc.producto_id = p.producto_id
        WHERE dc.carrito_id = :carritoId
      `, {
        replacements: { carritoId },
        type: sequelize.QueryTypes.SELECT,
        transaction
      });

      await Carrito.update(
        { total: result.total },
        { 
          where: { carrito_id: carritoId },
          transaction 
        }
      );

      return result.total;
    } catch (error) {
      console.error('Error en recalcularTotal:', error);
      throw error;
    }
  }

  // Validar stock antes de agregar al carrito
  static async validateStock(productoId, cantidad) {
    try {
      const producto = await Producto.findByPk(productoId, {
        attributes: ['stock', 'disponible']
      });

      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      if (!producto.disponible) {
        throw new Error('Producto no disponible');
      }

      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
      }

      return true;
    } catch (error) {
      console.error('Error en validateStock:', error);
      throw error;
    }
  }
}

module.exports = CarritoService; 