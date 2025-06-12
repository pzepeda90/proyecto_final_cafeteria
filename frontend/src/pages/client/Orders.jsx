import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllOrders, setOrdersStatus, setOrders } from '../../store/slices/ordersSlice';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import OrdersService from '../../services/ordersService';

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
      case 'En Preparación':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      case 'Pendiente':
        return 'bg-blue-100 text-blue-800';
      case 'Confirmado':
        return 'bg-indigo-100 text-indigo-800';
      case 'Listo':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
};

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateSort, setDateSort] = useState('desc'); // 'asc' | 'desc'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const orders = useSelector(selectAllOrders);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        dispatch(setOrdersStatus('loading'));
        
        const ordersData = await OrdersService.getOrders();
        dispatch(setOrders(ordersData));
        dispatch(setOrdersStatus('succeeded'));
      } catch (err) {
        console.error('Error al cargar pedidos:', err);
        setError(err.message || 'Error al cargar los pedidos');
        dispatch(setOrdersStatus('failed'));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [dispatch]);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];
    
    // Aplicar filtro por estado
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Aplicar ordenamiento por fecha
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [orders, statusFilter, dateSort]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(orders.map(order => order.status))];
  }, [orders]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error al cargar pedidos</h2>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="secondary"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mis Pedidos</h1>
        
        {/* Filtros y ordenamiento */}
        <div className="flex gap-4">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <Button
            variant="secondary"
            onClick={() => setDateSort(prev => prev === 'desc' ? 'asc' : 'desc')}
          >
            Fecha {dateSort === 'desc' ? '↓' : '↑'}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de pedidos */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredAndSortedOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-shadow hover:shadow-lg ${
                  selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Pedido #{order.id}</h3>
                    <p className="text-gray-600 text-sm">
                      {new Date(order.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {order.items?.length || 0} {(order.items?.length || 0) === 1 ? 'producto' : 'productos'}
                  </span>
                  <span className="font-semibold">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}

            {filteredAndSortedOrders.length === 0 && !loading && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
                {orders.length === 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No tienes pedidos aún</h3>
                    <p>¡Haz tu primer pedido y aparecerá aquí!</p>
                  </div>
                ) : (
                  <div>
                    No se encontraron pedidos
                    {statusFilter && ` con estado "${statusFilter}"`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detalles del pedido */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Detalles del Pedido #{selectedOrder.id}</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Estado</h3>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Productos</h3>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image || 'https://via.placeholder.com/64'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-gray-600">
                            {item.quantity}x {formatCurrency(item.price)}
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(item.quantity * item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.shippingAddress && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Dirección de entrega</h3>
                    <p className="text-gray-600">{selectedOrder.shippingAddress}</p>
                  </div>
                )}

                {selectedOrder.paymentMethod && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Método de pago</h3>
                    <p className="text-gray-600">{selectedOrder.paymentMethod}</p>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Notas</h3>
                    <p className="text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
              <h3 className="text-lg font-semibold mb-2">Selecciona un pedido</h3>
              <p>Haz clic en un pedido de la lista para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders; 