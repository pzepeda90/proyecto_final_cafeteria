import { useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { formatCurrency } from '../../utils/formatters';
import { showSuccess } from '../../services/notificationService';

const mockOrders = [
  {
    id: 101,
    client: 'Juan Pérez',
    status: 'En Proceso',
    total: 4500,
    date: '2024-06-01',
    payment: 'Efectivo',
    items: [
      { name: 'Café Espresso', qty: 2, price: 1500 },
      { name: 'Brownie', qty: 1, price: 1200 },
    ],
  },
  {
    id: 102,
    client: 'Ana López',
    status: 'Entregado',
    total: 1800,
    date: '2024-06-02',
    payment: 'Tarjeta Débito',
    items: [
      { name: 'Café Latte', qty: 1, price: 1800 },
    ],
  },
  {
    id: 103,
    client: 'Cliente Mostrador',
    status: 'Cancelado',
    total: 1600,
    date: '2024-06-03',
    payment: 'Efectivo',
    items: [
      { name: 'Té Chai', qty: 1, price: 1600 },
    ],
  },
];

const statusOptions = ['Todos', 'En Proceso', 'Entregado', 'Cancelado'];

const MyOrders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = status === 'Todos' ? true : order.status === status;
    const matchesSearch =
      order.client.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toString().includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mis Pedidos</h1>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar por cliente o N° pedido..."
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
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
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
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.client}</td>
                <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${order.status === 'Entregado' ? 'bg-green-100 text-green-700' : order.status === 'En Proceso' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{order.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(order.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button size="sm" variant="info" onClick={() => setSelectedOrder(order)}>
                    Ver Detalles
                  </Button>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">No hay pedidos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal Detalles Pedido */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Pedido #${selectedOrder?.id}`} size="md">
        {selectedOrder && (
          <div>
            <div className="mb-2 font-semibold">Cliente: {selectedOrder.client}</div>
            <div className="mb-2 text-gray-600">Fecha: {selectedOrder.date}</div>
            <div className="mb-2">Pago: {selectedOrder.payment}</div>
            <div className="mb-2">Estado: <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedOrder.status === 'Entregado' ? 'bg-green-100 text-green-700' : selectedOrder.status === 'En Proceso' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{selectedOrder.status}</span></div>
            <ul className="divide-y mb-2">
              {selectedOrder.items.map((item, idx) => (
                <li key={idx} className="flex justify-between py-1">
                  <span>{item.name} x {item.qty}</span>
                  <span>{formatCurrency(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="font-bold mb-4">Total: {formatCurrency(selectedOrder.total)}</div>
            {selectedOrder.status === 'En Proceso' && (
              <Button className="w-full" variant="success" onClick={() => {
                setOrders(orders => orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'Entregado' } : o));
                setSelectedOrder(null);
                showSuccess('¡Pedido marcado como entregado!');
              }}>
                Marcar como Entregado
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyOrders; 