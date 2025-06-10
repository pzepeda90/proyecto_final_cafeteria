import { useState } from 'react';
import Button from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import Modal from '../../components/ui/Modal';

const mockProducts = [
  { id: 1, name: 'Café Espresso', price: 1500 },
  { id: 2, name: 'Café Latte', price: 1800 },
  { id: 3, name: 'Brownie', price: 1200 },
  { id: 4, name: 'Té Chai', price: 1600 },
];

const mockClients = [
  { id: 1, name: 'Juan Pérez', email: 'juan@mail.com' },
  { id: 2, name: 'Ana López', email: 'ana@mail.com' },
  { id: 3, name: 'Cliente Mostrador', email: '' },
];

const mockPayments = [
  { id: 1, name: 'Efectivo' },
  { id: 2, name: 'Tarjeta Débito' },
  { id: 3, name: 'Tarjeta Crédito' },
];

const SellerPOS = () => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [clientModal, setClientModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [ticketModal, setTicketModal] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState(mockClients);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [newClient, setNewClient] = useState({ name: '', email: '' });

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const addProduct = (product) => {
    setSelected((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeProduct = (id) => {
    setSelected((prev) => prev.filter((item) => item.id !== id));
  };

  const changeQty = (id, qty) => {
    setSelected((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, qty) } : item
      )
    );
  };

  const subtotal = selected.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientModal(false);
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    const client = { ...newClient, id: Date.now() };
    setClients((prev) => [...prev, client]);
    setSelectedClient(client);
    setNewClient({ name: '', email: '' });
    setClientModal(false);
  };

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentModal(false);
  };

  const handleFinishSale = () => {
    if (!selectedClient || !selected.length || !selectedPayment) return;
    setTicketModal(true);
  };

  const handleCloseTicket = () => {
    setSelected([]);
    setSelectedClient(null);
    setSelectedPayment(null);
    setTicketModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Punto de Venta</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
        <Button variant={selectedClient ? 'success' : 'primary'} onClick={() => setClientModal(true)}>
          {selectedClient ? `Cliente: ${selectedClient.name}` : 'Seleccionar Cliente'}
        </Button>
        <Button variant={selectedPayment ? 'success' : 'primary'} onClick={() => setPaymentModal(true)}>
          {selectedPayment ? `Pago: ${selectedPayment.name}` : 'Seleccionar Pago'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Buscador y productos */}
        <div className="md:col-span-2">
          <input
            type="text"
            placeholder="Buscar producto..."
            className="w-full px-4 py-2 mb-4 border rounded-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded shadow p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-gray-500">{formatCurrency(product.price)}</div>
                </div>
                <Button onClick={() => addProduct(product)}>Agregar</Button>
              </div>
            ))}
            {filteredProducts.length === 0 && <div className="col-span-2 text-gray-400">No hay productos</div>}
          </div>
        </div>
        {/* Carrito / venta */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Venta Actual</h2>
          <div className="bg-white rounded shadow p-4 mb-4">
            {selected.length === 0 ? (
              <div className="text-gray-400">No hay productos seleccionados</div>
            ) : (
              <ul className="divide-y">
                {selected.map(item => (
                  <li key={item.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.price)} x </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={e => changeQty(item.id, parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border rounded"
                      />
                      <Button variant="danger" size="sm" onClick={() => removeProduct(item.id)}>
                        Quitar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-2 font-bold text-lg">Subtotal: {formatCurrency(subtotal)}</div>
          <div className="mb-2 text-gray-600">IVA (19%): {formatCurrency(tax)}</div>
          <div className="mb-4 font-bold text-xl">Total: {formatCurrency(total)}</div>
          <Button className="w-full" disabled={!selectedClient || !selected.length || !selectedPayment} onClick={handleFinishSale}>
            Finalizar Venta
          </Button>
        </div>
      </div>

      {/* Modal Selección Cliente */}
      <Modal isOpen={clientModal} onClose={() => setClientModal(false)} title="Seleccionar Cliente">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar cliente por nombre o email..."
            className="w-full px-4 py-2 mb-2 border rounded-lg"
            value={clientSearch}
            onChange={e => setClientSearch(e.target.value)}
          />
          <div className="max-h-40 overflow-y-auto">
            {filteredClients.map(client => (
              <div key={client.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <div className="font-semibold">{client.name}</div>
                  <div className="text-xs text-gray-500">{client.email}</div>
                </div>
                <Button size="sm" onClick={() => handleSelectClient(client)}>Seleccionar</Button>
              </div>
            ))}
            {filteredClients.length === 0 && <div className="text-gray-400">No hay clientes</div>}
          </div>
        </div>
        <form onSubmit={handleAddClient} className="border-t pt-4 mt-4">
          <div className="font-semibold mb-2">Crear cliente rápido</div>
          <input
            type="text"
            placeholder="Nombre"
            className="w-full px-4 py-2 mb-2 border rounded-lg"
            value={newClient.name}
            onChange={e => setNewClient({ ...newClient, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            className="w-full px-4 py-2 mb-2 border rounded-lg"
            value={newClient.email}
            onChange={e => setNewClient({ ...newClient, email: e.target.value })}
          />
          <Button type="submit" className="w-full mt-2">Crear y Seleccionar</Button>
        </form>
      </Modal>

      {/* Modal Selección Pago */}
      <Modal isOpen={paymentModal} onClose={() => setPaymentModal(false)} title="Seleccionar Método de Pago">
        <div className="space-y-2">
          {mockPayments.map(payment => (
            <Button key={payment.id} className="w-full" variant={selectedPayment?.id === payment.id ? 'success' : 'primary'} onClick={() => handleSelectPayment(payment)}>
              {payment.name}
            </Button>
          ))}
        </div>
      </Modal>

      {/* Modal Ticket Venta */}
      <Modal isOpen={ticketModal} onClose={handleCloseTicket} title="Ticket de Venta" size="md">
        <div className="mb-4">
          <div className="font-semibold">Cliente: {selectedClient?.name}</div>
          <div className="text-xs text-gray-500 mb-2">{selectedClient?.email}</div>
          <div className="mb-2">Pago: {selectedPayment?.name}</div>
          <ul className="divide-y mb-2">
            {selected.map(item => (
              <li key={item.id} className="flex justify-between py-1">
                <span>{item.name} x {item.qty}</span>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="font-bold">Subtotal: {formatCurrency(subtotal)}</div>
          <div className="text-gray-600">IVA (19%): {formatCurrency(tax)}</div>
          <div className="font-bold text-lg">Total: {formatCurrency(total)}</div>
        </div>
        <Button className="w-full" onClick={handleCloseTicket}>Cerrar</Button>
      </Modal>
    </div>
  );
};

export default SellerPOS; 