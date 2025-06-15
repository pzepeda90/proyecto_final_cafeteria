const { Mesa } = require('../models/orm');
const { clearMesasCache } = require('../utils/cache');

class MesaService {
  /**
   * Obtiene todas las mesas activas
   * @returns {Promise<Array>} - Lista de mesas
   */
  static async findAll() {
    try {
      const mesas = await Mesa.findAll({
        where: { activa: true },
        order: [['numero', 'ASC']]
      });
      return mesas;
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      throw error;
    }
  }

  /**
   * Obtiene mesas disponibles
   * @returns {Promise<Array>} - Lista de mesas disponibles
   */
  static async findAvailable() {
    try {
      const mesas = await Mesa.findAll({
        where: { 
          activa: true,
          estado: 'disponible'
        },
        order: [['numero', 'ASC']]
      });
      return mesas;
    } catch (error) {
      console.error('Error al obtener mesas disponibles:', error);
      throw error;
    }
  }

  /**
   * Encuentra una mesa por su ID
   * @param {number} id - ID de la mesa
   * @returns {Promise<Object>} - Mesa encontrada
   */
  static async findById(id) {
    try {
      const mesa = await Mesa.findOne({
        where: { mesa_id: id, activa: true }
      });
      return mesa;
    } catch (error) {
      console.error('Error al buscar mesa por ID:', error);
      throw error;
    }
  }

