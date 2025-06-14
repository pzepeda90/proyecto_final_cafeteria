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
import '../../styles/pos.css';

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
  const [cartExpanded, setCartExpanded] = useState(true);
  
  // Estado para triggear refresh de mesas
  const [mesasRefreshTrigger, setMesasRefreshTrigger] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  // Efecto para expandir automáticamente el carrito cuando hay productos
  useEffect(() => {
    if (cart.length > 0 && !cartExpanded) {
      setCartExpanded(true);
    }
  }, [cart.length]);

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
      // Actualizar cantidad del producto existente
      setCart(cart.map(item =>
        item.id === product.producto_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
      const mesaText = selectedMesa ? ` para Mesa ${selectedMesa.numero}` : '';
      showSuccess(`${product.nombre} agregado al carrito${mesaText} (${existingItem.quantity + 1} unidades)`);
    } else {
      // Agregar nuevo producto al carrito
      const newItem = {
        id: product.producto_id,
        name: product.nombre,
        price: parseFloat(product.precio),
        quantity: 1,
        stock: product.stock,
        image: product.imagen_url,
        mesaAsignada: selectedMesa?.numero || null // Guardar la mesa asignada
      };
      setCart([...cart, newItem]);
      const mesaText = selectedMesa ? ` para Mesa ${selectedMesa.numero}` : '';
      showSuccess(`${product.nombre} agregado al carrito${mesaText}`);
    }
    
    // Asegurar que el carrito esté expandido cuando se agregan productos
    setCartExpanded(true);
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
    const taxes = subtotal * 0.19; // 19% de impuestos
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

    if (orderType === 'dine_in' && !selectedMesa) {
      showError('Para consumo en el local debe seleccionar una mesa');
      return;
    }

    if (orderType === 'delivery' && !selectedCliente.telefono) {
      showError('Para delivery es necesario el teléfono del cliente');
      return;
    }

    try {
      setIsProcessing(true);
      
      const mesaInfo = selectedMesa ? ` - Mesa: ${selectedMesa.numero}` : '';
      
      const orderData = {
        paymentMethodId: selectedPaymentMethod,
        deliveryType: orderType === 'delivery' ? 'domicilio' : orderType,
        notes: notes.trim() || `Cliente: ${selectedCliente.nombreCompleto}${mesaInfo}`,
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

      console.log('📋 Datos del pedido a crear:', orderData);

      // Crear el pedido usando el servicio
      const newOrder = await OrdersService.createDirectOrder(orderData);
      
      const mesaText = selectedMesa ? ` para Mesa ${selectedMesa.numero}` : '';
      showSuccess(`¡Pedido #${newOrder.id} creado exitosamente${mesaText}!`);
      
      // Limpiar el carrito y cerrar modal
      clearCart();
      setShowPaymentModal(false);
      
      // Recargar productos para actualizar stock
      loadInitialData();
      
      // Delay pequeño para asegurar que el backend haya actualizado la mesa
      setTimeout(() => {
        // Triggear refresh de mesas
        setMesasRefreshTrigger(prevTrigger => prevTrigger + 1);
      }, 500); // 500ms de delay
      
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      showError(error.message || 'Error al procesar el pedido');
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para manejar cambio de tipo de pedido
  const handleOrderTypeChange = (newOrderType) => {
    setOrderType(newOrderType);
    // Si el nuevo tipo no requiere mesa, limpiar la mesa seleccionada
    if (newOrderType !== 'dine_in') {
      setSelectedMesa(null);
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filtros */}
          <div className="bg-white rounded-lg shadow p-4">
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
                className="bg-white rounded-lg shadow product-card hover-lift cursor-pointer"
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
          <div className="bg-white rounded-lg shadow lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] flex flex-col">
            {/* Header del carrito - Fijo */}
            <div className="p-4 border-b flex-shrink-0">
              <h2 className="text-xl font-bold">Carrito de Compras</h2>
            </div>
            
            {/* Contenido scrolleable del carrito */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Información del Cliente - Fijo en la parte superior */}
              <div className="p-4 border-b flex-shrink-0 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">👤 Cliente & Mesa</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOrderTypeChange('local')}
                      className={`px-2 py-1 text-xs rounded ${orderType === 'local' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                      title="Retiro en Local"
                    >
                      🏪
                    </button>
                    <button
                      onClick={() => handleOrderTypeChange('delivery')}
                      className={`px-2 py-1 text-xs rounded ${orderType === 'delivery' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                      title="Delivery"
                    >
                      🚚
                    </button>
                    <button
                      onClick={() => handleOrderTypeChange('takeaway')}
                      className={`px-2 py-1 text-xs rounded ${orderType === 'takeaway' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                      title="Para Llevar"
                    >
                      📦
                    </button>
                    <button
                      onClick={() => handleOrderTypeChange('dine_in')}
                      className={`px-2 py-1 text-xs rounded ${orderType === 'dine_in' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}
                      title="Consumo en el Local"
                    >
                      🍽️
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <ClienteSelector
                    selectedCliente={selectedCliente}
                    onClienteSelect={setSelectedCliente}
                    placeholder={selectedMesa ? `Buscar cliente para Mesa ${selectedMesa.numero}...` : "Buscar cliente..."}
                    mesaInfo={selectedMesa}
                  />
                  
                  {orderType === 'dine_in' && (
                    <div className="mt-2">
                      <MesaSelector
                        selectedMesa={selectedMesa}
                        onMesaSelect={setSelectedMesa}
                        compact={true}
                        externalRefresh={mesasRefreshTrigger}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Items del carrito - Área scrolleable */}
              <div className={`${cartExpanded ? 'flex-1' : 'flex-shrink-0'} overflow-hidden ${cartExpanded ? 'cart-container-expanded' : 'cart-container-collapsed'}`}>
                <div className="p-4 h-full">
                  {cart.length === 0 ? (
                    <div className="text-center text-gray-500 py-16">
                      <div className="text-5xl mb-4">🛒</div>
                      <p className="text-lg font-medium mb-2">Carrito vacío</p>
                      <p className="text-sm mb-4">Agrega productos para comenzar</p>
                      {filteredProducts.length > 0 ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 text-xs">
                          💡 Haz clic en cualquier producto de la izquierda para agregarlo al carrito
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-xs">
                          ⚠️ No hay productos disponibles en este momento
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <div className="text-sm font-medium text-gray-700">
                          Productos agregados ({cart.length} {cart.length === 1 ? 'producto' : 'productos'})
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={clearCart}
                            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 transition-colors bg-red-50 hover:bg-red-100 px-2 py-1 rounded-full border border-red-200"
                            title="Limpiar carrito"
                          >
                            🗑️ Limpiar
                          </button>
                          <button
                            onClick={() => setCartExpanded(!cartExpanded)}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-full"
                          >
                            {cartExpanded ? '🔼 Ocultar' : '🔽 Ver productos'}
                            {!cartExpanded && (
                              <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Productos del carrito - siempre visibles cuando expandido */}
                      <div className="flex-1 overflow-y-auto cart-scroll pr-1" style={{ 
                        maxHeight: cartExpanded ? '320px' : '80px',
                        display: cartExpanded ? 'block' : 'none'
                      }}>
                        <div className="space-y-2">
                          {cart.map(item => (
                            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm hover:shadow-md transition-shadow cart-item">
                              {/* Header del item con imagen si existe */}
                              <div className="flex items-start gap-2 mb-2">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0 text-sm">
                                    📦
                                  </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                    {item.name}
                                  </h4>
                                  <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-600">
                                      {formatCurrency(item.price)} por unidad
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromCart(item.id);
                                      }}
                                      className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold transition-colors"
                                      title="Eliminar producto"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Controles de cantidad y total */}
                              <div className="flex justify-between items-center bg-gray-50 rounded-lg p-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-600 font-medium">Cantidad:</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateCartQuantity(item.id, item.quantity - 1);
                                      }}
                                      className="w-7 h-7 rounded-full bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-sm font-bold transition-colors quantity-button"
                                      disabled={item.quantity <= 1}
                                    >
                                      -
                                    </button>
                                    <span className="w-10 text-center text-sm font-bold bg-white px-2 py-1 rounded border border-gray-300">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateCartQuantity(item.id, item.quantity + 1);
                                      }}
                                      className="w-7 h-7 rounded-full bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-sm font-bold transition-colors quantity-button"
                                      disabled={item.quantity >= item.stock}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <p className="text-lg font-bold text-primary">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-xs text-gray-500">
                                      {item.quantity} × {formatCurrency(item.price)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Stock disponible */}
                              <div className="mt-1 text-xs text-gray-500">
                                Stock disponible: {item.stock} unidades
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen compacto cuando está colapsado - Aparece antes del Resumen del pedido */}
            {!cartExpanded && cart.length > 0 && (
              <div className="p-4 pb-0">
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-primary">
                  <div className="text-xs text-gray-600 mb-1">
                    📦 {cart.reduce((sum, item) => sum + item.quantity, 0)} productos en total
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cart.slice(0, 3).map(item => (
                      <span key={item.id} className="text-xs bg-white px-2 py-1 rounded border">
                        {item.name} ({item.quantity})
                      </span>
                    ))}
                    {cart.length > 3 && (
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                        +{cart.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Totales y botón - Fijo en la parte inferior */}
            {cart.length > 0 && (
              <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                {/* Resumen de items */}
                <div className="mb-4 p-3 bg-white rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Resumen del pedido
                  </div>
                  
                  {/* Mostrar mesa asignada si hay una seleccionada */}
                  {selectedMesa && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">🪑</span>
                          <span className="text-sm font-medium text-blue-800">
                            Mesa {selectedMesa.numero}
                          </span>
                          <span className="text-xs text-blue-600">
                            ({selectedMesa.capacidad} personas)
                          </span>
                        </div>
                        <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                          {cart.length} {cart.length === 1 ? 'producto' : 'productos'} asignados
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-600 mb-3">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)} productos • 
                    {cart.length} {cart.length === 1 ? 'tipo' : 'tipos'} diferentes
                    {selectedMesa && ` • Mesa ${selectedMesa.numero}`}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Impuestos (19%):</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(taxes)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                      <span className="text-gray-900">Total a pagar:</span>
                      <span className="text-primary text-xl">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={cart.length === 0 || !selectedCliente}
                >
                  {selectedCliente ? (
                    <div className="text-center">
                      <div className="font-bold text-lg mb-1">
                        💳 Procesar Pedido
                      </div>
                      <div className="text-sm opacity-90">
                        {selectedCliente.nombreCompleto}
                        {selectedMesa && ` - Mesa ${selectedMesa.numero}`}
                      </div>
                      <div className="text-xs opacity-80 mt-1">
                        {orderType === 'local' ? '🏪 Local' : 
                         orderType === 'delivery' ? '🚚 Delivery' : 
                         orderType === 'takeaway' ? '📦 Takeaway' :
                         '🍽️ Consumo Local'} • {formatCurrency(total)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="font-bold text-lg">
                        👤 Seleccionar Cliente
                      </div>
                      <div className="text-xs opacity-80">
                        Primero selecciona un cliente para continuar
                      </div>
                    </div>
                  )}
                </Button>
              </div>
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
                  orderType === 'takeaway' ? '📦 Para Llevar' :
                  '🍽️ Consumo en el Local'
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
                <span>Impuestos (19%):</span>
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
                onChange={(e) => handleOrderTypeChange(e.target.value)}
              >
                <option value="local">🏪 Retiro en Local</option>
                <option value="delivery">🚚 Delivery</option>
                <option value="takeaway">📦 Para Llevar</option>
                <option value="dine_in">🍽️ Consumo en el Local</option>
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