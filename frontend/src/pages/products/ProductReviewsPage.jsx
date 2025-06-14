import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Package } from 'lucide-react';
import ProductReviews from '../../components/reviews/ProductReviews';
import WriteReview from '../../components/reviews/WriteReview';
import productService from '../../services/productService';

const ProductReviewsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewsKey, setReviewsKey] = useState(0);

  useEffect(() => {
    if (id) {
      cargarProducto();
    } else {
      setError('ID de producto no válido');
      setLoading(false);
    }
  }, [id]);

  const cargarProducto = async () => {
    try {
      setLoading(true);
      const data = await productService.obtenerProducto(id);
      setProducto(data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      setError('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const manejarNuevaResena = () => {
    setReviewsKey(prev => prev + 1);
  };

  const volverAtras = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del producto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Oops! Algo salió mal</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={volverAtras}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </button>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Package size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
          <p className="text-gray-600 mb-4">El producto que buscas no existe o ha sido eliminado.</p>
          <button
            onClick={volverAtras}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={volverAtras}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Volver al producto</span>
          </button>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-start space-x-6">
              {producto.imagen_url && (
                <div className="flex-shrink-0">
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-24 h-24 object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {producto.nombre}
                  </h1>
                  <Star size={20} className="text-yellow-400" />
                </div>
                {producto.descripcion && (
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {producto.descripcion}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">
                    ${producto.precio?.toLocaleString('es-CL')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Reseñas y opiniones
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <WriteReview
                productoId={id}
                onReviewCreated={manejarNuevaResena}
                producto={producto}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <ProductReviews
              key={reviewsKey}
              productoId={id}
              mostrarFormulario={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewsPage; 