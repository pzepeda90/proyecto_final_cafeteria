const { Pedido, Usuario, EstadoPedido, DetallePedido, MetodoPago, Direccion, Producto, HistorialEstadoPedido } = require('../models/orm');
const { sequelize } = require('../models/orm/index');

class PedidoService {
  /**
   * Obtiene todos los pedidos con filtros opcionales
   * @param {Object} options - Opciones de filtrado
   * @returns {Promise<Array>} - Lista de pedidos
   */
  static async findAll(options = {}) {
    try {
      const whereClause = {};
      
      // Filtrar por usuario
      if (options.usuario_id) {
        whereClause.usuario_id = options.usuario_id;
      }
      
      // Filtrar por estado
      if (options.estado_pedido_id) {
        whereClause.estado_pedido_id = options.estado_pedido_id;
      }
      
      // Consultar pedidos con sus relaciones
      const pedidos = await Pedido.findAll({
        where: whereClause,
        include: [
          { model: Usuario, attributes: ['nombre', 'apellido'] },
          { model: EstadoPedido },
          { model: MetodoPago },
          { model: Direccion },
          { 
            model: DetallePedido,
            include: [{ model: Producto }]
          },
          { 
            model: HistorialEstadoPedido,
            include: [{ model: EstadoPedido }],
            order: [['fecha_cambio', 'ASC']]
          }
        ],
        order: [['fecha_pedido', 'DESC']]
      });
      
      return pedidos.map(pedido => pedido.toJSON());
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw error;
    }
  }
  
  /**
   * Obtiene un pedido por su ID
   * @param {number} id - ID del pedido
   * @returns {Promise<Object>} - Pedido encontrado
   */
  static async findById(id) {
    try {
      const pedido = await Pedido.findByPk(id, {
        include: [
          { model: Usuario, attributes: ['nombre', 'apellido'] },
          { model: EstadoPedido },
          { model: MetodoPago },
          { model: Direccion },
          { 
            model: DetallePedido,
            include: [{ model: Producto }]
          },
          { 
            model: HistorialEstadoPedido,
            include: [{ model: EstadoPedido }],
            order: [['fecha_cambio', 'ASC']]
          }
        ]
      });
      
      return pedido ? pedido.toJSON() : null;
    } catch (error) {
      throw new Error(`Error al buscar pedido: ${error.message}`);
    }
  }
  
  /**
   * Crea un nuevo pedido
   * @param {Object} pedidoData - Datos del pedido
   * @returns {Promise<Object>} - Pedido creado
   */
  static async create(pedidoData) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        usuario_id,
        metodo_pago_id,
        direccion_id,
        carrito_id,
        productos
      } = pedidoData;
      
      // Obtener el ID del estado "pendiente"
      const estadoPendiente = await EstadoPedido.findOne({
        where: { nombre: 'pendiente' },
        transaction
      });
      
      const estado_pedido_id = estadoPendiente.estado_pedido_id;
      
      // Calcular subtotal, impuestos y total
      let subtotal = 0;
      for (const producto of productos) {
        subtotal += producto.precio_unitario * producto.cantidad;
      }
      
      const impuestos = subtotal * 0.16; // 16% de impuestos
      const total = subtotal + impuestos;
      
      // Insertar registro de pedido
      const pedido = await Pedido.create({
        usuario_id,
        estado_pedido_id,
        metodo_pago_id,
        direccion_id,
        carrito_id,
        subtotal,
        impuestos,
        total,
        fecha_pedido: new Date()
      }, { transaction });
      
      // Insertar detalles del pedido
      for (const producto of productos) {
        await DetallePedido.create({
          pedido_id: pedido.pedido_id,
          producto_id: producto.producto_id,
          cantidad: producto.cantidad,
          precio_unitario: producto.precio_unitario,
          subtotal: producto.precio_unitario * producto.cantidad
        }, { transaction });
      }
      
      // Registrar primer estado en historial
      await HistorialEstadoPedido.create({
        pedido_id: pedido.pedido_id,
        estado_pedido_id,
        fecha_cambio: new Date(),
        comentario: 'Pedido creado'
      }, { transaction });
      
      await transaction.commit();
      
      // Retornar el pedido completo
      return this.findById(pedido.pedido_id);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear pedido:', error);
      throw error;
    }
  }
  
  /**
   * Actualiza el estado de un pedido
   * @param {number} id - ID del pedido
   * @param {number} estadoId - Nuevo estado
   * @param {string} comentario - Comentario para el cambio
   * @returns {Promise<Object>} - Pedido actualizado
   */
  static async actualizarEstado(id, estadoId, comentario = '') {
    const transaction = await sequelize.transaction();
    
    try {
      const pedido = await Pedido.findByPk(id, { transaction });
      
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }
      
      pedido.estado_pedido_id = estadoId;
      await pedido.save({ transaction });
      
      await HistorialEstadoPedido.create({
        pedido_id: id,
        estado_pedido_id: estadoId,
        fecha_cambio: new Date(),
        comentario
      }, { transaction });
      
      await transaction.commit();
      
      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }
}

module.exports = PedidoService; 