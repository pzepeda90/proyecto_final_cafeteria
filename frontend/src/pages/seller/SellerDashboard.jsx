import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { PRIVATE_ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import OrdersService from '../../services/ordersService';
import ProductsService from '../../services/productsService';

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    lowStockProducts: 0,
    topProducts: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersData, productsData] = await Promise.all([
        OrdersService.getOrders(),
        ProductsService.getProducts()
      ]);

      setOrders(ordersData);
      setProducts(productsData);
      
      // Calcular estadísticas
      calculateStatistics(ordersData, productsData);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (ordersData, productsData) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Filtrar pedidos del mes actual
    const monthlyOrders = ordersData.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });

    // Calcular ingresos del mes
    const monthlyRevenue = monthlyOrders.reduce((total, order) => total + order.total, 0);

    // Productos con bajo stock (menos de 5 unidades)
    const lowStockProducts = productsData.filter(product => product.stock < 5).length;

    // Calcular productos más vendidos
    const productSales = {};
    ordersData.forEach(order => {
      order.items.forEach(item => {
        productSales[item.id] = (productSales[item.id] || 0) + item.quantity;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([id, quantity]) => ({
        product: productsData.find(p => p.id === parseInt(id)),
        quantity
      }))
      .filter(item => item.product) // Filtrar productos que existen
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setStats({
      totalProducts: productsData.length,
      monthlyOrders: monthlyOrders.length,
      monthlyRevenue,
      lowStockProducts,
      topProducts
    });
  };

  // Obtener últimos pedidos (últimos 5)
  const recentOrders = orders.slice(0, 5);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Vendedor</h1>
          <p className="text-gray-600">Bienvenido, {user?.nombre || 'Vendedor'}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="secondary" size="sm">
            🔄 Actualizar
          </Button>
          <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS}>
            <Button>Gestionar Productos</Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Productos Activos</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">{stats.totalProducts}</p>
          <p className="text-sm text-gray-500 mt-1">Total de productos</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Pedidos del Mes</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{stats.monthlyOrders}</p>
          <p className="text-sm text-gray-500 mt-1">Este mes</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Ingresos del Mes</h3>
          <p className="text-3xl font-bold mt-2 text-primary">{formatCurrency(stats.monthlyRevenue)}</p>
          <p className="text-sm text-gray-500 mt-1">Facturación mensual</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Stock Bajo</h3>
          <p className="text-3xl font-bold mt-2 text-red-600">{stats.lowStockProducts}</p>
          <p className="text-sm text-gray-500 mt-1">Productos con poco stock</p>
        </div>
      </div>

      {/* Productos más vendidos */}
      {stats.topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Productos Más Vendidos</h2>
          <div className="space-y-3">
            {stats.topProducts.map((item, index) => (
              <div key={item.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {item.product.imagen_url && (
                    <img 
                      src={item.product.imagen_url} 
                      alt={item.product.nombre}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{item.product.nombre}</h3>
                    <p className="text-sm text-gray-600">{formatCurrency(item.product.precio)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{item.quantity}</p>
                  <p className="text-sm text-gray-500">vendidos</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="space-y-4">
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS}>
              <Button variant="secondary" className="w-full">
                📦 Gestionar Productos
              </Button>
            </Link>
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_ORDERS}>
              <Button variant="secondary" className="w-full">
                📋 Ver Pedidos
              </Button>
            </Link>
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].POS}>
              <Button variant="primary" className="w-full">
                💰 Punto de Venta
              </Button>
            </Link>
          </div>
        </div>

        {/* Últimos Pedidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Últimos Pedidos</h2>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Pedido #{order.numero_pedido || order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('es-CL')}</p>
                    <p className="text-sm text-gray-600">{order.clientName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'entregado'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'en_preparacion'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'listo'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                    <p className="text-sm font-medium mt-1">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No hay pedidos recientes
              </div>
            )}
          </div>
          {recentOrders.length > 0 && (
            <div className="mt-4">
              <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_ORDERS}>
                <Button variant="secondary" size="sm" className="w-full">
                  Ver todos los pedidos
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Productos con Bajo Stock */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Productos con Bajo Stock</h2>
          <div className="space-y-3">
            {products
              .filter(product => product.stock < 5)
              .slice(0, 5)
              .map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {product.imagen_url && (
                      <img 
                        src={product.imagen_url} 
                        alt={product.nombre}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-sm">{product.nombre}</h3>
                      <p className="text-xs text-gray-600">{formatCurrency(product.precio)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-red-600 font-bold">{product.stock}</span>
                    <p className="text-xs text-gray-500">unidades</p>
                  </div>
                </div>
              ))}
            {products.filter(product => product.stock < 5).length === 0 && (
              <div className="text-center text-gray-500 py-4">
                ✅ Todos los productos tienen stock suficiente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 