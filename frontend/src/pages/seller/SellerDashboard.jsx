import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { PRIVATE_ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import SellerDashboardService from '../../services/sellerDashboardService';
// Importaciones específicas para optimizar bundle
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { CartesianGrid } from 'recharts/lib/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Estados para datos reales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        statsData,
        topProductsData,
        recentOrdersData,
        lowStockData,
        dailySalesData,
        alertsData
      ] = await Promise.all([
        SellerDashboardService.getSellerStats(user?.id),
        SellerDashboardService.getTopProducts(5),
        SellerDashboardService.getRecentOrders(8),
        SellerDashboardService.getLowStockProducts(),
        SellerDashboardService.getDailySales(),
        SellerDashboardService.getSellerAlerts()
      ]);

      setStats(statsData);
      setTopProducts(topProductsData);
      setRecentOrders(recentOrdersData);
      setLowStockProducts(lowStockData);
      setDailySales(dailySalesData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="ml-4 text-lg">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error al cargar el dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} variant="primary">
            🔄 Reintentar
          </Button>
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

      {/* Alertas importantes */}
      {alerts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🔔 Alertas Importantes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.tipo === 'error' ? 'bg-red-50 border-red-500' :
                  alert.tipo === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  alert.tipo === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{alert.icono}</span>
                  <div>
                    <h3 className="font-semibold">{alert.titulo}</h3>
                    <p className="text-sm text-gray-600">{alert.mensaje}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Ventas Hoy</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{formatCurrency(stats.ventasHoy || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.pedidosHoy || 0} pedidos</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Ventas del Mes</h3>
          <p className="text-3xl font-bold mt-2 text-primary">{formatCurrency(stats.ventasMes || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.pedidosMes || 0} pedidos</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Ticket Promedio</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">{formatCurrency(stats.ticketPromedio || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">Por pedido</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Productos Activos</h3>
          <p className="text-3xl font-bold mt-2 text-purple-600">{stats.totalProductos || 0}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.productosStockBajo || 0} con stock bajo</p>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Clientes del Mes</h3>
          <p className="text-3xl font-bold mt-2 text-indigo-600">{stats.clientesMes || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Únicos atendidos</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Eficiencia</h3>
          <p className="text-3xl font-bold mt-2 text-orange-600">{(stats.eficienciaVentas || 0).toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-1">Pedidos/día promedio</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-600">Meta Mensual</h3>
          <p className="text-3xl font-bold mt-2 text-teal-600">{(stats.progresoMeta || 0).toFixed(1)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(stats.progresoMeta || 0, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Gráfico de ventas diarias */}
      {dailySales.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📊 Ventas de los Últimos 7 Días</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'ventas' ? formatCurrency(value) : value,
                    name === 'ventas' ? 'Ventas' : 'Pedidos'
                  ]}
                />
                <Bar dataKey="ventas" fill="#8B5CF6" name="ventas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Productos más vendidos */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🏆 Productos Más Vendidos</h2>
            <div className="space-y-3">
              {topProducts.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    {item.imagen && (
                      <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{item.nombre}</h3>
                      <p className="text-sm text-gray-600">{formatCurrency(item.precio)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{item.cantidadVendida}</p>
                    <p className="text-sm text-gray-500">vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos con stock bajo */}
        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">⚠️ Stock Bajo</h2>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((producto) => (
                <div key={producto.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {producto.imagen && (
                      <img 
                        src={producto.imagen} 
                        alt={producto.nombre}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-medium">{producto.nombre}</h3>
                      <p className="text-sm text-gray-600">{producto.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${producto.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {producto.stock} unidades
                    </p>
                    <p className="text-sm text-gray-500">{producto.estado}</p>
                  </div>
                </div>
              ))}
            </div>
            {lowStockProducts.length > 5 && (
              <div className="mt-4 text-center">
                <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS}>
                  <Button variant="secondary" size="sm">
                    Ver todos ({lowStockProducts.length})
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pedidos recientes y acciones rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pedidos recientes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Pedidos Recientes</h2>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Pedido #{order.id}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.fecha).toLocaleDateString('es-CL')} - Cliente: {order.cliente}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.estado === 'Completado' ? 'bg-green-100 text-green-800' :
                      order.estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay pedidos recientes</p>
          )}
          <div className="mt-4 text-center">
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_ORDERS}>
              <Button variant="secondary">Ver Todos los Pedidos</Button>
            </Link>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">⚡ Acciones Rápidas</h2>
          
          {/* Botones principales */}
          <div className="space-y-4 mb-6">
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].POS}>
              <Button variant="primary" className="w-full py-3 mb-2">
                💰 Punto de Venta
              </Button>
            </Link>
            
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS}>
              <Button variant="secondary" className="w-full py-3 mb-2">
                📦 Gestionar Productos
              </Button>
            </Link>
            
            <Link to={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_ORDERS}>
              <Button variant="secondary" className="w-full py-3 mb-2">
                📋 Ver Pedidos
              </Button>
            </Link>
          </div>

          {/* Separador visual */}
          <div className="border-t border-gray-200 pt-4">
            <Button 
              variant="outline" 
              className="w-full py-3"
              onClick={loadDashboardData}
            >
              🔄 Actualizar Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard; 