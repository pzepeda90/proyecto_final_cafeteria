import React, { memo, useCallback, useMemo } from 'react';
import { useLazyImage, useIntersectionObserver } from '../hooks/useVirtualScrolling';
import { createOptimizedImageUrl } from '../utils/imageOptimization';

/**
 * Componente de tarjeta de producto optimizado
 * - Memoización con React.memo
 * - Lazy loading de imágenes
 * - Optimización de callbacks
 * - Intersection Observer para animaciones
 */
const OptimizedProductCard = memo(({
  product,
  onAddToCart,
  onViewDetails,
  isInWishlist = false,
  onToggleWishlist,
  showQuickActions = true,
  priority = false,
  className = '',
}) => {
  // Memoizar datos procesados del producto
  const productData = useMemo(() => ({
    id: product.id,
    name: product.nombre || product.name,
    price: product.precio || product.price,
    originalPrice: product.precio_original || product.originalPrice,
    description: product.descripcion || product.description,
    image: product.imagen || product.image,
    category: product.categoria || product.category,
    stock: product.stock || 0,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    discount: product.descuento || product.discount || 0,
  }), [product]);

  // Intersection Observer para animaciones
  const [cardRef, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  // Lazy loading optimizado de imagen
  const { imgProps, isLoaded, error } = useLazyImage(
    productData.image,
    {
      placeholder: '/images/product-placeholder.webp',
      threshold: 0.1,
      rootMargin: '100px',
    }
  );

  // Memoizar URLs de imagen optimizada
  const optimizedImageUrl = useMemo(async () => {
    if (!productData.image) return null;
    
    return await createOptimizedImageUrl(productData.image, {
      width: 300,
      height: 300,
      quality: 85,
      fit: 'cover',
    });
  }, [productData.image]);

  // Callbacks memoizados para evitar re-renders
  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    onAddToCart?.(productData);
  }, [onAddToCart, productData]);

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(productData);
  }, [onViewDetails, productData]);

  const handleToggleWishlist = useCallback((e) => {
    e.stopPropagation();
    onToggleWishlist?.(productData.id, !isInWishlist);
  }, [onToggleWishlist, productData.id, isInWishlist]);

  // Memoizar cálculos de precio
  const priceInfo = useMemo(() => {
    const currentPrice = productData.price;
    const originalPrice = productData.originalPrice;
    const discount = productData.discount;
    
    const hasDiscount = discount > 0 || (originalPrice && originalPrice > currentPrice);
    const discountPercentage = hasDiscount
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;
    
    return {
      currentPrice,
      originalPrice,
      hasDiscount,
      discountPercentage,
      savings: hasDiscount ? (originalPrice - currentPrice) : 0,
    };
  }, [productData.price, productData.originalPrice, productData.discount]);

  // Clases CSS memoizadas
  const cardClasses = useMemo(() => {
    const baseClasses = `
      relative bg-white rounded-lg shadow-md hover:shadow-lg 
      transition-all duration-300 ease-in-out cursor-pointer
      border border-gray-200 hover:border-gray-300
      transform hover:-translate-y-1
    `;
    
    const visibilityClasses = isVisible 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-4';
    
    return `${baseClasses} ${visibilityClasses} ${className}`.trim();
  }, [isVisible, className]);

  // Render condicional para productos fuera del viewport
  if (!isVisible && !priority) {
    return (
      <div 
        ref={cardRef}
        className="h-96 bg-gray-100 rounded-lg animate-pulse"
        style={{ minHeight: '384px' }}
      />
    );
  }

  return (
    <article
      ref={cardRef}
      className={cardClasses}
      onClick={handleViewDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleViewDetails();
        }
      }}
      aria-label={`Ver detalles de ${productData.name}`}
    >
      {/* Badge de descuento */}
      {priceInfo.hasDiscount && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            -{priceInfo.discountPercentage}%
          </span>
        </div>
      )}

      {/* Botón de wishlist */}
      {showQuickActions && (
        <button
          onClick={handleToggleWishlist}
          className={`
            absolute top-2 right-2 z-10 p-2 rounded-full
            transition-colors duration-200
            ${isInWishlist 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'
            }
          `}
          aria-label={isInWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
        </button>
      )}

      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
        {error ? (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          <img
            {...imgProps}
            alt={productData.name}
            className={`
              w-full h-full object-cover transition-all duration-300
              ${isLoaded ? 'scale-100 blur-0' : 'scale-105 blur-sm'}
            `}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
          />
        )}

        {/* Overlay con acciones rápidas */}
        {showQuickActions && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 space-x-2">
              <button
                onClick={handleViewDetails}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Ver detalles"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              
              {productData.stock > 0 && (
                <button
                  onClick={handleAddToCart}
                  className="p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
                  aria-label="Agregar al carrito"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4 space-y-3">
        {/* Categoría */}
        {productData.category && (
          <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
            {productData.category}
          </span>
        )}

        {/* Nombre del producto */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
          {productData.name}
        </h3>

        {/* Descripción */}
        {productData.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {productData.description}
          </p>
        )}

        {/* Rating */}
        {productData.rating > 0 && (
          <div className="flex items-center space-x-1">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(productData.rating) ? 'fill-current' : 'fill-gray-300'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600">({productData.reviews})</span>
          </div>
        )}

        {/* Precios */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${priceInfo.currentPrice.toFixed(2)}
              </span>
              {priceInfo.hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${priceInfo.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {priceInfo.hasDiscount && (
              <span className="text-sm text-green-600 font-medium">
                Ahorras ${priceInfo.savings.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="text-right">
            {productData.stock === 0 ? (
              <span className="text-sm text-red-600 font-medium">Agotado</span>
            ) : productData.stock < 5 ? (
              <span className="text-sm text-orange-600">
                Últimas {productData.stock} unidades
              </span>
            ) : (
              <span className="text-sm text-green-600">Disponible</span>
            )}
          </div>
        </div>

        {/* Botón de agregar al carrito */}
        {showQuickActions && (
          <button
            onClick={handleAddToCart}
            disabled={productData.stock === 0}
            className={`
              w-full py-2 px-4 rounded-md font-medium transition-colors duration-200
              ${productData.stock > 0
                ? 'bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {productData.stock > 0 ? 'Agregar al carrito' : 'Agotado'}
          </button>
        )}
      </div>
    </article>
  );
});

OptimizedProductCard.displayName = 'OptimizedProductCard';

export default OptimizedProductCard; 