import React, { useState, useEffect } from 'react';
import { Star, Edit2, Trash2, Calendar, MessageCircle, Save, X } from 'lucide-react';
import resenaService from '../../services/resenaService';

const MyReviews = () => {
  const [misResenas, setMisResenas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editandoResena, setEditandoResena] = useState(null);

  useEffect(() => {
    cargarMisResenas();
  }, []);

  const cargarMisResenas = async () => {
    try {
      setLoading(true);
      const data = await resenaService.obtenerMisResenas();
      setMisResenas(data.resenas || []);
    } catch (error) {
      setError('Error al cargar tus reseñas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const manejarEliminarResena = async (resenaId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      await resenaService.eliminarResena(resenaId);
      setMisResenas(prev => prev.filter(r => r.resena_id !== resenaId));
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      alert('Error al eliminar la reseña');
    }
  };

  const manejarActualizarResena = async (resenaId, datosResena) => {
    try {
      await resenaService.actualizarResena(resenaId, datosResena);
      setEditandoResena(null);
      cargarMisResenas();
    } catch (error) {
      console.error('Error al actualizar reseña:', error);
      alert('Error al actualizar la reseña');
    }
  };

  const renderStars = (calificacion) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < calificacion 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Reseñas
          </h1>
          <p className="text-gray-600">
            Gestiona las reseñas que has escrito sobre nuestros productos
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {misResenas.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No has escrito reseñas aún
            </h2>
            <p className="text-gray-600 mb-4">
              Compra algunos productos y comparte tu experiencia con otros clientes
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {misResenas.map((resena) => (
              <div key={resena.resena_id} className="bg-white rounded-lg shadow-sm border p-6">
                {editandoResena === resena.resena_id ? (
                  // Formulario de edición
                  <EditReviewForm
                    resena={resena}
                    onSave={(datos) => manejarActualizarResena(resena.resena_id, datos)}
                    onCancel={() => setEditandoResena(null)}
                  />
                ) : (
                  // Vista normal de la reseña
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        {resena.Producto?.imagen_url && (
                          <img
                            src={resena.Producto.imagen_url}
                            alt={resena.Producto.nombre}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {resena.Producto?.nombre || 'Producto eliminado'}
                          </h3>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{formatearFecha(resena.fecha_resena)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditandoResena(resena.resena_id)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Editar reseña"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => manejarEliminarResena(resena.resena_id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Eliminar reseña"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(resena.calificacion)}
                        </div>
                        <span className="font-medium text-gray-700">
                          {resena.calificacion}/5
                        </span>
                      </div>
                    </div>

                    {resena.comentario && (
                      <div className="text-gray-700 leading-relaxed">
                        {resena.comentario}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para editar reseña
const EditReviewForm = ({ resena, onSave, onCancel }) => {
  const [calificacion, setCalificacion] = useState(resena.calificacion);
  const [comentario, setComentario] = useState(resena.comentario || '');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ calificacion, comentario });
    } finally {
      setLoading(false);
    }
  };

  const renderEditableStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoverRating || calificacion);
      
      return (
        <button
          key={index}
          type="button"
          className={`transition-colors duration-200 ${
            isActive 
              ? 'text-yellow-400 hover:text-yellow-500' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => setCalificacion(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
        >
          <Star 
            size={20} 
            className={isActive ? 'fill-current' : ''} 
          />
        </button>
      );
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start space-x-4 mb-4">
        {resena.Producto?.imagen_url && (
          <img
            src={resena.Producto.imagen_url}
            alt={resena.Producto.nombre}
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Editando reseña de: {resena.Producto?.nombre}
          </h3>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calificación
        </label>
        <div className="flex items-center space-x-1">
          {renderEditableStars()}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comentario
        </label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Actualiza tu comentario..."
          maxLength={1000}
        />
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Save size={16} />
          <span>{loading ? 'Guardando...' : 'Guardar'}</span>
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
        >
          <X size={16} />
          <span>Cancelar</span>
        </button>
      </div>
    </form>
  );
};

export default MyReviews; 