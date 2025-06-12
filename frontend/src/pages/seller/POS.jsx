import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ClienteSelector from '../../components/pos/ClienteSelector';
import MesaSelector from '../../components/pos/MesaSelector';
import { formatCurrency } from '../../utils/formatters';
import { showSuccess, showError } from '../../services/notificationService';
import OrdersService from '../../services/ordersService';
import ProductsService from '../../services/productsService';

const POS = () => {
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(1);
  
  // Información del cliente y mesa
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [orderType, setOrderType] = useState('local'); // 'local', 'delivery', 'takeaway'
  const [notes, setNotes] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, paymentMethodsData] = await Promise.all([
        ProductsService.getProducts(),
        OrdersService.getPaymentMethods()
      ]);

      console.log('Productos cargados:', productsData);
      setProducts(productsData);
      setPaymentMethods(paymentMethodsData.filter(pm => pm.active));
      
      // Extraer categorías únicas usando la estructura correcta
      const uniqueCategories = [...new Set(productsData.map(p => p.Categorium?.nombre).filter(Boolean))];
      console.log('Categorías extraídas:', uniqueCategories);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      showError('Error al cargar los datos del POS');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(product => product.Categorium?.nombre === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Solo mostrar productos con stock disponible
    filtered = filtered.filter(product => product.stock > 0 && product.disponible);

    console.log('Productos filtrados:', filtered.length);
    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.producto_id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showError(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
        return;
      }
      setCart(cart.map(item =>
        item.id === product.producto_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        id: product.producto_id,
        name: product.nombre,
        price: parseFloat(product.precio),
        quantity: 1,
        stock: product.stock,
        image: product.imagen_url
      }]);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.producto_id === productId);
    if (newQuantity > product.stock) {
      showError(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCliente(null);
    setSelectedMesa(null);
    setOrderType('local');
    setNotes('');
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxes = subtotal * 0.16; // 16% de impuestos
    const total = subtotal + taxes;
    
    return { subtotal, taxes, total };
  };

  const handleProcessOrder = async () => {
    if (cart.length === 0) {
      showError('El carrito está vacío');
      return;
    }

    if (!selectedCliente) {
      showError('Seleccione un cliente');
      return;
    }

    if (orderType === 'delivery' && !selectedCliente.telefono) {
      showError('Para delivery es necesario el teléfono del cliente');
      return;
    }

    try {
      setIsProcessing(true);
      
      const orderData = {
        paymentMethodId: selectedPaymentMethod,
        deliveryType: orderType,
        notes: notes.trim() || `Cliente: ${selectedCliente.nombreCompleto}${selectedMesa ? ` - Mesa: ${selectedMesa.numero}` : ''}`,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        customerEmail: selectedCliente.email,
        tableNumber: selectedMesa?.numero || '',
        orderType: orderType,
        clienteId: selectedCliente.id,
        mesaId: selectedMesa?.mesa_id || null
      };

      // Crear el pedido usando el servicio
      const newOrder = await OrdersService.createDirectOrder(orderData);
      
      showSuccess(`¡Pedido #${newOrder.id} creado exitosamente!`);
      
      // Limpiar el carrito y cerrar modal
      clearCart();
      setShowPaymentModal(false);
      
      // Recargar productos para actualizar stock
      loadInitialData();
      
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      showError(error.message || 'Error al procesar el pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  const { subtotal, taxes, total } = calculateTotals();

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
        <h1 className="text-3xl font-bold">Punto de Venta</h1>
        <div className="flex gap-2">
          <Button onClick={loadInitialData} variant="secondary" size="sm">
            🔄 Actualizar
          </Button>
          {cart.length > 0 && (
            <Button onClick={clearCart} variant="danger" size="sm">
              🗑️ Limpiar Carrito
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Productos */}
        <div className="lg:col-span-2">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="md:w-48">
                <select
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div
                key={product.producto_id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => addToCart(product)}
              >
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  {product.imagen_url ? (
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      📦
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.nombre}</h3>
                  <p className="text-primary font-bold text-lg">{formatCurrency(product.precio)}</p>
                  <p className="text-xs text-gray-500">Stock: {product.stock}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No se encontraron productos disponibles
            </div>
          )}
        </div>

        {/* Panel del Carrito */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Carrito de Compras</h2>
            
            {/* Información del Cliente */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">👤 Cliente & Mesa</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setOrderType('local')}
                    className={`px-2 py-1 text-xs rounded ${orderType === 'local' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    🏪
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`px-2 py-1 text-xs rounded ${orderType === 'delivery' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    🚚
                  </button>
                  <button
                    onClick={() => setOrderType('takeaway')}
                    className={`px-2 py-1 text-xs rounded ${orderType === 'takeaway' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    📦
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <ClienteSelector
                  selectedCliente={selectedCliente}
                  onClienteSelect={setSelectedCliente}
                  placeholder="Buscar cliente..."
                />
                
                {orderType === 'local' && (
                  <MesaSelector
                    selectedMesa={selectedMesa}
                    onMesaSelect={setSelectedMesa}
                  />
                )}
              </div>
            </div>
            
            {/* Items del carrito */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-600">{formatCurrency(item.price)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQuantity(item.id, item.quantity - 1);
                      }}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCartQuantity(item.id, item.quantity + 1);
                      }}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.id);
                      }}
                      className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center text-sm ml-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Carrito vacío
              </div>
            )}

            {/* Totales */}
            {cart.length > 0 && (
              <>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Impuestos (16%):</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cart.length === 0 || !selectedCliente}
                >
                  {selectedCliente ? (
                    <div className="text-center">
                      <div className="font-medium">
                        {selectedCliente.nombreCompleto}
                        {selectedMesa && ` - Mesa ${selectedMesa.numero}`}
                      </div>
                      <div className="text-xs opacity-90">
                        {orderType === 'local' ? '🏪 Local' : 
                         orderType === 'delivery' ? '🚚 Delivery' : 
                         '📦 Takeaway'} • {formatCurrency(total)}
                      </div>
                    </div>
                  ) : (
                    'Seleccionar Cliente'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Confirmar Pedido"
        size="lg"
      >
        <div className="space-y-6">
          {/* Resumen del Pedido */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">Resumen del Pedido</h3>
            
            {/* Información del Cliente */}
            <div className="mb-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-sm mb-2">Cliente</h4>
              <div className="text-sm space-y-1">
                <p><strong>Nombre:</strong> {selectedCliente?.nombreCompleto || 'Sin especificar'}</p>
                {selectedCliente?.telefono && <p><strong>Teléfono:</strong> {selectedCliente.telefono}</p>}
                {selectedCliente?.email && <p><strong>Email:</strong> {selectedCliente.email}</p>}
                {selectedMesa && <p><strong>Mesa:</strong> {selectedMesa.numero}</p>}
                <p><strong>Tipo:</strong> {
                  orderType === 'local' ? '🏪 Retiro en Local' :
                  orderType === 'delivery' ? '🚚 Delivery' :
                  '📦 Takeaway'
                }</p>
              </div>
            </div>

            {/* Items del Pedido */}
            <div className="mb-4">
              <h4 className="font-medium text-sm mb-2">Productos</h4>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impuestos (16%):</span>
                <span>{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Configuración del Pedido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Pedido
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="local">🏪 Retiro en Local</option>
                <option value="delivery">🚚 Delivery</option>
                <option value="takeaway">📦 Takeaway</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(parseInt(e.target.value))}
              >
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </div>
          </div>



          {/* Notas adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas especiales del pedido..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcessOrder}
              className="flex-1"
              disabled={isProcessing || !selectedCliente?.nombreCompleto.trim()}
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Pedido'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default POS; 