const { Pedido, Usuario, EstadoPedido, DetallePedido, MetodoPago, Direccion, Producto, HistorialEstadoPedido, Vendedor, Mesa } = require('../models/orm');
const { sequelize } = require('../models/orm/index');
const { clearMesasCache } = require('../utils/cache');
const { Op } = require('sequelize');

/**
 * Genera un número de pedido único
 * @returns {Promise<string>} - Número de pedido único
 */
async function generateOrderNumber(transaction = null) {
  const today = new Date();
  const year = today.getFullYear().toString().substr(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  
  // Formato: YYMMDD-XXXX (donde XXXX es un número secuencial)
  const prefix = `${year}${month}${day}`;
  
  // Buscar el último número de pedido del día con transacción
  const queryOptions = {
    where: {
      numero_pedido: {
        [Op.like]: `${prefix}-%`
      }
    },
    order: [['numero_pedido', 'DESC']],
    lock: transaction ? transaction.LOCK.UPDATE : undefined
  };
  
  if (transaction) {
    queryOptions.transaction = transaction;
  }
  
  const lastOrder = await Pedido.findOne(queryOptions);
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.numero_pedido.split('-')[1]);
    sequence = lastSequence + 1;
  }
  
  const sequenceStr = sequence.toString().padStart(4, '0');
  return `${prefix}-${sequenceStr}`;
}

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
          { model: Vendedor, attributes: ['nombre', 'apellido'], required: false },
          { model: Mesa, attributes: ['numero'], required: false },
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
          { model: Vendedor, attributes: ['nombre', 'apellido'], required: false },
          { model: Mesa, attributes: ['numero'], required: false },
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
        vendedor_id,
        metodo_pago_id,
        direccion_id,
        carrito_id,
        productos
      } = pedidoData;
      
      // Obtener el ID del estado "Pendiente"
      const estadoPendiente = await EstadoPedido.findOne({
        where: { nombre: 'Pendiente' },
        transaction
      });
      
      if (!estadoPendiente) {
        throw new Error('Estado "Pendiente" no encontrado en la base de datos');
      }
      
      const estado_pedido_id = estadoPendiente.estado_pedido_id;
      
      // Generar número de pedido único
      const numero_pedido = await generateOrderNumber(transaction);
      
      // Calcular subtotal, impuestos y total
      let subtotal = 0;
      for (const producto of productos) {
        subtotal += producto.precio_unitario * producto.cantidad;
      }
      
      const impuestos = subtotal * 0.19; // 19% de impuestos
      const total = subtotal + impuestos;
      
      // Insertar registro de pedido
      const pedido = await Pedido.create({
        numero_pedido,
        usuario_id,
        vendedor_id,
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
      const pedido = await Pedido.findByPk(id, { 
        include: [{ model: EstadoPedido }],
        transaction 
      });
      
      if (!pedido) {
        throw new Error('Pedido no encontrado');
      }
      
      // Obtener información del nuevo estado
      const nuevoEstado = await EstadoPedido.findByPk(estadoId, { transaction });
      if (!nuevoEstado) {
        throw new Error('Estado de pedido no encontrado');
      }
      
      // Actualizar el estado del pedido
      pedido.estado_pedido_id = estadoId;
      await pedido.save({ transaction });
      
      // Registrar en historial
      await HistorialEstadoPedido.create({
        pedido_id: id,
        estado_pedido_id: estadoId,
        fecha_cambio: new Date(),
        comentario
      }, { transaction });
      
      // Si el pedido se entrega o cancela y tiene mesa asignada, liberar la mesa
      if (['Entregado', 'Cancelado'].includes(nuevoEstado.nombre) && pedido.mesa_id) {
        const MesaService = require('./mesa.service');
        
        // Verificar si hay otros pedidos activos en la misma mesa
        const otrosPedidosActivos = await Pedido.count({
          where: {
            mesa_id: pedido.mesa_id,
            pedido_id: { [Op.ne]: id }, // Excluir el pedido actual
            estado_pedido_id: {
              [Op.notIn]: [
                estadoId, // El nuevo estado (Entregado/Cancelado)
                // Buscar ID del otro estado final
                (await EstadoPedido.findOne({ 
                  where: { nombre: nuevoEstado.nombre === 'Entregado' ? 'Cancelado' : 'Entregado' },
                  transaction 
                }))?.estado_pedido_id
              ].filter(Boolean)
            }
          },
          transaction
        });
        
        // Si no hay otros pedidos activos, liberar la mesa
        if (otrosPedidosActivos === 0) {
          try {
            // Actualizar directamente en la transacción actual
            const { Mesa } = require('../models/orm');
            await Mesa.update(
              { estado: 'disponible', updated_at: new Date() },
              { where: { mesa_id: pedido.mesa_id }, transaction }
            );
            
            console.log(`Mesa ${pedido.mesa_id} liberada automáticamente - pedido ${nuevoEstado.nombre.toLowerCase()}`);
          } catch (mesaError) {
            console.warn('Error al liberar mesa automáticamente:', mesaError);
            // No fallar la transacción por esto
          }
        }
      }
      
      await transaction.commit();
      
      // Invalidar cache si hay mesa involucrada
      if (pedido.mesa_id) {
        try {
          await clearMesasCache();
          console.log('Cache de mesas completamente limpiado después de actualizar pedido');
        } catch (cacheError) {
          console.warn('Error al limpiar cache:', cacheError);
        }
      }
      
      return this.findById(id);
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Error al actualizar estado: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo pedido directo (sin carrito)
   * @param {Object} pedidoData - Datos del pedido directo
   * @returns {Promise<Object>} - Pedido creado
   */
  static async createDirect(pedidoData) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        usuario_id,
        vendedor_id,
        metodo_pago_id,
        direccion_id,
        mesa_id,
        tipo_entrega = 'local',
        notas,
        productos
      } = pedidoData;
      
      // Obtener el ID del estado "Pendiente"
      const estadoPendiente = await EstadoPedido.findOne({
        where: { nombre: 'Pendiente' },
        transaction
      });
      
      if (!estadoPendiente) {
        throw new Error('Estado "Pendiente" no encontrado en la base de datos');
      }
      
      const estado_pedido_id = estadoPendiente.estado_pedido_id;
      
      // Generar número de pedido único
      const numero_pedido = await generateOrderNumber(transaction);
      
      // Calcular subtotal, impuestos y total
      let subtotal = 0;
      for (const producto of productos) {
        subtotal += producto.precio_unitario * producto.cantidad;
      }
      
      const impuestos = subtotal * 0.19; // 19% de impuestos
      const total = subtotal + impuestos;
      
      // Si hay mesa_id, verificar disponibilidad real basada en pedidos activos
      if (mesa_id) {
        console.log(`🏠 PedidoService.createDirect: Procesando mesa_id = ${mesa_id} (tipo: ${typeof mesa_id}) para tipo_entrega = ${tipo_entrega}`);
        
        const MesaService = require('./mesa.service');
        const mesa = await MesaService.findById(mesa_id);
        
        if (!mesa) {
          console.error(`❌ Mesa con ID ${mesa_id} no encontrada`);
          throw new Error(`Mesa con ID ${mesa_id} no encontrada`);
        }
        
        console.log(`✅ Mesa encontrada: ID=${mesa.mesa_id}, Número=${mesa.numero}, estado actual: ${mesa.estado}`);
        
        // Verificar si la mesa tiene pedidos activos (lógica consistente con frontend)
        const pedidosActivos = await Pedido.count({
          where: {
            mesa_id: mesa_id,
            estado_pedido_id: {
              [Op.notIn]: await EstadoPedido.findAll({
                where: { nombre: { [Op.in]: ['Entregado', 'Cancelado'] } },
                attributes: ['estado_pedido_id'],
                transaction
              }).then(estados => estados.map(e => e.estado_pedido_id))
            }
          },
          transaction
        });
        
        console.log(`Mesa ${mesa.numero} tiene ${pedidosActivos} pedidos activos`);
        
        // La mesa está realmente ocupada solo si tiene pedidos activos
        const mesaRealmenteOcupada = pedidosActivos > 0;
        
        console.log(`🔍 ANÁLISIS MESA ${mesa.numero}:`);
        console.log(`   - Estado en BD: ${mesa.estado}`);
        console.log(`   - Pedidos activos: ${pedidosActivos}`);
        console.log(`   - ¿Realmente ocupada?: ${mesaRealmenteOcupada}`);
        console.log(`   - Tipo entrega: ${tipo_entrega}`);
        
        if (mesaRealmenteOcupada) {
          console.error(`❌ RECHAZANDO PEDIDO: Mesa ${mesa.numero} tiene ${pedidosActivos} pedidos activos`);
          throw new Error(`La mesa ${mesa.numero} está ocupada con pedidos activos`);
        }
        
        // Si la mesa no tiene pedidos activos pero está marcada como ocupada, 
        // actualizarla a disponible primero y luego marcarla como ocupada
        if (mesa.estado === 'ocupada' && !mesaRealmenteOcupada) {
          console.log(`Mesa ${mesa.numero} estaba marcada como ocupada sin pedidos activos - sincronizando estado`);
          await MesaService.updateStatus(mesa_id, 'disponible');
        }
        
        // Marcar la mesa como ocupada para el nuevo pedido
        console.log(`Marcando Mesa ${mesa.numero} como ocupada para pedido directo...`);
        await MesaService.updateStatus(mesa_id, 'ocupada');
        console.log(`✅ Mesa ${mesa.numero} marcada como ocupada exitosamente`);
      }
      
      // Insertar registro de pedido (incluir mesa_id si está presente)
      console.log(`📝 CREANDO PEDIDO EN BD:`);
      console.log(`   - numero_pedido: ${numero_pedido}`);
      console.log(`   - usuario_id: ${usuario_id}`);
      console.log(`   - mesa_id: ${mesa_id} (tipo: ${typeof mesa_id})`);
      console.log(`   - tipo_entrega: ${tipo_entrega}`);
      console.log(`   - total: ${total}`);
      
      const pedido = await Pedido.create({
        numero_pedido,
        usuario_id,
        vendedor_id,
        estado_pedido_id,
        metodo_pago_id,
        direccion_id,
        mesa_id,
        carrito_id: null, // Pedidos directos no tienen carrito
        subtotal,
        impuestos,
        total,
        fecha_pedido: new Date(),
        tipo_entrega,
        notas
      }, { transaction });
      
      console.log(`✅ Pedido creado exitosamente: ID=${pedido.pedido_id}, Mesa ID=${pedido.mesa_id}, Número=${pedido.numero_pedido}`);
      console.log(`🔍 VERIFICACIÓN PEDIDO CREADO:`);
      console.log(`   - pedido.mesa_id: ${pedido.mesa_id} (tipo: ${typeof pedido.mesa_id})`);
      console.log(`   - pedido.tipo_entrega: ${pedido.tipo_entrega}`);
      console.log(`   - pedido.estado_pedido_id: ${pedido.estado_pedido_id}`);
      
      // Insertar detalles del pedido
      for (const producto of productos) {
        await DetallePedido.create({
          pedido_id: pedido.pedido_id,
          producto_id: producto.producto_id,
          cantidad: producto.cantidad,
          precio_unitario: producto.precio_unitario,
          subtotal: producto.precio_unitario * producto.cantidad
        }, { transaction });
        
        // Actualizar stock del producto
        const ProductoService = require('./producto.service');
        await ProductoService.updateStock(producto.producto_id, -producto.cantidad, transaction);
      }
      
      // Registrar primer estado en historial
      const comentarioHistorial = mesa_id 
        ? `Pedido directo creado desde POS - Mesa asignada`
        : 'Pedido directo creado desde POS';
        
      await HistorialEstadoPedido.create({
        pedido_id: pedido.pedido_id,
        estado_pedido_id,
        fecha_cambio: new Date(),
        comentario: comentarioHistorial
      }, { transaction });
      
      await transaction.commit();
      
      // Invalidar cache inmediatamente después de crear el pedido si hay mesa involucrada
      if (mesa_id) {
        try {
          await clearMesasCache();
          console.log(`🔥 Cache de mesas COMPLETAMENTE limpiado después de crear pedido para mesa ${mesa_id}`);
        } catch (cacheError) {
          console.warn('Error al limpiar cache inmediatamente:', cacheError);
        }
      }
      
      return this.findById(pedido.pedido_id);
    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear pedido directo:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de pedidos
   * @param {string} periodo - Período de estadísticas (dia, semana, mes, año)
   * @returns {Promise<Object>} - Estadísticas de pedidos
   */
  static async getStatistics(periodo = 'mes') {
    try {
      let fechaInicio;
      const fechaFin = new Date();
      
      // Calcular fecha de inicio según el período
      switch (periodo) {
        case 'dia':
          fechaInicio = new Date();
          fechaInicio.setHours(0, 0, 0, 0);
          break;
        case 'semana':
          fechaInicio = new Date();
          fechaInicio.setDate(fechaInicio.getDate() - 7);
          break;
        case 'mes':
          fechaInicio = new Date();
          fechaInicio.setMonth(fechaInicio.getMonth() - 1);
          break;
        case 'año':
          fechaInicio = new Date();
          fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
          break;
        default:
          fechaInicio = new Date();
          fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      }

      // Obtener estadísticas básicas
      const totalPedidos = await Pedido.count({
        where: {
          fecha_pedido: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        }
      });

      const totalVentas = await Pedido.sum('total', {
        where: {
          fecha_pedido: {
            [Op.between]: [fechaInicio, fechaFin]
          }
        }
      }) || 0;

      // Estadísticas simplificadas para evitar errores de relaciones
      return {
        periodo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        total_pedidos: totalPedidos,
        total_ventas: parseFloat(totalVentas),
        promedio_venta: totalPedidos > 0 ? parseFloat(totalVentas) / totalPedidos : 0,
        pedidos_por_estado: [],
        productos_mas_vendidos: []
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

module.exports = PedidoService; 