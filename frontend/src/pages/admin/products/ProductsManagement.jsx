import { useState, useEffect } from 'react';
import { formatCurrency } from '../../../utils/formatters';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import ProductsService from '../../../services/productsService';
import Swal from 'sweetalert2';

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      console.log('🔄 Cargando datos iniciales...');
      
      // Cargar productos y categorías en paralelo
      const [productsResponse, categoriesResponse] = await Promise.all([
        ProductsService.getProducts(),
        ProductsService.getCategories()
      ]);
      
      console.log('✅ Productos cargados:', productsResponse);
      console.log('✅ Categorías cargadas:', categoriesResponse);
      
      setProducts(productsResponse || []);
      setCategories(categoriesResponse || []);
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar datos',
        text: error.message || 'No se pudieron cargar los productos y categorías',
        confirmButtonColor: '#ef4444'
      });
      
      // Usar datos de respaldo en caso de error
      setProducts([]);
      setCategories([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Filtros de productos
  const filteredProducts = products.filter(product => {
    const matchesCategory = filterCategory ? product.categoria_id === parseInt(filterCategory) : true;
    const matchesSearch = searchTerm 
      ? (product.nombre || product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.descripcion || product.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  // Abrir modal para crear/editar
  const handleOpenModal = (product = null) => {
    if (product) {
      // Mapear datos del backend al formulario
      setEditProduct({
        id: product.producto_id || product.id,
        name: product.nombre || product.name,
        description: product.descripcion || product.description,
        price: product.precio || product.price,
        category_id: product.categoria_id || product.category_id,
        image: product.imagen_url || product.image,
        stock: product.stock || 0,
        available: product.disponible !== undefined ? product.disponible : product.available
      });
    } else {
      setEditProduct({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image: '',
        stock: 0,
        available: true
      });
    }
    setIsModalOpen(true);
  };

  // Alternar disponibilidad
  const handleToggleAvailability = async (product) => {
    try {
      setLoading(true);
      const updatedData = {
        ...product,
        disponible: !product.disponible,
        available: !product.disponible
      };
      
      await ProductsService.updateProduct(product.producto_id || product.id, updatedData);
      
      // Actualizar en el estado local
      setProducts(products.map(p => 
        (p.producto_id || p.id) === (product.producto_id || product.id)
          ? { ...p, disponible: !p.disponible, available: !p.disponible }
          : p
      ));
    } catch (error) {
      console.error('❌ Error al cambiar disponibilidad:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo cambiar la disponibilidad del producto',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Guardar producto (crear o actualizar)
  const handleSaveProduct = async (productData) => {
    try {
      setLoading(true);
      console.log('💾 Guardando producto:', productData);
      
      if (productData.id) {
        // Actualizar producto existente
        const updatedProduct = await ProductsService.updateProduct(productData.id, productData);
        
        // Actualizar en el estado local
        setProducts(products.map(p => 
          (p.producto_id || p.id) === productData.id 
            ? { ...updatedProduct, id: updatedProduct.producto_id || updatedProduct.id }
            : p
        ));

        // Alerta de éxito para actualización
        Swal.fire({
          icon: 'success',
          title: '¡Producto actualizado!',
          text: `El producto "${productData.name}" ha sido actualizado correctamente`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      } else {
        // Crear nuevo producto
        const newProduct = await ProductsService.createProduct(productData);
        
        // Agregar al estado local
        setProducts([...products, { ...newProduct, id: newProduct.producto_id || newProduct.id }]);

        // Alerta de éxito para creación
        Swal.fire({
          icon: 'success',
          title: '¡Producto creado!',
          text: `El producto "${productData.name}" ha sido agregado correctamente`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }
      
      setIsModalOpen(false);
      setEditProduct(null);
    } catch (error) {
      console.error('❌ Error al guardar producto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.message || 'No se pudo guardar el producto. Inténtalo nuevamente.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (product) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de que deseas eliminar "${product.nombre || product.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await ProductsService.deleteProduct(product.producto_id || product.id);
        
        // Remover del estado local
        setProducts(products.filter(p => 
          (p.producto_id || p.id) !== (product.producto_id || product.id)
        ));

        // Alerta de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Producto eliminado!',
          text: `El producto "${product.nombre || product.name}" ha sido eliminado correctamente`,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
        
      } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: error.message || 'No se pudo eliminar el producto. Inténtalo nuevamente.',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (initialLoading) {
    return (
      <div className="p-3 sm:p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Gestión de Productos</h1>
        <Button 
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto"
        >
          + Agregar Producto
        </Button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.categoria_id || category.id} value={category.categoria_id || category.id}>
                {category.nombre || category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla responsiva */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Vista móvil - Cards */}
        <div className="block lg:hidden">
          <div className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <div key={product.producto_id || product.id} className="p-4 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 flex-shrink-0">
                    <img
                      className="h-16 w-16 rounded-lg object-cover"
                      src={product.imagen_url || product.image || '/placeholder-product.jpg'}
                      alt={product.nombre || product.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {product.nombre || product.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.descripcion || product.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(product.precio || product.price)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        product.disponible !== undefined ? product.disponible : product.available
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.disponible !== undefined ? product.disponible : product.available ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Stock: {product.stock || 0} | Categoría: {categories.find(c => (c.categoria_id || c.id) === product.categoria_id)?.nombre || categories.find(c => (c.categoria_id || c.id) === product.categoria_id)?.name || 'Sin categoría'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    onClick={() => handleToggleAvailability(product)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {product.disponible !== undefined ? product.disponible : product.available ? 'Deshabilitar' : 'Habilitar'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="info" 
                    onClick={() => handleOpenModal(product)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => handleDeleteProduct(product)}
                    className="flex-1"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vista desktop - Tabla */}
        <div className="hidden lg:block overflow-x-auto">
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
                  Stock
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
                <tr key={product.producto_id || product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.imagen_url || product.image || '/placeholder-product.jpg'}
                          alt={product.nombre || product.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.nombre || product.name}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {product.descripcion || product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {categories.find(c => (c.categoria_id || c.id) === product.categoria_id)?.nombre || 
                       categories.find(c => (c.categoria_id || c.id) === product.categoria_id)?.name || 
                       'Sin categoría'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(product.precio || product.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {product.stock || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        product.disponible !== undefined ? product.disponible : product.available
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      onClick={() => handleToggleAvailability(product)}
                    >
                      {product.disponible !== undefined ? product.disponible : product.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="info" 
                        onClick={() => handleOpenModal(product)}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDeleteProduct(product)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mensaje cuando no hay productos */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || filterCategory ? 'No se encontraron productos' : 'No hay productos registrados'}
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar producto */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editProduct?.id ? 'Editar Producto' : 'Nuevo Producto'} 
        size="lg"
      >
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveProduct(editProduct);
            }}
            className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
          >
          {/* Nombre y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                value={editProduct?.name || ''}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                value={editProduct?.category_id || ''}
                onChange={(e) => setEditProduct({ ...editProduct, category_id: e.target.value })}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.categoria_id || category.id} value={category.categoria_id || category.id}>
                    {category.nombre || category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <textarea
              className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              rows="3"
              value={editProduct?.description || ''}
              onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              required
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                value={editProduct?.price || ''}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                value={editProduct?.stock || 0}
                onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
              />
            </div>
          </div>

          {/* URL de imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la imagen
            </label>
            <input
              type="url"
              className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
              value={editProduct?.image || ''}
              onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          {/* Disponible */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              checked={editProduct?.available || false}
              onChange={(e) => setEditProduct({ ...editProduct, available: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
              Producto disponible para la venta
            </label>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
            <Button 
              variant="secondary" 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              disabled={loading}
              className="w-full sm:w-auto order-2 sm:order-1 px-6 py-2.5"
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2 px-6 py-2.5"
            >
              {loading ? 'Guardando...' : (editProduct?.id ? 'Actualizar Producto' : 'Crear Producto')}
            </Button>
          </div>
        </form>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsManagement; 