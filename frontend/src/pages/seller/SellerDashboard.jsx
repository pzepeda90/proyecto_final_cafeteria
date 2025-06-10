import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { PRIVATE_ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { selectAllOrders } from '../../store/slices/ordersSlice';

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const allOrders = useSelector(selectAllOrders);
  const { products } = useSelector((state) => state.products);

  // Filtrar órdenes del vendedor
  const sellerOrders = allOrders.filter(order => 
    order.items.some(item => products.find(p => p.id === item.id)?.sellerId === user?.id)
  );

  // Obtener productos del vendedor
  const sellerProducts = products.filter(product => product.sellerId === user?.id);

  // Calcular estadísticas
  const getStatistics = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Ventas del mes
    const monthlyOrders = sellerOrders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });

    const monthlyRevenue = monthlyOrders.reduce((total, order) => {
      const orderTotal = order.items
        .filter(item => products.find(p => p.id === item.id)?.sellerId === user?.id)
        .reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return total + orderTotal;
    }, 0);

    // Productos más vendidos
    const productSales = {};
    sellerOrders.forEach(order => {
      order.items.forEach(item => {
        if (products.find(p => p.id === item.id)?.sellerId === user?.id) {
          productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, quantity]) => ({
        product: products.find(p => p.id === parseInt(id)),
        quantity
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalProducts: sellerProducts.length,
      monthlyOrders: monthlyOrders.length,
      monthlyRevenue,
      topProducts
    };
  };

  const stats = getStatistics();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard de Vendedor</h1>
        <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS}>
          <Button>Gestionar Productos</Button>
        </Link>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Productos Activos</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Pedidos del Mes</h3>
          <p className="text-3xl font-bold mt-2">{stats.monthlyOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Ingresos del Mes</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(stats.monthlyRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Productos sin Stock</h3>
          <p className="text-3xl font-bold mt-2">
            {sellerProducts.filter(p => p.stock === 0).length}
          </p>
        </div>
      </div>

      {/* Productos más vendidos */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Productos Más Vendidos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidades Vendidas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.topProducts.map(({ product, quantity }) => (
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.stock > 10
                        ? 'bg-green-100 text-green-800'
                        : product.stock > 0
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(product.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="space-y-4">
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS}>
              <Button variant="secondary" className="w-full">
                Agregar Nuevo Producto
              </Button>
            </Link>
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_ORDERS}>
              <Button variant="secondary" className="w-full">
                Ver Pedidos Pendientes
              </Button>
            </Link>
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].POS}>
              <Button variant="secondary" className="w-full">
                Punto de Venta
              </Button>
            </Link>
          </div>
        </div>

        {/* Últimos Pedidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Últimos Pedidos</h2>
          <div className="space-y-4">
            {sellerOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Pedido #{order.id}</p>
                  <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  order.status === 'Entregado'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'En Proceso'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Productos con Bajo Stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Productos con Bajo Stock</h2>
          <div className="space-y-4">
            {sellerProducts
              .filter(product => product.stock <= 10)
              .slice(0, 5)
              .map(product => (
                <div key={product.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                    </div>
                  </div>
                  <Link to={`${PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS}/${product.id}`}>
                    <Button size="sm">Actualizar</Button>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 