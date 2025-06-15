import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_STATUS_FLOW } from '../../constants/orderStatus';
import { selectAllOrders, updateOrder, updateOrderStatus, setOrders, setOrdersStatus } from '../../store/slices/ordersSlice';
import { formatCurrency } from '../../utils/formatters';
import OrdersService from '../../services/ordersService';

const ManageOrders = () => {
  const orders = useSelector(selectAllOrders);
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Filtros
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    const matchesType = filterType ? order.deliveryType === filterType : true;
    const matchesSearch = search
      ? order.id.toString().includes(search) ||
        order.items?.some(item => item.name.toLowerCase().includes(search.toLowerCase()))
      : true;
    return matchesStatus && matchesType && matchesSearch;
  });

  // Abrir modal de detalles
  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setEditOrder(order);
    setEditMode(false);
    setIsModalOpen(true);
  };

  // Cambiar estado del pedido
  const handleChangeStatus = (order, newStatus) => {
    dispatch(updateOrderStatus({ orderId: order.id, status: newStatus }));
    setSelectedOrder({ ...order, status: newStatus });
  };

  // Activar modo edición
  const handleEdit = () => {
    setEditMode(true);
    setEditOrder({ ...selectedOrder });
  };

  // Guardar edición
  const handleSaveEdit = () => {
    dispatch(updateOrder(editOrder));
    setSelectedOrder(editOrder);
    setEditMode(false);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditOrder(selectedOrder);
  };

  // Editar cantidad de producto
  const handleEditItemQty = (itemId, qty) => {
    setEditOrder({
      ...editOrder,
      items: editOrder.items.map(item =>
        item.id === itemId ? { ...item, quantity: qty } : item
      ),
    });
  };

  // Eliminar producto del pedido
  const handleRemoveItem = (itemId) => {
    setEditOrder({
      ...editOrder,
      items: editOrder.items.filter(item => item.id !== itemId),
    });
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    return (
      <div className="p-6">
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
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Gestión de Pedidos</h1>
          <Button onClick={() => window.location.reload()} variant="secondary">
            🔄 Actualizar
          </Button>
        </div>
        <div className="flex gap-2 pr-8">
          <input
            type="text"
            placeholder="Buscar por N° o producto..."
            className="px-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2 pr-8 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent min-w-[180px]"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {Object.values(ORDER_STATUS_LABELS).map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 pr-8 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent min-w-[180px]"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="local">Local</option>
            <option value="delivery">Delivery</option>
            <option value="takeaway">Para llevar</option>
            <option value="dine_in">En local</option>
          </select>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Pedido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tomado por</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesa/Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  {orders.length === 0 
                    ? "No hay pedidos registrados en el sistema" 
                    : "No se encontraron pedidos que coincidan con los filtros aplicados"
                  }
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.takenBy || 'Sistema'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {order.tableNumber || (
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      order.deliveryType === 'local' ? 'bg-blue-100 text-blue-800' : 
                      order.deliveryType === 'delivery' ? 'bg-green-100 text-green-800' : 
                      order.deliveryType === 'takeaway' ? 'bg-orange-100 text-orange-800' : 
                      order.deliveryType === 'dine_in' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.deliveryType === 'local' ? 'Local' : 
                       order.deliveryType === 'delivery' ? 'Delivery' : 
                       order.deliveryType === 'takeaway' ? 'Para llevar' : 
                       order.deliveryType === 'dine_in' ? 'En local' : 'Cliente'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Entregado' ? 'bg-green-100 text-green-800' : order.status === 'En Proceso' ? 'bg-yellow-100 text-yellow-800' : `bg-${ORDER_STATUS_COLORS[Object.keys(ORDER_STATUS_LABELS).find(key => ORDER_STATUS_LABELS[key] === order.status)]}-100 text-${ORDER_STATUS_COLORS[Object.keys(ORDER_STATUS_LABELS).find(key => ORDER_STATUS_LABELS[key] === order.status)]}-800`}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(order.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button variant="primary" onClick={() => handleOpenModal(order)}>
                    Ver Detalles
                  </Button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles y edición */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Pedido #${selectedOrder?.id}`} size="xl">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <div>
                <span className="font-semibold">Fecha:</span> {selectedOrder.date}
              </div>
              <div>
                <span className="font-semibold">Cliente:</span> {selectedOrder.clientName || 'Cliente'}
              </div>
              <div>
                <span className="font-semibold">Tomado por:</span> {selectedOrder.takenBy || 'Sistema'}
              </div>
              <div>
                <span className="font-semibold">Mesa/Tipo:</span> {
                  selectedOrder.tableNumber || 
                  (selectedOrder.deliveryType === 'local' ? 'Local' : 
                   selectedOrder.deliveryType === 'delivery' ? 'Delivery' : 
                   selectedOrder.deliveryType === 'takeaway' ? 'Para llevar' : 
                   selectedOrder.deliveryType === 'dine_in' ? 'En local' : 'Cliente')
                }
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {selectedOrder.status}
                {ORDER_STATUS_FLOW[Object.keys(ORDER_STATUS_LABELS).find(key => ORDER_STATUS_LABELS[key] === selectedOrder.status)]?.length > 0 && !editMode && (
                  <select
                    className="ml-2 px-2 py-1 rounded border border-gray-300"
                    value={selectedOrder.status}
                    onChange={e => handleChangeStatus(selectedOrder, e.target.value)}
                  >
                    <option value={selectedOrder.status}>{selectedOrder.status}</option>
                    {ORDER_STATUS_FLOW[Object.keys(ORDER_STATUS_LABELS).find(key => ORDER_STATUS_LABELS[key] === selectedOrder.status)]?.map(nextStatusKey => (
                      <option key={nextStatusKey} value={ORDER_STATUS_LABELS[nextStatusKey]}>{ORDER_STATUS_LABELS[nextStatusKey]}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <div>
              <span className="font-semibold">Dirección:</span> {selectedOrder.shippingAddress}
            </div>
            <div>
              <span className="font-semibold">Método de pago:</span> {selectedOrder.paymentMethod}
            </div>
            <div>
              <span className="font-semibold">Notas:</span> {selectedOrder.notes}
            </div>
            <div>
              <span className="font-semibold">Productos:</span>
              <div className="mt-2">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-xs text-gray-500">Producto</th>
                      <th className="px-2 py-1 text-xs text-gray-500">Cantidad</th>
                      <th className="px-2 py-1 text-xs text-gray-500">Precio</th>
                      <th className="px-2 py-1 text-xs text-gray-500">Subtotal</th>
                      {editMode && <th className="px-2 py-1 text-xs text-gray-500">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(editMode ? editOrder.items : selectedOrder.items).map(item => (
                      <tr key={item.id}>
                        <td className="px-2 py-1 flex items-center gap-2">
                          <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                          <span>{item.name}</span>
                        </td>
                        <td className="px-2 py-1">
                          {editMode ? (
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={e => handleEditItemQty(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 px-1 py-0.5 border rounded"
                            />
                          ) : (
                            item.quantity
                          )}
                        </td>
                        <td className="px-2 py-1">{formatCurrency(item.price)}</td>
                        <td className="px-2 py-1">{formatCurrency(item.price * item.quantity)}</td>
                        {editMode && (
                          <td className="px-2 py-1">
                            <Button size="sm" variant="danger" onClick={() => handleRemoveItem(item.id)}>
                              Eliminar
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="font-bold text-lg">Total: {formatCurrency((editMode ? editOrder.items : selectedOrder.items).reduce((acc, item) => acc + item.price * item.quantity, 0))}</div>
              {!editMode ? (
                <Button variant="primary" onClick={handleEdit}>
                  Editar Pedido
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="success" onClick={handleSaveEdit}>Guardar</Button>
                  <Button variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageOrders; 