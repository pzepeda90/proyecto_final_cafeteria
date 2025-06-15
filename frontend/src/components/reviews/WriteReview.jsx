import React, { useState } from 'react';
import { Star, Send, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import resenaService from '../../services/resenaService';

const WriteReview = ({ productoId, onReviewCreated, producto }) => {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  
  const { user } = useSelector(state => state.auth);

  const etiquetasCalificacion = {
    1: 'Muy malo',
    2: 'Malo',
    3: 'Regular',
    4: 'Bueno',
    5: 'Excelente'
  };

  const handleSubmit = async (e) => {
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
      setCalificacion(0);
      setComentario('');
      setHoverRating(0);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      if (onReviewCreated) {
        onReviewCreated();
      }
    } catch (error) {
      console.error('Error al crear reseña:', error);
      if (error.response?.status === 409) {
        setError('Ya has reseñado este producto. Solo puedes dejar una reseña por producto.');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Error en los datos proporcionados');
      } else {
        setError('Error al crear la reseña. Por favor inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoverRating || calificacion);
      
      return (
        <button
          key={index}
          type="button"
          className={`transition-all duration-200 transform hover:scale-110 ${
            isActive 
              ? 'text-yellow-400 hover:text-yellow-500' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => setCalificacion(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          title={etiquetasCalificacion[starValue]}
        >
          <Star 
            size={28} 
            className={`${isActive ? 'fill-current' : ''} drop-shadow-sm`} 
          />
        </button>
      );
    });
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <User size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Inicia sesión para escribir una reseña
          </h3>
          <p className="text-gray-600 mb-4">
            Necesitas una cuenta para compartir tu opinión sobre este producto
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Star size={20} className="text-yellow-400" />
        <span>Escribir reseña</span>
      </h3>

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
          <div className="flex items-center space-x-2">
            {renderStars()}
          </div>
          {(calificacion > 0 || hoverRating > 0) && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {hoverRating || calificacion} de 5 estrellas
              </span>
              <span className="text-sm font-medium text-yellow-600">
                - {etiquetasCalificacion[hoverRating || calificacion]}
              </span>
            </div>
          )}
        </div>

        {/* Comentario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Comparte tu experiencia con este producto... ¿Qué te gustó más? ¿Lo recomendarías?"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-500">
              {comentario.length}/1000 caracteres
            </div>
            {comentario.length > 0 && (
              <div className="text-xs text-green-600">
                ¡Gracias por tu opinión detallada!
              </div>
            )}
          </div>
        </div>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading || !calificacion}
          className="w-full flex items-center justify-center space-x-2 bg-primary-500 text-white py-3 px-4 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Publicando...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>Publicar reseña</span>
            </>
          )}
        </button>
      </form>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-primary-50 rounded-lg">
        <p className="text-xs text-primary-600">
          💡 <strong>Tip:</strong> Las reseñas honestas y detalladas ayudan más a otros clientes a tomar decisiones informadas.
        </p>
      </div>
    </div>
  );
};

export default WriteReview; 