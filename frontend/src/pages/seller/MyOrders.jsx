import { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { showSuccess, showError } from '../../services/notificationService';
import OrdersService from '../../services/ordersService';

const statusOptions = ['Todos', 'pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado', 'cancelado'];

const statusLabels = {
  'pendiente': 'Pendiente',
  'confirmado': 'Confirmado',
  'en_preparacion': 'En Preparación',
  'listo': 'Listo',
  'entregado': 'Entregado',
  'cancelado': 'Cancelado'
};

const statusColors = {
  'pendiente': 'bg-yellow-100 text-yellow-700',
  'confirmado': 'bg-blue-100 text-blue-700',
  'en_preparacion': 'bg-orange-100 text-orange-700',
  'listo': 'bg-green-100 text-green-700',
  'entregado': 'bg-gray-100 text-gray-700',
  'cancelado': 'bg-red-100 text-red-700'
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Cargar pedidos y estados
  useEffect(() => {
    loadOrders();
    loadOrderStatuses();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await OrdersService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      showError('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStatuses = async () => {
    try {
      const statuses = await OrdersService.getOrderStatuses();
      setOrderStatuses(statuses);
    } catch (error) {
      console.error('Error al cargar estados:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatusId, comment = '') => {
    try {
      setUpdatingStatus(true);
      const updatedOrder = await OrdersService.updateOrderStatus(orderId, newStatusId, comment);
      
      // Actualizar la lista de pedidos
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      
      // Actualizar el pedido seleccionado si es el mismo
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
      
      showSuccess('Estado del pedido actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      showError('Error al actualizar el estado del pedido');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = status === 'Todos' ? true : order.status === status;
    const matchesSearch =
      order.clientName.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toString().includes(search) ||
      (order.numero_pedido && order.numero_pedido.includes(search));
    return matchesStatus && matchesSearch;
  });

  const getNextStatus = (currentStatus) => {
    const statusFlow = ['pendiente', 'confirmado', 'en_preparacion', 'listo', 'entregado'];
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  const getStatusId = (statusName) => {
    const status = orderStatuses.find(s => s.name === statusName);
    return status ? status.id : null;
  };

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Pedidos</h1>
        <Button onClick={loadOrders} variant="secondary">
          🔄 Actualizar
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por cliente, N° pedido..."
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>
                {opt === 'Todos' ? 'Todos' : statusLabels[opt] || opt}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Total: {filteredOrders.length} pedidos
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Pedido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {order.numero_pedido || `#${order.id}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{order.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(order.date).toLocaleDateString('es-CL')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button size="sm" variant="info" onClick={() => setSelectedOrder(order)}>
                    Ver Detalles
                  </Button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  {loading ? 'Cargando pedidos...' : 'No hay pedidos que coincidan con los filtros'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detalles Pedido */}
      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title={`Pedido ${selectedOrder?.numero_pedido || `#${selectedOrder?.id}`}`} 
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Información del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Información del Cliente</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Cliente:</span> {selectedOrder.clientName}</p>
                  <p><span className="font-medium">Fecha:</span> {new Date(selectedOrder.date).toLocaleString('es-CL')}</p>
                  <p><span className="font-medium">Método de pago:</span> {selectedOrder.paymentMethod}</p>
                  <p><span className="font-medium">Tipo de entrega:</span> {selectedOrder.deliveryType === 'local' ? 'Retiro en local' : 'Domicilio'}</p>
                  {selectedOrder.shippingAddress && selectedOrder.deliveryType === 'domicilio' && (
                    <p><span className="font-medium">Dirección:</span> {selectedOrder.shippingAddress}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Estado del Pedido</h3>
                <div className="space-y-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </span>
                  {selectedOrder.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notas:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Productos del pedido */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Productos</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-600 ml-2">x {item.quantity}</span>
                        {item.notes && (
                          <p className="text-xs text-gray-500">Nota: {item.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="border-t pt-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.taxes > 0 && (
                  <div className="flex justify-between">
                    <span>Impuestos:</span>
                    <span>{formatCurrency(selectedOrder.taxes)}</span>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento:</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {selectedOrder.status !== 'entregado' && selectedOrder.status !== 'cancelado' && (
                <>
                  {getNextStatus(selectedOrder.status) && (
                    <Button 
                      className="flex-1" 
                      variant="success" 
                      onClick={() => {
                        const nextStatus = getNextStatus(selectedOrder.status);
                        const statusId = getStatusId(nextStatus);
                        if (statusId) {
                          handleUpdateOrderStatus(
                            selectedOrder.id, 
                            statusId, 
                            `Pedido marcado como ${statusLabels[nextStatus]}`
                          );
                        }
                      }}
                      disabled={updatingStatus}
                    >
                      {updatingStatus ? 'Actualizando...' : `Marcar como ${statusLabels[getNextStatus(selectedOrder.status)]}`}
                    </Button>
                  )}
                  
                  {selectedOrder.status === 'pendiente' && (
                    <Button 
                      className="flex-1" 
                      variant="danger" 
                      onClick={() => {
                        const statusId = getStatusId('cancelado');
                        if (statusId) {
                          handleUpdateOrderStatus(
                            selectedOrder.id, 
                            statusId, 
                            'Pedido cancelado por el vendedor'
                          );
                        }
                      }}
                      disabled={updatingStatus}
                    >
                      Cancelar Pedido
                    </Button>
                  )}
                </>
              )}
              
              <Button 
                variant="secondary" 
                onClick={() => setSelectedOrder(null)}
                className="flex-1 sm:flex-none"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders; 