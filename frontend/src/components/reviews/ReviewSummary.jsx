import React, { useState, useEffect, memo } from 'react';
import { Star, MessageCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import resenaService from '../../services/resenaService';

const ReviewSummary = memo(({ productoId, showLink = true, compact = false }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productoId) {
      cargarStats();
    }
  }, [productoId]);

  const cargarStats = async () => {
    try {
      setLoading(true);
      const data = await resenaService.obtenerResenasProducto(productoId);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error al cargar estadísticas de reseñas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (calificacion) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={compact ? 14 : 16}
        className={`${
          index < Math.round(calificacion) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats.totalResenas || stats.totalResenas === 0) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
        <MessageCircle size={compact ? 14 : 16} />
        <span>Sin reseñas aún</span>
        {showLink && (
          <Link 
            to={`/productos/${productoId}/resenas`}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            Sé el primero
          </Link>
        )}
      </div>
    );
  }

  const content = (
    <div className={`flex items-center space-x-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <div className="flex items-center space-x-1">
        {renderStars(stats.promedioCalificacion)}
      </div>
      <span className="font-medium text-gray-700">
        {parseFloat(stats.promedioCalificacion).toFixed(1)}
      </span>
      <div className="flex items-center space-x-1 text-gray-500">
        <Users size={compact ? 12 : 14} />
        <span>
          {stats.totalResenas} reseña{stats.totalResenas !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link 
        to={`/productos/${productoId}/resenas`}
        className="group inline-block hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
      >
        <div className="group-hover:text-blue-600 transition-colors">
          {content}
        </div>
      </Link>
    );
  }

  return content;
});

ReviewSummary.displayName = 'ReviewSummary';

export default ReviewSummary; 