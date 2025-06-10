import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/ui/Button';
import { categories, products as mockProducts } from '../../../mocks/productsMock';
import ProductFormModal from './ProductFormModal';

const ProductsManagement = () => {
  const [products, setProducts] = useState(mockProducts);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory ? product.category_id === parseInt(filterCategory) : true;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleAvailability = (productId) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, available: !product.available }
        : product
    ));
  };

  const handleAddProduct = (newProduct) => {
    // Generar un id único (mock)
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([
      ...products,
      { ...newProduct, id: nextId }
    ]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Productos</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          Agregar Producto
        </Button>
      </div>
      {isModalOpen && (
        <ProductFormModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddProduct}
        />
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={product.image}
                        alt={product.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {categories.find(c => c.id === product.category_id)?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(product.price)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.available
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.available ? 'Disponible' : 'No disponible'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="text-primary hover:text-primary-dark mr-4"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleToggleAvailability(product.id)}
                    className={`${
                      product.available ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {product.available ? 'Deshabilitar' : 'Habilitar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsManagement; 