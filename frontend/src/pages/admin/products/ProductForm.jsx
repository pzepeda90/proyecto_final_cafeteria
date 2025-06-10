import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import { categories, products as mockProducts } from '../../../mocks/productsMock';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image: '',
    available: true,
  });

  useEffect(() => {
    if (id) {
      const product = mockProducts.find(p => p.id === parseInt(id));
      if (product) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category_id: product.category_id,
          image: product.image,
          available: product.available,
        });
      }
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar el producto
    navigate('/admin/products');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {id ? 'Editar Producto' : 'Nuevo Producto'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white p-6 rounded-lg shadow">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre del Producto
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Precio
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              name="category_id"
              id="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">
              URL de la Imagen
            </label>
            <input
              type="url"
              name="image"
              id="image"
              value={formData.image}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="available"
              id="available"
              checked={formData.available}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
              Disponible
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/admin/products')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            {id ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm; 