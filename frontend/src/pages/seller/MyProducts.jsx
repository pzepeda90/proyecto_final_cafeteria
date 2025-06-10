import { useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { showSuccess } from '../../services/notificationService';

const mockProducts = [
  {
    id: 1,
    name: 'Café Espresso',
    price: 1500,
    stock: 20,
    active: true,
    discount: null,
    sales: 35,
    image: '',
  },
  {
    id: 2,
    name: 'Café Latte',
    price: 1800,
    stock: 10,
    active: true,
    discount: { code: 'LATTE10', type: 'porcentaje', value: 10 },
    sales: 20,
    image: '',
  },
  {
    id: 3,
    name: 'Brownie',
    price: 1200,
    stock: 0,
    active: false,
    discount: null,
    sales: 12,
    image: '',
  },
];

const MyProducts = () => {
  const [products, setProducts] = useState(mockProducts);
  const [discountModal, setDiscountModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountData, setDiscountData] = useState({ code: '', type: 'porcentaje', value: '' });

  const handleToggleActive = (id) => {
    setProducts(products => products.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const handleOpenDiscount = (product) => {
    setSelectedProduct(product);
    setDiscountData(product.discount ? { ...product.discount, value: product.discount.value.toString() } : { code: '', type: 'porcentaje', value: '' });
    setDiscountModal(true);
  };

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    if (!discountData.code || !discountData.value) return;
    setProducts(products => products.map(p => p.id === selectedProduct.id ? { ...p, discount: { ...discountData, value: Number(discountData.value) } } : p));
    setDiscountModal(false);
    showSuccess('¡Descuento aplicado!');
  };

  const handleRemoveDiscount = () => {
    setProducts(products => products.map(p => p.id === selectedProduct.id ? { ...p, discount: null } : p));
    setDiscountModal(false);
    showSuccess('Descuento eliminado');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Productos</h1>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map(product => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(product.price)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.active ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.discount ? (
                    <span className="text-green-700 font-semibold">
                      {product.discount.code} ({product.discount.type === 'porcentaje' ? product.discount.value + '%' : formatCurrency(product.discount.value)})
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.sales}</td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => handleToggleActive(product.id)}>
                    {product.active ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button size="sm" variant="info" onClick={() => handleOpenDiscount(product)}>
                    {product.discount ? 'Editar Descuento' : 'Aplicar Descuento'}
                  </Button>
                  {product.discount && (
                    <Button size="sm" variant="danger" onClick={() => { setSelectedProduct(product); setDiscountModal(true); }}>
                      Quitar Descuento
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400">No hay productos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal Descuento */}
      <Modal isOpen={discountModal} onClose={() => setDiscountModal(false)} title={selectedProduct ? `Descuento para ${selectedProduct.name}` : 'Descuento'} size="sm">
        <form onSubmit={handleApplyDiscount} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Código de descuento</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              value={discountData.code}
              onChange={e => setDiscountData({ ...discountData, code: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de descuento</label>
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={discountData.type}
              onChange={e => setDiscountData({ ...discountData, type: e.target.value })}
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto">Monto fijo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor</label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-lg"
              value={discountData.value}
              onChange={e => setDiscountData({ ...discountData, value: e.target.value })}
              min={1}
              required
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" variant="success" className="w-full">Guardar Descuento</Button>
            {selectedProduct?.discount && (
              <Button type="button" variant="danger" className="w-full" onClick={handleRemoveDiscount}>Quitar Descuento</Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyProducts; 