import React from 'react';

const ProductRating = ({ 
  calificacion = 0, 
  totalResenas = 0, 
  size = 'sm',
  showCount = true,
  className = '' 
}) => {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= Math.round(calificacion);
      
      return (
        <span
          key={index}
          className={`inline-block ${
            size === 'lg' ? 'text-xl' : 'text-base'
          } ${
            isActive 
              ? 'text-yellow-400' 
              : 'text-gray-300'
          }`}
          style={{ fontSize: size === 'lg' ? '20px' : '16px' }}
        >
          ★
        </span>
      );
    });
  };

  const formatearCalificacion = (rating) => {
    return rating > 0 ? rating.toFixed(1) : '0.0';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {renderStars()}
      </div>
      
      {calificacion > 0 && (
        <span className={`font-medium text-gray-700 ${
          size === 'lg' ? 'text-base' : 'text-sm'
        }`}>
          {formatearCalificacion(calificacion)}
        </span>
      )}
      
      {showCount && totalResenas > 0 && (
        <span className={`text-gray-500 ${
          size === 'lg' ? 'text-sm' : 'text-xs'
        }`}>
          ({totalResenas} reseña{totalResenas !== 1 ? 's' : ''})
        </span>
      )}
      
      {calificacion === 0 && totalResenas === 0 && (
        <span className={`text-gray-400 ${
          size === 'lg' ? 'text-sm' : 'text-xs'
        }`}>
          Sin reseñas
        </span>
      )}
    </div>
  );
};

export default ProductRating; 