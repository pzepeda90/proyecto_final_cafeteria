import { useState, useEffect } from 'react';
import MesasService from '../../services/mesasService';
import { showError } from '../../services/notificationService';

const MesaSelector = ({ selectedMesa, onMesaSelect, disabled = false }) => {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMesas();
  }, []);

  const loadMesas = async () => {
    try {
      setLoading(true);
      const mesasData = await MesasService.getMesasDisponibles();
      setMesas(mesasData);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
      showError('Error al cargar mesas disponibles');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ocupada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reservada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'fuera_servicio':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return '🚫';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-gray-600">Cargando mesas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar Mesa
        </label>
        <button
          onClick={loadMesas}
          className="text-xs text-primary hover:text-primary-dark"
          disabled={disabled}
        >
          🔄 Actualizar
        </button>
      </div>

      {mesas.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No hay mesas disponibles
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {mesas.map((mesa) => (
            <button
              key={mesa.mesa_id}
              onClick={() => onMesaSelect(mesa)}
              disabled={disabled || mesa.estado !== 'disponible'}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${selectedMesa?.mesa_id === mesa.mesa_id 
                  ? 'border-primary bg-primary text-white' 
                  : `${getEstadoColor(mesa.estado)} hover:shadow-md`
                }
                ${disabled || mesa.estado !== 'disponible' 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
              `}
            >
              <div className="text-center">
                <div className="text-lg font-bold">
                  {mesa.numero}
                </div>
                <div className="text-xs">
                  {getEstadoIcon(mesa.estado)} {mesa.capacidad}p
                </div>
                {mesa.ubicacion && (
                  <div className="text-xs opacity-75 truncate">
                    {mesa.ubicacion}
                  </div>
                )}
              </div>
              
              {selectedMesa?.mesa_id === mesa.mesa_id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedMesa && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm">
            <strong>Mesa seleccionada:</strong> #{selectedMesa.numero}
            {selectedMesa.ubicacion && ` - ${selectedMesa.ubicacion}`}
            <span className="ml-2 text-gray-600">
              (Capacidad: {selectedMesa.capacidad} personas)
            </span>
          </div>
          <button
            onClick={() => onMesaSelect(null)}
            className="mt-2 text-xs text-red-600 hover:text-red-800"
            disabled={disabled}
          >
            ✕ Quitar mesa
          </button>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex items-center gap-4">
          <span>✅ Disponible</span>
          <span>🔴 Ocupada</span>
          <span>🟡 Reservada</span>
          <span>🚫 Fuera de servicio</span>
        </div>
      </div>
    </div>
  );
};

export default MesaSelector; 