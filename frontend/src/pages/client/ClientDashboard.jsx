import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { PRIVATE_ROUTES } from '../../constants/routes';
import { selectAllOrders } from '../../store/slices/ordersSlice';

const ClientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const allOrders = useSelector(selectAllOrders);
  const { items: cartItems } = useSelector((state) => state.cart);

  // Filtrar órdenes del cliente actual
  const userOrders = allOrders.filter(order => order.userId === user?.id);
  
  // Obtener último pedido
  const lastOrder = userOrders[0];

  // Calcular productos favoritos basado en la frecuencia de pedidos
  const getFavoriteProducts = () => {
    const productCount = {};
    userOrders.forEach(order => {
      order.items.forEach(item => {
        productCount[item.name] = (productCount[item.name] || 0) + item.quantity;
      });
    });
    
    return Object.entries(productCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, times]) => ({ name, times }));
  };

  // Calcular total gastado en el mes actual
  const getCurrentMonthTotal = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return userOrders
      .filter(order => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      })
      .reduce((total, order) => total + order.total, 0);
  };

  // Promociones personalizadas basadas en historial
  const getPersonalizedPromos = () => {
    const favorites = getFavoriteProducts();
    return [
      {
        title: `15% de descuento en ${favorites[0]?.name || 'tu próxima compra'}`,
        desc: 'Válido hasta fin de mes',
        code: 'CLIENTE15'
      },
      {
        title: '2x1 en productos seleccionados',
        desc: 'Aplica de lunes a viernes',
        code: '2X1CAFE'
      },
      {
        title: 'Envío gratis',
        desc: 'En compras superiores a $15.000',
        code: 'ENVIOGRATIS'
      }
    ];
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">¡Bienvenido, {user?.nombre || 'Cliente'}!</h1>
        {cartItems.length > 0 && (
          <Link to={PRIVATE_ROUTES.CART}>
            <Button variant="primary">
              Ver Carrito ({cartItems.length})
            </Button>
          </Link>
        )}
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
                  <p className="text-sm text-gray-500">{new Date(lastOrder.date).toLocaleDateString('es-CL')}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${lastOrder.status === 'Entregado' ? 'bg-green-100 text-green-800' : 
                    lastOrder.status === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {lastOrder.status}
                </span>
              </div>
              <ul className="space-y-2 mb-4">
                {lastOrder.items.map((item, idx) => (
                  <li key={idx} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="text-gray-600">{formatCurrency(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(lastOrder.total)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No hay pedidos realizados aún</p>
          )}
        </div>

        {/* Productos Favoritos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Tus Favoritos</h2>
          {getFavoriteProducts().length > 0 ? (
            <ul className="space-y-3 mb-6">
              {getFavoriteProducts().map((fav, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <span className="text-gray-800">{fav.name}</span>
                  <span className="text-sm text-gray-500">Pedido {fav.times} veces</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 mb-6">Aún no tienes productos favoritos</p>
          )}
          <Link to={PRIVATE_ROUTES.PRODUCTS}>
            <Button variant="primary" className="w-full">
              Explorar Productos
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Estadísticas del Mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Este Mes</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Total gastado</p>
              <p className="text-3xl font-bold">{formatCurrency(getCurrentMonthTotal())}</p>
            </div>
            <div>
              <p className="text-gray-600">Pedidos realizados</p>
              <p className="text-3xl font-bold">
                {userOrders.filter(order => {
                  const orderDate = new Date(order.date);
                  return orderDate.getMonth() === new Date().getMonth();
                }).length}
              </p>
            </div>
          </div>
        </div>

        {/* Promociones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Promociones Especiales</h2>
          <div className="space-y-4">
            {getPersonalizedPromos().map((promo, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-primary">{promo.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{promo.desc}</p>
                <p className="text-sm bg-gray-100 p-1 rounded inline-block">
                  Código: <span className="font-mono font-medium">{promo.code}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={PRIVATE_ROUTES.PRODUCTS}>
            <Button variant="secondary" className="w-full">
              Ver Menú
            </Button>
          </Link>
          <Link to={PRIVATE_ROUTES.CART}>
            <Button variant="secondary" className="w-full">
              Mi Carrito
            </Button>
          </Link>
          <Link to={PRIVATE_ROUTES.CLIENTE.MY_ORDERS}>
            <Button variant="secondary" className="w-full">
              Mis Pedidos
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="secondary" className="w-full">
              Mi Perfil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard; 