import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '../../store/slices/cartSlice';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import ProductCard from '../../components/products/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  // Cargar productos y categorías al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Cargar productos y categorías en paralelo
        const [productsData, categoriesData] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los productos. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar productos cuando cambian los filtros
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesCategory = selectedCategory 
        ? product.categoria_id === parseInt(selectedCategory) 
        : true;
      
      const matchesSearch = searchTerm
        ? product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      return matchesCategory && matchesSearch && product.disponible;
    });
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm]);

  const handleAddToCart = (product) => {
    dispatch(addItem({
      id: product.producto_id,
      name: product.nombre,
      price: product.precio,
      image: product.imagen_url,
      quantity: 1,
      stock: product.stock
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar productos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Nuestros Productos
        </h1>
        <p className="text-gray-600">
          Descubre nuestra selección de productos frescos y deliciosos
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.categoria_id} value={category.categoria_id}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categorías */}
      {categories.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category.categoria_id}
              onClick={() => setSelectedCategory(category.categoria_id.toString())}
              className={`relative h-32 rounded-lg overflow-hidden transition-all ${
                selectedCategory === category.categoria_id.toString()
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              <img
                src={category.imagen_url || '/placeholder-category.jpg'}
                alt={category.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-category.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {category.nombre}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lista de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.producto_id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Mensaje cuando no hay productos */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg mb-2">
            {searchTerm || selectedCategory 
              ? 'No se encontraron productos que coincidan con tu búsqueda'
              : 'No hay productos disponibles en este momento'
            }
          </p>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-12 text-center">
        <p className="text-gray-500 text-sm">
          Mostrando {filteredProducts.length} de {products.length} productos
        </p>
      </div>
    </div>
  );
};

export default ProductsPage; 