  /**
   * Encuentra una mesa por su número
   * @param {string} numero - Número de la mesa
   * @returns {Promise<Object>} - Mesa encontrada
   */
  static async findByNumber(numero) {
    try {
      const mesa = await Mesa.findOne({
        where: { numero, activa: true }
      });
      return mesa;
    } catch (error) {
      console.error('Error al buscar mesa por número:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una mesa
   * @param {number} id - ID de la mesa
   * @param {string} estado - Nuevo estado
   * @returns {Promise<Object>} - Mesa actualizada
   */
  static async updateStatus(id, estado) {
    try {
      console.log(`Mesa service: Actualizando mesa ${id} a estado ${estado}`);
      
      // Verificar que la mesa existe antes de actualizar
      const mesaExistente = await Mesa.findByPk(id);
      
      if (!mesaExistente) {
        console.log(`Mesa service: Mesa ${id} no encontrada`);
        throw new Error('Mesa no encontrada');
      }

      console.log(`Mesa service: Mesa encontrada - estado actual: ${mesaExistente.estado}`);
      
      // Actualizar usando transacción para asegurar consistencia
      const transaction = await Mesa.sequelize.transaction();
      
      try {
        // Si la mesa se está liberando (poniendo disponible), marcar pedidos como entregados
        if (estado === 'disponible' && mesaExistente.estado !== 'disponible') {
          console.log(`🔄 Mesa ${id}: Liberando mesa que estaba ${mesaExistente.estado} -> disponible`);
          const { Pedido, EstadoPedido } = require('../models/orm');
          const { Op } = require('sequelize');
          
          // Buscar estados "Entregado" y "Cancelado"
          const estadoEntregado = await EstadoPedido.findOne({
            where: { nombre: 'Entregado' },
            transaction
          });
          
          const estadoCancelado = await EstadoPedido.findOne({
            where: { nombre: 'Cancelado' },
            transaction
          });
          
          if (!estadoEntregado) {
            console.error(`❌ Mesa ${id}: No se encontró estado 'Entregado' en la base de datos`);
          } else {
            console.log(`📋 Mesa ${id}: Estado 'Entregado' encontrado con ID: ${estadoEntregado.estado_pedido_id}`);
            console.log(`📋 Mesa ${id}: Buscando pedidos activos para marcar como entregados...`);
            
            // Estados finales para excluir
            const estadosFinales = [estadoEntregado.estado_pedido_id];
            if (estadoCancelado) {
              estadosFinales.push(estadoCancelado.estado_pedido_id);
              console.log(`📋 Mesa ${id}: Estado 'Cancelado' encontrado con ID: ${estadoCancelado.estado_pedido_id}`);
            }
            
            // Primero, ver qué pedidos hay activos
            const pedidosActivos = await Pedido.findAll({
              where: {
                mesa_id: id,
                estado_pedido_id: {
                  [Op.notIn]: estadosFinales
                }
              },
              include: [{ model: EstadoPedido, attributes: ['nombre'] }],
              transaction
            });
            
            console.log(`📋 Mesa ${id}: Encontrados ${pedidosActivos.length} pedidos activos:`);
            pedidosActivos.forEach(p => {
              console.log(`   - Pedido ID: ${p.pedido_id}, Estado actual: ${p.EstadoPedido?.nombre || 'N/A'} (ID: ${p.estado_pedido_id})`);
            });
            
            if (pedidosActivos.length > 0) {
              // Actualizar pedidos activos de esta mesa a "Entregado"
              const pedidosActualizados = await Pedido.update(
                { estado_pedido_id: estadoEntregado.estado_pedido_id },
                {
                  where: {
                    mesa_id: id,
                    estado_pedido_id: {
                      [Op.notIn]: estadosFinales
                    }
                  },
                  transaction
                }
              );
              
              console.log(`✅ Mesa ${id}: ${pedidosActualizados[0]} pedidos actualizados a 'Entregado'`);
              
              // Verificar que se actualizaron correctamente
              const pedidosVerificacion = await Pedido.findAll({
                where: {
                  mesa_id: id,
                  estado_pedido_id: {
                    [Op.notIn]: estadosFinales
                  }
                },
                transaction
              });
              
              if (pedidosVerificacion.length === 0) {
                console.log(`✅ Mesa ${id}: Verificación exitosa - No quedan pedidos activos`);
              } else {
                console.log(`⚠️ Mesa ${id}: ADVERTENCIA - Quedan ${pedidosVerificacion.length} pedidos activos después de la actualización`);
              }
            } else {
              console.log(`ℹ️ Mesa ${id}: No había pedidos activos para marcar como entregados`);
            }
          }
        }
        
        // Actualizar la mesa con transacción
        await Mesa.update(
          { 
            estado: estado,
            updated_at: new Date()
          },
          { 
            where: { mesa_id: id },
            transaction
          }
        );
        
        // Confirmar la transacción
        await transaction.commit();
        
        // Obtener la mesa actualizada con datos frescos
        const mesaActualizada = await Mesa.findByPk(id);
        console.log(`Mesa service: Estado actualizado exitosamente a: ${mesaActualizada.estado}`);
        
        // Verificar que el estado se actualizó correctamente
        if (mesaActualizada.estado !== estado) {
          throw new Error(`Error: Estado no se actualizó correctamente. Esperado: ${estado}, Actual: ${mesaActualizada.estado}`);
        }
        
        // NOTA: NO ejecutar sincronización automática después de cambio manual
        // porque puede revertir el cambio si los pedidos no se marcaron correctamente como entregados
        // La sincronización se ejecuta periódicamente de todas formas
        
        // Invalidar cache después de actualizar estado
        try {
          await clearMesasCache();
          console.log(`🔥 Cache de mesas COMPLETAMENTE limpiado después de actualizar mesa ${id}`);
        } catch (cacheError) {
          console.warn('Error al limpiar cache:', cacheError);
        }
        
        return mesaActualizada;
        
      } catch (transactionError) {
        // Revertir la transacción en caso de error
        await transaction.rollback();
        throw transactionError;
      }
      
    } catch (error) {
      console.error('Error al actualizar estado de mesa:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva mesa
   * @param {Object} mesaData - Datos de la mesa
   * @returns {Promise<Object>} - Mesa creada
   */
  static async create(mesaData) {
    try {
      const mesa = await Mesa.create(mesaData);
      return mesa;
    } catch (error) {
      console.error('Error al crear mesa:', error);
      throw error;
    }
  }

  /**
   * Actualiza una mesa
   * @param {number} id - ID de la mesa
   * @param {Object} mesaData - Nuevos datos de la mesa
   * @returns {Promise<Object>} - Mesa actualizada
   */
  static async update(id, mesaData) {
    try {
      const mesa = await Mesa.findByPk(id);
      
      if (!mesa) {
        throw new Error('Mesa no encontrada');
      }

      Object.assign(mesa, mesaData);
      await mesa.save();
      
      return mesa;
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      throw error;
    }
  }

  /**
   * Elimina una mesa (marca como inactiva)
   * @param {number} id - ID de la mesa
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const mesa = await Mesa.findByPk(id);
      
      if (!mesa) {
        throw new Error('Mesa no encontrada');
      }

      mesa.activa = false;
      await mesa.save();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      throw error;
    }
  }

  /**
   * Sincroniza el estado de las mesas basado en pedidos activos
   * Las mesas marcadas como ocupadas sin pedidos activos se marcan como disponibles
   * Las mesas disponibles con pedidos activos se marcan como ocupadas
   * @returns {Promise<number>} - Número de mesas sincronizadas
   */
  static async sincronizarEstadosMesas() {
    try {
      const { Pedido, EstadoPedido } = require('../models/orm');
      const { Op } = require('sequelize');
      
      // Obtener IDs de estados finales (Entregado, Cancelado)
      const estadosFinales = await EstadoPedido.findAll({
        where: { nombre: { [Op.in]: ['Entregado', 'Cancelado'] } },
        attributes: ['estado_pedido_id']
      }).then(estados => estados.map(e => e.estado_pedido_id));
      
      // Obtener todas las mesas activas (excluyendo fuera_servicio y reservada)
      const mesas = await Mesa.findAll({
        where: { 
          activa: true,
          estado: { [Op.in]: ['disponible', 'ocupada'] }
        }
      });
      
      let mesasSincronizadas = 0;
      
      for (const mesa of mesas) {
        // Verificar si tiene pedidos activos
        const pedidosActivos = await Pedido.count({
          where: {
            mesa_id: mesa.mesa_id,
            estado_pedido_id: {
              [Op.notIn]: estadosFinales
            }
          }
        });
        
        const tienePedidosActivos = pedidosActivos > 0;
        const estadoEsperado = tienePedidosActivos ? 'ocupada' : 'disponible';
        
        // Si el estado actual no coincide con el esperado, sincronizar
        if (mesa.estado !== estadoEsperado) {
          await mesa.update({ 
            estado: estadoEsperado,
            updated_at: new Date()
          });
          
          console.log(`Mesa ${mesa.numero} sincronizada: ${mesa.estado} -> ${estadoEsperado} (${tienePedidosActivos ? 'con' : 'sin'} pedidos activos)`);
          mesasSincronizadas++;
        }
      }
      
      // Invalidar cache si se sincronizaron mesas
      if (mesasSincronizadas > 0) {
        try {
          await clearMesasCache();
          console.log('Cache de mesas completamente limpiado después de sincronización');
        } catch (cacheError) {
          console.warn('Error al limpiar cache:', cacheError);
        }
      }
      
      return mesasSincronizadas;
    } catch (error) {
      console.error('Error al sincronizar estados de mesas:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las mesas con información de pedidos activos
   * Incluye sincronización automática de estados
   * @returns {Promise<Array>} - Lista de mesas con pedidos
   */
  static async findAllWithOrders() {
    try {
      // Sincronizar estados antes de consultar
      await this.sincronizarEstadosMesas();
      console.log('✅ SINCRONIZACIÓN AUTOMÁTICA REACTIVADA');
      
      const { Pedido, Usuario, EstadoPedido } = require('../models/orm');
      const { Op } = require('sequelize');
      
      // Obtener IDs de estados finales ANTES de la consulta principal
      const estadosFinales = await EstadoPedido.findAll({
        where: { nombre: { [Op.in]: ['Entregado', 'Cancelado'] } },
        attributes: ['estado_pedido_id']
      }).then(estados => estados.map(e => e.estado_pedido_id));
      
      console.log('🔍 Estados finales encontrados:', estadosFinales);
      
      const mesas = await Mesa.findAll({
        where: { activa: true },
        include: [{
          model: Pedido,
          required: false,
          where: {
            estado_pedido_id: {
              [Op.notIn]: estadosFinales
            }
          },
          include: [
            { model: Usuario, attributes: ['nombre', 'apellido'] },
            { model: EstadoPedido, attributes: ['nombre'] }
          ]
        }],
        order: [['numero', 'ASC']]
      });
      
      console.log(`🔍 CONSULTA MESAS CON PEDIDOS - Encontradas ${mesas.length} mesas:`);
      mesas.forEach(mesa => {
        const pedidosActivos = mesa.Pedidos || [];
        console.log(`   Mesa ${mesa.numero}: ${pedidosActivos.length} pedidos activos`);
        pedidosActivos.forEach(pedido => {
          console.log(`     - Pedido ID: ${pedido.pedido_id}, Mesa ID: ${pedido.mesa_id}, Estado: ${pedido.EstadoPedido?.nombre}`);
        });
      });
      
      const mesasConPedidos = mesas.filter(mesa => mesa.Pedidos && mesa.Pedidos.length > 0);
      console.log(`Mesa service: Encontradas ${mesas.length} mesas`);
      console.log(`Mesa service: ${mesasConPedidos.length} mesas tienen pedidos activos`);
      
      return mesas.map(mesa => mesa.toJSON());
    } catch (error) {
      console.error('Error al obtener mesas con pedidos:', error);
      throw error;
    }
  }
}

module.exports = MesaService; 