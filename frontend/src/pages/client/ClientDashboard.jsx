import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { PRIVATE_ROUTES } from '../../constants/routes';
import ClientDashboardService from '../../services/clientDashboardService';
// Importaciones específicas para optimizar bundle
import { BarChart } from 'recharts/lib/chart/BarChart';
import { Bar } from 'recharts/lib/cartesian/Bar';
import { XAxis } from 'recharts/lib/cartesian/XAxis';
import { YAxis } from 'recharts/lib/cartesian/YAxis';
import { CartesianGrid } from 'recharts/lib/cartesian/CartesianGrid';
import { Tooltip } from 'recharts/lib/component/Tooltip';
import { ResponsiveContainer } from 'recharts/lib/component/ResponsiveContainer';

const ClientDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { items: cartItems } = useSelector((state) => state.cart);
  
  // Estados para datos reales
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar todos los datos en paralelo
      const [
        statsData,
        ordersData,
        favoritesData,
        promotionsData,
        monthlyData,
        recommendationsData
      ] = await Promise.all([
        ClientDashboardService.getClientStats(user.id),
        ClientDashboardService.getClientOrders(user.id),
        ClientDashboardService.getFavoriteProducts(user.id),
        ClientDashboardService.getPersonalizedPromotions(user.id),
        ClientDashboardService.getMonthlySpending(user.id),
        ClientDashboardService.getProductRecommendations(user.id)
      ]);

      setStats(statsData);
      setOrders(ordersData);
      setFavorites(favoritesData);
      setPromotions(promotionsData);
      setMonthlySpending(monthlyData);
      setRecommendations(recommendationsData);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Obtener último pedido
  const lastOrder = orders.length > 0 ? orders[0] : null;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">¡Bienvenido, {user?.nombre || 'Cliente'}!</h1>
          <p className="text-gray-600 mt-1">
            {stats.totalPedidos > 0 
              ? `Has realizado ${stats.totalPedidos} pedidos con nosotros` 
              : 'Explora nuestro menú y realiza tu primer pedido'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadDashboardData}
            className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
          {cartItems.length > 0 && (
            <Link to={PRIVATE_ROUTES.CART}>
              <Button variant="primary">
                Ver Carrito ({cartItems.length})
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* KPIs del Cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-primary">{formatCurrency(stats.totalGastadoMes || 0)}</div>
          <div className="text-sm text-gray-600">Gastado este mes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">📦</div>
          <div className="text-2xl font-bold text-green-600">{stats.pedidosRealizadosMes || 0}</div>
          <div className="text-sm text-gray-600">Pedidos este mes</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">🧾</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.ticketPromedio || 0)}</div>
          <div className="text-sm text-gray-600">Ticket promedio</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl mb-2">💎</div>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.ahorroEstimado || 0)}</div>
          <div className="text-sm text-gray-600">Ahorro con promociones</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Último Pedido */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Último Pedido</h2>
          {lastOrder ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-600">#{lastOrder.id}</p>
                  <p className="text-sm text-gray-500">{new Date(lastOrder.fecha).toLocaleDateString('es-CL')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${lastOrder.estado === 'Entregado' ? 'bg-green-100 text-green-800' : 
                    lastOrder.estado === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {lastOrder.estado}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(lastOrder.total)}</span>
              </div>
              <div className="mt-4">
                <Link to={PRIVATE_ROUTES.CLIENTE.MY_ORDERS}>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos mis pedidos
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🛍️</div>
              <p className="text-gray-500 mb-4">No hay pedidos realizados aún</p>
              <Link to={PRIVATE_ROUTES.PRODUCTS}>
                <Button variant="primary">
                  Explorar Productos
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Productos Favoritos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tus Favoritos</h2>
          {favorites.length > 0 ? (
            <>
              <ul className="space-y-3 mb-6">
                {favorites.map((fav, idx) => (
                  <li key={idx} className="flex justify-between items-center">
                    <span className="text-gray-800">{fav.nombre}</span>
                    <span className="text-sm text-gray-500">Pedido {fav.veces} veces</span>
                  </li>
                ))}
              </ul>
              <Link to={PRIVATE_ROUTES.PRODUCTS}>
                <Button variant="primary" className="w-full">
                  Pedir de nuevo
                </Button>
              </Link>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⭐</div>
              <p className="text-gray-500 mb-4">Aún no tienes productos favoritos</p>
              <Link to={PRIVATE_ROUTES.PRODUCTS}>
                <Button variant="primary" className="w-full">
                  Explorar Productos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Gastos Mensuales */}
      {monthlySpending.some(month => month.gasto > 0) && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Tus Gastos del Año</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySpending} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="gasto" fill="#C8973F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Promociones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Promociones Especiales</h2>
          {promotions.length > 0 ? (
            <div className="space-y-4">
              {promotions.map((promo) => (
                <div key={promo.id} className="p-3 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200">
                  <h3 className="font-medium text-primary-800">{promo.titulo}</h3>
                  <p className="text-sm text-primary-600 mb-2">{promo.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm bg-primary text-white px-2 py-1 rounded font-mono">
                      {promo.codigo}
                    </span>
                    <span className="text-sm font-medium text-primary-700">
                      {promo.tipo === 'porcentaje' ? `${promo.descuento}% OFF` : 'Envío Gratis'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay promociones disponibles</p>
          )}
        </div>

        {/* Recomendaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recomendado para ti</h2>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((product) => (
                <div key={product.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-gray-800">{product.nombre}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(product.precio)}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Agregar
                  </Button>
                </div>
              ))}
              <Link to={PRIVATE_ROUTES.PRODUCTS}>
                <Button variant="secondary" className="w-full mt-4">
                  Ver más productos
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">Cargando recomendaciones...</p>
          )}
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={PRIVATE_ROUTES.PRODUCTS}>
            <Button variant="secondary" className="w-full">
              🍽️ Ver Menú
            </Button>
          </Link>
          <Link to={PRIVATE_ROUTES.CART}>
            <Button variant="secondary" className="w-full">
              🛒 Mi Carrito
            </Button>
          </Link>
          <Link to={PRIVATE_ROUTES.CLIENTE.MY_ORDERS}>
            <Button variant="secondary" className="w-full">
              📦 Mis Pedidos
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="secondary" className="w-full">
              👤 Mi Perfil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard; 