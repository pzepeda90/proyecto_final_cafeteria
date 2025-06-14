import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { ROUTE_GENERATORS } from '../../constants/routes';
import Button from '../ui/Button';
import ReviewSummary from '../reviews/ReviewSummary';
import WriteReviewModal from '../reviews/WriteReviewModal';
import ReadReviewsModal from '../reviews/ReadReviewsModal';
import Swal from 'sweetalert2';

const ProductCard = ({ product, onAddToCart, showReviews = true }) => {
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [showReadReviewsModal, setShowReadReviewsModal] = useState(false);

  const handleAddToCart = useCallback(() => {
    onAddToCart(product);
    
    // Mostrar SweetAlert de confirmación
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'success',
      title: `${product.nombre} agregado al carrito`,
      background: '#10B981',
      color: '#ffffff'
    });
  }, [product, onAddToCart]);

  const handleWriteReviewClick = useCallback((e) => {
    e.preventDefault();
    setShowWriteReviewModal(true);
  }, []);

  const handleReadReviewsClick = useCallback((e) => {
    e.preventDefault();
    setShowReadReviewsModal(true);
  }, []);

  const handleCloseWriteModal = useCallback(() => {
    setShowWriteReviewModal(false);
  }, []);

  const handleCloseReadModal = useCallback(() => {
    setShowReadReviewsModal(false);
  }, []);

  const handleReviewCreated = useCallback(() => {
    // Al crear una reseña, cerramos el modal de escribir
    // y no forzamos re-render del componente padre
    setShowWriteReviewModal(false);
  }, []);

  const handleWriteFromReadModal = useCallback(() => {
    setShowReadReviewsModal(false);
    setShowWriteReviewModal(true);
  }, []);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={product.imagen_url || '/placeholder-product.jpg'}
            alt={product.nombre}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
          {!product.disponible && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                No Disponible
              </span>
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
              ¡Últimas {product.stock}!
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {product.nombre}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.descripcion}
          </p>

          {/* Sistema de reseñas integrado - SIN key que force re-renders */}
          {showReviews && (
            <div className="mb-3">
              <ReviewSummary 
                productoId={product.producto_id} 
                compact={true}
                showLink={false}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(product.precio)}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.disponible || product.stock <= 0}
            >
              {product.stock <= 0 ? 'Sin stock' : 'Agregar'}
            </Button>
          </div>

          {/* Enlaces de reseñas - ambos abren modales */}
          {showReviews && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={handleReadReviewsClick}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <span>💬</span>
                <span className="group-hover:underline">Ver reseñas</span>
              </button>
              
              <button
                onClick={handleWriteReviewClick}
                className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover:underline"
              >
                Escribir reseña
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para escribir reseña */}
      <WriteReviewModal
        isOpen={showWriteReviewModal}
        onClose={handleCloseWriteModal}
        productoId={product.producto_id}
        producto={product}
        onReviewCreated={handleReviewCreated}
      />

      {/* Modal para leer reseñas */}
      <ReadReviewsModal
        isOpen={showReadReviewsModal}
        onClose={handleCloseReadModal}
        productoId={product.producto_id}
        producto={product}
        onWriteReviewClick={handleWriteFromReadModal}
      />
    </>
  );
};

export default ProductCard; 