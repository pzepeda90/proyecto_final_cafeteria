import { useState, useEffect, useRef, useCallback } from 'react';
import MesasService from '../../services/mesasService';
import { showError, showSuccess } from '../../services/notificationService';
import '../../styles/pos.css';

const MesaSelector = ({ selectedMesa, onMesaSelect, disabled = false, compact = false, externalRefresh = null }) => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredMesa, setHoveredMesa] = useState(null);
  const lastUpdateRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  useEffect(() => {
    loadMesas();
    
    // Configurar polling automático con intervalo más largo
    const interval = setInterval(() => {
      const now = new Date().getTime();
      if (!lastUpdateRef.current || (now - lastUpdateRef.current) > 30000) {
        console.log('Polling: Actualizando mesas automáticamente');
        loadMesas();
      } else {
        console.log('Polling: Salteando actualización por cambio reciente');
      }
    }, 180000); // Actualizar cada 3 minutos para reducir conflictos
    
    console.log('✅ POLLING AUTOMÁTICO REACTIVADO - Cada 3 minutos');
    
    return () => clearInterval(interval);
  }, []);

  // Función para refrescar externamente (cuando se crean pedidos)
  const refreshMesas = useCallback(() => {
    console.log('🔄 REFRESH EXTERNO SOLICITADO desde POS');
    console.log('🔄 Timestamp del refresh:', new Date().toISOString());
    loadMesas();
  }, []);

  // Efecto para manejar refreshes externos
  useEffect(() => {
    if (externalRefresh > 0) {
      console.log(`🔄 TRIGGER RECIBIDO: ${externalRefresh} - Ejecutando refresh...`);
      console.log('🔄 Timestamp del trigger:', new Date().toISOString());
      refreshMesas();
    }
  }, [externalRefresh, refreshMesas]);

  // Efecto para monitorear cambios importantes en el estado de mesas
  useEffect(() => {
    if (mesas.length > 0) {
      const mesasOcupadas = mesas.filter(m => m.estado === 'ocupada' || m.pedido_activo);
      if (mesasOcupadas.length > 0) {
        console.log('📊 MESAS OCUPADAS/CON PEDIDOS:');
        mesasOcupadas.forEach(m => {
          console.log(`   Mesa ${m.numero}: Estado=${m.estado}, Pedido=${m.pedido_activo ? 'ID:' + m.pedido_activo.pedido_id : 'NO'}`);
        });
      }
    }
  }, [mesas]);

  // Cleanup de timeouts al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const loadMesas = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando mesas desde el servidor...');
      
      let mesasData;
      try {
        // Intentar usar el endpoint que incluye información de pedidos activos
        mesasData = await MesasService.getMesasConPedidos();
        console.log('📋 Mesas recibidas del servidor (con pedidos):', mesasData.length, 'mesas');
        console.log('📋 Detalle de mesas ocupadas:', mesasData.filter(m => m.estado === 'ocupada').map(m => ({
          numero: m.numero,
          estado: m.estado,
          pedidos: m.Pedidos?.length || 0
        })));
        
        // Procesar las mesas para determinar el estado real basado en pedidos activos
        const mesasConEstadoActualizado = mesasData.map(mesa => {
          // Si la mesa tiene pedidos activos, debe estar ocupada
          const tienePedidoActivo = mesa.Pedidos && mesa.Pedidos.length > 0;
          
          // Determinar el estado real de la mesa
          let estadoReal;
          if (tienePedidoActivo) {
            // Si tiene pedidos activos, siempre ocupada
            estadoReal = 'ocupada';
          } else {
            // Si no tiene pedidos activos, usar el estado de la mesa
            estadoReal = mesa.estado;
          }
          
          if (tienePedidoActivo) {
            console.log(`Mesa ${mesa.numero} tiene pedido activo:`, mesa.Pedidos[0]);
          }
          
          return {
            ...mesa,
            estado: estadoReal,
            pedido_activo: tienePedidoActivo ? mesa.Pedidos[0] : null
          };
        });
        
        console.log('✅ Mesas procesadas:');
        mesasConEstadoActualizado.forEach(m => {
          console.log(`   Mesa ${m.numero}: ${m.estado} ${m.pedido_activo ? '(CON PEDIDO)' : '(SIN PEDIDO)'}`);
          if (m.pedido_activo) {
            console.log(`     - Pedido ID: ${m.pedido_activo.pedido_id}, Estado: ${m.pedido_activo.EstadoPedido?.nombre || 'N/A'}`);
            console.log(`     - Cliente: ${m.pedido_activo.Usuario ? `${m.pedido_activo.Usuario.nombre} ${m.pedido_activo.Usuario.apellido}` : 'N/A'}`);
          }
        });
        
        // Actualizar directamente sin preservar cambios manuales para evitar conflictos
        setMesas(mesasConEstadoActualizado);
        console.log('🔄 Estado de mesas actualizado en componente');
        
        // Log inmediato del nuevo estado
        setTimeout(() => {
          console.log('📊 ESTADO FINAL DE MESAS EN COMPONENTE:');
          mesasConEstadoActualizado.forEach(m => {
            console.log(`   Mesa ${m.numero}: ${m.estado} ${m.pedido_activo ? '(CON PEDIDO)' : '(SIN PEDIDO)'}`);
          });
        }, 100);
        
      } catch (pedidosError) {
        console.warn('Error al cargar mesas con pedidos, usando endpoint básico:', pedidosError);
        
        // Fallback: usar el endpoint básico de mesas
        mesasData = await MesasService.getMesas();
        console.log('Mesas recibidas del servidor (básico):', mesasData);
        setMesas(mesasData);
      }
      
      lastUpdateRef.current = new Date().getTime();
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      showError('Error al cargar mesas disponibles');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = async (mesa, nuevoEstado) => {
    console.log(`🔄 INICIO - Mesa ${mesa.numero}: Cambiando estado de ${mesa.estado} -> ${nuevoEstado}`);
    console.log(`🔄 Mesa ${mesa.numero}: Mesa ID: ${mesa.mesa_id}`);
    
    try {
      // Actualizar estado local inmediatamente para feedback visual
      const mesasActualizadas = mesas.map(m => 
        m.mesa_id === mesa.mesa_id ? { ...m, estado: nuevoEstado } : m
      );
      setMesas(mesasActualizadas);
      console.log(`✅ Mesa ${mesa.numero}: Estado local actualizado a ${nuevoEstado}`);
      
             // Llamar al backend para persistir el cambio
       console.log(`🌐 Mesa ${mesa.numero}: Enviando petición al backend...`);
       const response = await MesasService.updateEstadoMesa(mesa.mesa_id, nuevoEstado);
       console.log(`✅ Mesa ${mesa.numero}: Respuesta del backend:`, response);
      
             // Verificar que la respuesta del backend coincida
       if (response && response.mesa && response.mesa.estado === nuevoEstado) {
         console.log(`✅ Mesa ${mesa.numero}: Backend confirmó el cambio a ${nuevoEstado}`);
       } else {
         console.error(`❌ Mesa ${mesa.numero}: Backend NO confirmó el cambio. Respuesta:`, response);
         console.log(`🔍 Mesa ${mesa.numero}: Estado esperado: ${nuevoEstado}, Estado recibido: ${response?.mesa?.estado}`);
       }
      
      // Actualizar timestamp para evitar conflictos con polling
      lastUpdateRef.current = new Date().getTime();
      
      // Si se liberó una mesa, hacer UN refresh después de 2 segundos para confirmar
      if (nuevoEstado === 'disponible' && mesa.estado === 'ocupada') {
        console.log(`🔄 Mesa ${mesa.numero}: Programando refresh de confirmación en 2s...`);
        setTimeout(() => {
          console.log(`🔄 Mesa ${mesa.numero}: Ejecutando refresh de confirmación`);
          loadMesas();
        }, 2000);
      }
      
      // Si la mesa seleccionada cambió a un estado no disponible, deseleccionarla
      if (selectedMesa && selectedMesa.mesa_id === mesa.mesa_id && 
          ['ocupada', 'fuera_servicio'].includes(nuevoEstado)) {
        onMesaSelect(null);
      }
      
      console.log(`🎉 ÉXITO - Mesa ${mesa.numero}: Proceso completado exitosamente`);
      
    } catch (error) {
      console.error(`❌ ERROR - Mesa ${mesa.numero}: Error al cambiar estado:`, error);
      
      // Revertir cambio local en caso de error
      loadMesas();
      
      // Mostrar error al usuario
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert(`Error al cambiar estado de la mesa: ${error.message}`);
      }
    }
  };

  const handleMesaHoverEnter = (mesaId) => {
    // Limpiar cualquier timeout previo
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Pequeño delay para evitar activaciones accidentales
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMesa(mesaId);
    }, 150); // 150ms de delay
  };

  const handleMesaHoverLeave = () => {
    // Limpiar timeout si existe
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Delay para permitir movimiento del mouse al menú
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMesa(null);
    }, 100); // 100ms para permitir transición al menú
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'ocupada':
        return 'border-red-500 bg-red-50 text-red-700';
      case 'reservada':
        return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'fuera_servicio':
        return 'border-gray-500 bg-gray-50 text-gray-700';
      default:
        return 'border-gray-300 bg-white text-gray-700';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'disponible':
        return '✅';
      case 'ocupada':
        return '🔴';
      case 'reservada':
        return '🟡';
      case 'fuera_servicio':
        return '⚫';
      default:
        return '❓';
    }
  };

  const getAccionesDisponibles = (mesa) => {
    const acciones = [];
    
    switch (mesa.estado) {
      case 'disponible':
        acciones.push(
          { estado: 'ocupada', icono: '🔴', texto: 'Ocupar', color: 'hover:bg-red-100' },
          { estado: 'reservada', icono: '🟡', texto: 'Reservar', color: 'hover:bg-yellow-100' },
          { estado: 'fuera_servicio', icono: '🚫', texto: 'Fuera de servicio', color: 'hover:bg-gray-100' }
        );
        break;
      case 'ocupada':
        acciones.push(
          { estado: 'disponible', icono: '✅', texto: 'Liberar', color: 'hover:bg-green-100' },
          { estado: 'fuera_servicio', icono: '🚫', texto: 'Fuera de servicio', color: 'hover:bg-gray-100' }
        );
        break;
      case 'reservada':
        acciones.push(
          { estado: 'ocupada', icono: '🔴', texto: 'Ocupar', color: 'hover:bg-red-100' },
          { estado: 'disponible', icono: '✅', texto: 'Liberar', color: 'hover:bg-green-100' },
          { estado: 'fuera_servicio', icono: '🚫', texto: 'Fuera de servicio', color: 'hover:bg-gray-100' }
        );
        break;
      case 'fuera_servicio':
        acciones.push(
          { estado: 'disponible', icono: '🔄', texto: 'Activar', color: 'hover:bg-green-100' }
        );
        break;
    }
    
    return acciones;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Seleccionar Mesa</h3>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Cargando mesas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg ${compact ? 'shadow-sm p-3' : 'shadow p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`${compact ? 'text-sm' : 'text-lg'} font-medium`}>
          {compact ? '🪑 Mesa' : 'Seleccionar Mesa'}
        </h3>
        <button
          onClick={loadMesas}
          className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
          title="Actualizar estados de mesas"
        >
          🔄 {compact ? '' : 'Actualizar'}
        </button>
      </div>
      
      {/* Leyenda de estados - Solo mostrar si no es compacto */}
      {!compact && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-700 mb-2">Estados de mesa:</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1">✅ Disponible</span>
            <span className="flex items-center gap-1">🔴 Ocupada</span>
            <span className="flex items-center gap-1">🟡 Reservada</span>
            <span className="flex items-center gap-1">⚫ Fuera de servicio</span>
          </div>
        </div>
      )}

      <div className={`grid ${compact ? 'grid-cols-4 sm:grid-cols-6 gap-1' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2'} overflow-visible`}>
        {mesas
          .sort((a, b) => parseInt(a.numero) - parseInt(b.numero)) // Ordenar por número de mesa
          .map((mesa, index) => {
          const isSelected = selectedMesa && selectedMesa.mesa_id === mesa.mesa_id;
          const estadoColor = getEstadoColor(mesa.estado);
          const estadoIcon = getEstadoIcon(mesa.estado);
          const acciones = getAccionesDisponibles(mesa);
          
          return (
            <div key={mesa.mesa_id} className="relative overflow-visible mesa-grid-item">
              <button
                onClick={() => {
                  if (!disabled && mesa.estado === 'disponible') {
                    onMesaSelect(mesa);
                  }
                }}
                onMouseEnter={() => handleMesaHoverEnter(mesa.mesa_id)}
                onMouseLeave={handleMesaHoverLeave}
                disabled={disabled}
                className={`
                  mesa-button-area w-full ${compact ? 'h-16 p-1 mesa-card-compact' : 'h-20 p-2 mesa-card'} rounded-lg border-2 transition-all duration-200 text-center flex flex-col justify-center items-center
                  ${estadoColor}
                  ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${mesa.estado === 'disponible' && !disabled ? 'hover:shadow-md cursor-pointer hover-lift' : 
                    disabled ? 'cursor-not-allowed opacity-75' : 'cursor-default hover:shadow-sm'}
                `}
              >
                <div className="text-xs mb-1">{estadoIcon}</div>
                <div className="font-bold text-[10px] leading-tight mesa-text-small">Mesa {mesa.numero}</div>
                <div className="text-[9px] opacity-75 mesa-text-small">
                  {mesa.capacidad}p
                </div>
                {/* Mostrar información del pedido activo si existe */}
                {mesa.pedido_activo && (
                  <div className="text-[7px] text-red-600 font-medium mt-0.5 truncate w-full px-1">
                    #{mesa.pedido_activo.numero_pedido.split('-')[1]}
                  </div>
                )}
              </button>
                
              {/* Menú contextual que aparece cuando está en hover */}
              {!disabled && acciones.length > 0 && hoveredMesa === mesa.mesa_id && (
                <div 
                  className="absolute inset-0 z-40 pointer-events-none"
                  onMouseEnter={() => handleMesaHoverEnter(mesa.mesa_id)}
                  onMouseLeave={handleMesaHoverLeave}
                >
                  {compact ? (
                    // Versión compacta: menú flotante pequeño
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-auto">
                      <div className="flex gap-1 bg-white rounded-lg shadow-2xl border border-gray-200 p-1.5 backdrop-blur-sm mesa-actions-button">
                        {acciones.slice(0, 2).map(accion => (
                          <button
                            key={accion.estado}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEstadoChange(mesa, accion.estado);
                            }}
                            className={`
                              w-7 h-7 rounded-md transition-all duration-200 hover:scale-110 active:scale-95
                              ${accion.color} border border-gray-300 hover:border-gray-400
                              flex items-center justify-center pointer-events-auto
                              shadow-sm hover:shadow-md
                            `}
                            title={`${accion.texto} mesa ${mesa.numero}`}
                          >
                            <span className="text-xs font-medium">{accion.icono}</span>
                          </button>
                        ))}
                        {/* Pequeña flecha indicadora */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white filter drop-shadow-sm"></div>
                      </div>
                    </div>
                  ) : (
                    // Versión completa: menú lateral elegante
                    <div className="absolute top-0 left-full ml-3 flex items-start pointer-events-auto">
                      <div className="flex flex-col gap-1 bg-white rounded-xl shadow-2xl border border-gray-200 p-2 min-w-max backdrop-blur-sm mesa-actions-button">
                        <div className="text-xs font-semibold text-gray-500 px-2 py-1 border-b border-gray-100">
                          Mesa {mesa.numero}
                        </div>
                        {acciones.map(accion => (
                          <button
                            key={accion.estado}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEstadoChange(mesa, accion.estado);
                            }}
                            className={`
                              px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 active:scale-95
                              ${accion.color} border border-gray-200 hover:border-gray-300
                              flex items-center gap-3 whitespace-nowrap pointer-events-auto
                              shadow-sm hover:shadow-md font-medium
                            `}
                            title={`${accion.texto} mesa ${mesa.numero}`}
                          >
                            <span className="text-base">{accion.icono}</span>
                            <span>{accion.texto}</span>
                          </button>
                        ))}
                        {/* Flecha lateral */}
                        <div className="absolute top-4 right-full w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white filter drop-shadow-sm"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de debug temporal */}
              <div className="absolute top-0 right-0 p-1">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const response = await fetch(`http://localhost:3000/api/pedidos?mesa_id=${mesa.mesa_id}`, {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                      });
                      const data = await response.json();
                      console.log(`🔍 DEBUG Mesa ${mesa.numero} - Pedidos:`, data);
                      alert(`Mesa ${mesa.numero} tiene ${data.pedidos?.length || 0} pedidos. Ver consola para detalles.`);
                    } catch (error) {
                      console.error('Error al obtener pedidos:', error);
                    }
                  }}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  title="Ver pedidos de esta mesa"
                >
                  🔍
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {mesas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">��</div>
          <p>No hay mesas disponibles</p>
        </div>
      )}
      
      {selectedMesa && (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary/12 to-primary/8 border border-primary/25 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 justify-center mb-1">
            <span className="text-base">🪑</span>
            <p className="text-sm font-semibold text-primary">
              Mesa Seleccionada: {selectedMesa.numero}
            </p>
          </div>
          <p className="text-xs text-primary/80 text-center mb-2">
            ({selectedMesa.capacidad} personas)
          </p>
          {selectedMesa.ubicacion && (
            <p className="text-xs text-gray-600 text-center">
              📍 {selectedMesa.ubicacion}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MesaSelector; 