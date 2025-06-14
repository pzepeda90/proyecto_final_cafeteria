import React, { useState, useCallback, useMemo } from 'react';
import { Star, Send, User, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import resenaService from '../../services/resenaService';

const WriteReviewModal = ({ isOpen, onClose, productoId, producto, onReviewCreated }) => {
  const { user } = useSelector(state => state.auth);
  
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const etiquetasCalificacion = {
    1: 'Muy malo',
    2: 'Malo', 
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!calificacion) {
      setError('Por favor selecciona una calificación');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await resenaService.crearResena(productoId, {
        calificacion,
        comentario
      });

      setSuccess('¡Gracias por tu reseña! Tu opinión ayuda a otros clientes.');
      
      // Auto-close modal after success
      setTimeout(() => {
        setCalificacion(0);
        setComentario('');
        setHoverRating(0);
        setSuccess('');
        setError('');
        onClose();
        
        if (onReviewCreated) {
          onReviewCreated();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error al crear reseña:', error);
      
      if (error.response?.status === 401) {
        setError('Necesitas iniciar sesión para escribir una reseña. Serás redirigido al login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.response?.status === 409) {
        setError('Ya has reseñado este producto. Solo puedes dejar una reseña por producto.');
      } else if (error.response?.status === 400) {
        setError(error.response.data?.mensaje || error.response.data?.message || 'Error en los datos proporcionados');
      } else if (error.response?.status === 500) {
        setError(`Error del servidor: ${error.response.data?.mensaje || error.response.data?.message || 'Error interno del servidor'}`);
      } else {
        setError('Error al crear la reseña. Por favor inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [calificacion, comentario, productoId, onClose, onReviewCreated]);

  const handleStarClick = useCallback((starValue) => {
    setCalificacion(starValue);
  }, []);

  const handleStarHover = useCallback((starValue) => {
    setHoverRating(starValue);
  }, []);

  const handleStarLeave = useCallback(() => {
    setHoverRating(0);
  }, []);

  const renderStars = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoverRating || calificacion);
      
      return (
        <button
          key={index}
          type="button"
          className={`transition-all duration-150 transform hover:scale-105 ${
            isActive 
              ? 'text-yellow-400 hover:text-yellow-500' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => handleStarClick(starValue)}
          onMouseEnter={() => handleStarHover(starValue)}
          onMouseLeave={handleStarLeave}
          title={etiquetasCalificacion[starValue]}
        >
          <Star 
            size={28} 
            className={`${isActive ? 'fill-current' : ''} drop-shadow-sm`} 
          />
        </button>
      );
    });
  }, [hoverRating, calificacion, handleStarClick, handleStarHover, handleStarLeave, etiquetasCalificacion]);

  const handleClose = useCallback(() => {
    setCalificacion(0);
    setComentario('');
    setHoverRating(0);
    setSuccess('');
    setError('');
    onClose();
  }, [onClose]);

  const handleComentarioChange = useCallback((e) => {
    setComentario(e.target.value);
  }, []);

  if (!isOpen) return null;

  // Overlay con backdrop-blur
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-xl px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Star size={20} className="text-yellow-400" />
              <span>Escribir reseña</span>
            </h2>
            {producto && (
              <p className="text-sm text-gray-600 mt-1">{producto.nombre}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!user ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Inicia sesión para escribir una reseña
              </h3>
              <p className="text-gray-600 mb-6">
                Necesitas una cuenta para compartir tu opinión
              </p>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2 animate-fade-in">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2 animate-fade-in">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Calificación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tu calificación *
                  </label>
                  <div className="flex items-center justify-center space-x-2 py-2">
                    {renderStars}
                  </div>
                  {/* Espacio fijo para el texto de calificación - siempre visible */}
                  <div className="mt-3 text-center h-16 flex flex-col justify-center">
                    <span className="text-sm text-gray-600 h-5 flex items-center justify-center">
                      {(calificacion > 0 || hoverRating > 0) && (
                        `${hoverRating || calificacion} de 5 estrellas`
                      )}
                    </span>
                    <span className="block text-lg font-medium text-yellow-600 mt-1 h-7 flex items-center justify-center">
                      {(calificacion > 0 || hoverRating > 0) && 
                        etiquetasCalificacion[hoverRating || calificacion]
                      }
                    </span>
                  </div>
                </div>

                {/* Comentario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={comentario}
                    onChange={handleComentarioChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Comparte tu experiencia con este producto..."
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-gray-500">
                      {comentario.length}/1000 caracteres
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !calificacion}
                    className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Publicar reseña</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(WriteReviewModal); 