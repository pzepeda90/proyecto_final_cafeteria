import React, { useState, useEffect } from 'react';
import resenaService from '../../services/resenaService';

const ProductReviews = ({ productoId, mostrarFormulario = true }) => {
  const [resenas, setResenas] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productoId) {
      cargarResenas();
    }
  }, [productoId]);

  const cargarResenas = async () => {
    try {
      setLoading(true);
      const data = await resenaService.obtenerResenasProducto(productoId);
      setResenas(data.resenas || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
      setError('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (calificacion) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`inline-block text-lg ${
          index < calificacion 
            ? 'text-yellow-400' 
            : 'text-gray-300'
        }`}
        style={{ fontSize: '18px' }}
      >
        ★
      </span>
    ));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas de reseñas */}
      {stats.totalResenas > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Calificaciones y reseñas
            </h3>
            <div className="text-sm text-gray-500">
              {stats.totalResenas} reseña{stats.totalResenas !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="text-3xl font-bold text-gray-900">
              {parseFloat(stats.promedioCalificacion).toFixed(1)}
            </div>
            <div className="flex items-center space-x-1">
              {renderStars(Math.round(stats.promedioCalificacion))}
            </div>
            <div className="text-sm text-gray-600">
              de 5 estrellas
            </div>
          </div>

          {/* Distribución de calificaciones */}
          {stats.distribucionCalificaciones && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución de calificaciones</h4>
              {[5, 4, 3, 2, 1].map((estrella) => {
                const cantidad = stats.distribucionCalificaciones[estrella] || 0;
                const porcentaje = stats.totalResenas > 0 ? (cantidad / stats.totalResenas) * 100 : 0;
                
                return (
                  <div key={estrella} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-12">
                      <span className="text-sm text-gray-600">{estrella}</span>
                      <span className="text-yellow-400 text-sm">★</span>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${porcentaje}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{cantidad}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <span>💬</span>
          <span>Reseñas de clientes</span>
        </h3>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {resenas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg font-medium mb-2">No hay reseñas aún para este producto</p>
            <p className="text-sm">¡Sé el primero en dejar una reseña y ayuda a otros clientes!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resenas.map((resena) => (
              <div key={resena.resena_id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-2">
                      <span className="text-blue-600">👤</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {resena.Usuario ? 
                          `${resena.Usuario.nombre} ${resena.Usuario.apellido}` : 
                          'Usuario anónimo'
                        }
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>📅</span>
                        <span>{formatearFecha(resena.fecha_resena)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(resena.calificacion)}
                    <span className="ml-2 text-sm text-gray-600">({resena.calificacion}/5)</span>
                  </div>
                </div>

                {resena.comentario && (
                  <div className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                    "{resena.comentario}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews; 