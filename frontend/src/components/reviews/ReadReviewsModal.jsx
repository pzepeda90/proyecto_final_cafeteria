import React, { useState, useEffect } from 'react';
import { Star, X, User, Calendar, MessageCircle } from 'lucide-react';
import resenaService from '../../services/resenaService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const ReadReviewsModal = ({ isOpen, onClose, productoId, producto, onWriteReviewClick }) => {
  const [reseñas, setReseñas] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && productoId) {
      cargarReseñas();
    }
  }, [isOpen, productoId]);

  const cargarReseñas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await resenaService.obtenerResenasProducto(productoId);
      
      setReseñas(data.resenas || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error al cargar reseñas:', error);
      setError(`Error al cargar las reseñas: ${error.response?.data?.mensaje || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (calificacion, size = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={size}
        className={`${
          index < calificacion 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatFecha = (fecha) => {
    try {
      return formatDistanceToNow(new Date(fecha), {
        addSuffix: true,
        locale: es
      });
    } catch (error) {
      return 'Hace tiempo';
    }
  };

  const handleWriteReview = () => {
    onClose();
    if (onWriteReviewClick) {
      onWriteReviewClick();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-xl px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <MessageCircle size={20} className="text-blue-500" />
              <span>Reseñas del producto</span>
            </h2>
            {producto && (
              <p className="text-sm text-gray-600 mt-1">{producto.nombre}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {parseFloat(stats.promedioCalificacion).toFixed(1)}
                  </div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {renderStars(Math.round(parseFloat(stats.promedioCalificacion)), 20)}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Basado en {stats.totalResenas} reseña{stats.totalResenas !== 1 ? 's' : ''}</div>
                </div>
              </div>
              <button
                onClick={handleWriteReview}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Escribir reseña
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Cargando reseñas...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-gray-600">{error}</p>
              <button
                onClick={cargarReseñas}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Reintentar
              </button>
            </div>
          ) : reseñas.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay reseñas aún
              </h3>
              <p className="text-gray-600 mb-6">
                Sé el primero en compartir tu opinión sobre este producto
              </p>
              <button
                onClick={handleWriteReview}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Escribir primera reseña
              </button>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {reseñas.map((reseña) => (
                <div key={reseña.resena_id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gray-100 rounded-full p-2 flex-shrink-0">
                      <User size={20} className="text-gray-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {reseña.Usuario?.nombre || 'Usuario'} {reseña.Usuario?.apellido || ''}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              {renderStars(reseña.calificacion)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {reseña.calificacion} de 5 estrellas
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {formatFecha(reseña.fecha_resena)}
                        </div>
                      </div>
                      
                      {reseña.comentario && (
                        <p className="text-gray-700 leading-relaxed mt-3">
                          {reseña.comentario}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con estadísticas */}
        {stats && reseñas.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t">
            <div className="text-xs text-gray-500 text-center">
              {stats.totalResenas} reseña{stats.totalResenas !== 1 ? 's' : ''} • 
              Promedio: {parseFloat(stats.promedioCalificacion).toFixed(1)} estrellas
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadReviewsModal; 