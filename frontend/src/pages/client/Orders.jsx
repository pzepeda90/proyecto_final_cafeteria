import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectAllOrders } from '../../store/slices/ordersSlice';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';

// Mock de pedidos para demostración
const mockOrders = [
  {
    id: 1,
    date: '2024-03-15',
    status: 'Entregado',
    total: 125.50,
    items: [
      { id: 1, name: 'Espresso Clásico', quantity: 2, price: 2.50 },
      { id: 4, name: 'Cheesecake New York', quantity: 1, price: 5.50 },
    ]
  },
  {
    id: 2,
    date: '2024-03-14',
    status: 'En Proceso',
    total: 85.00,
    items: [
      { id: 7, name: 'Tostadas Francesas', quantity: 2, price: 8.50 },
      { id: 11, name: 'Limonada de Fresa', quantity: 3, price: 4.50 },
    ]
  }
];

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
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
  
  const orders = useSelector(selectAllOrders);

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
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                  </span>
                  <span className="font-semibold">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}

            {filteredAndSortedOrders.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
                No se encontraron pedidos
                {statusFilter && ` con estado "${statusFilter}"`}
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
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <img
                          src={item.image}
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

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Dirección de entrega</h3>
                  <p className="text-gray-600">{selectedOrder.shippingAddress}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Método de pago</h3>
                  <p className="text-gray-600">{selectedOrder.paymentMethod}</p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Notas</h3>
                    <p className="text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-semibold text-lg">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
              Selecciona un pedido para ver sus detalles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders; 