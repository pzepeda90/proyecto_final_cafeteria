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
  const [cartExpanded, setCartExpanded] = useState(false);
  
  // Estado para triggear refresh de mesas
  const [mesasRefreshTrigger, setMesasRefreshTrigger] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchTerm]);

  // Efecto para expandir automáticamente el carrito cuando hay productos
  // useEffect(() => {
  //   if (cart.length > 0 && !cartExpanded && orderType !== 'dine_in') {
  //     setCartExpanded(true);
  //   }
  // }, [cart.length, orderType]);

  // Efecto para colapsar automáticamente el carrito cuando se selecciona "dine_in"
  useEffect(() => {
    if (orderType === 'dine_in' && cartExpanded) {
      setCartExpanded(false);
    }
  }, [orderType]);

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
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.producto_id);
      
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          showError(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
          return prevCart; // Retornar el estado anterior sin cambios
        }
        
        // Actualizar cantidad del producto existente
        const updatedCart = prevCart.map(item =>
          item.id === product.producto_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        const mesaText = selectedMesa ? ` para Mesa ${selectedMesa.numero}` : '';
        showSuccess(`${product.nombre} agregado al carrito${mesaText} (${existingItem.quantity + 1} unidades)`);
        
        return updatedCart;
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
        
        const mesaText = selectedMesa ? ` para Mesa ${selectedMesa.numero}` : '';
        showSuccess(`${product.nombre} agregado al carrito${mesaText}`);
        
        return [...prevCart, newItem];
      }
    });
    
    // Asegurar que el carrito esté expandido cuando se agregan productos
    // setCartExpanded(true);
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => {
      const product = products.find(p => p.producto_id === productId);
      if (newQuantity > product.stock) {
        showError(`Stock insuficiente. Solo hay ${product.stock} unidades disponibles`);
        return prevCart; // Retornar el estado anterior sin cambios
      }

      return prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
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
      
      // Mapear tipos de entrega al formato correcto para la base de datos
      const mapOrderType = (type) => {
        switch (type) {
          case 'delivery':
            return 'delivery'; // Delivery a domicilio
          case 'dine_in':
            return 'dine_in'; // Consumo en el local con mesa (mantener como dine_in)
          default:
            return type; // 'local', 'takeaway' se mantienen igual
        }
      };

      const orderData = {
        paymentMethodId: selectedPaymentMethod,
        deliveryType: mapOrderType(orderType),
        notes: notes.trim() || `Cliente: ${selectedCliente.nombreCompleto}${mesaInfo}`,
        items: cart.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        customerEmail: selectedCliente.email,
        tableNumber: selectedMesa?.numero || '',
        orderType: mapOrderType(orderType),
        clienteId: selectedCliente.id,
        mesaId: selectedMesa?.mesa_id || null
      };

      console.log('📋 Datos del pedido a crear:', orderData);
      console.log('🏠 Mesa seleccionada completa:', selectedMesa);
      console.log('🆔 Mesa ID que se enviará:', orderData.mesaId);
      console.log('📝 Tipo de orden:', orderType, '-> Mapeado a:', mapOrderType(orderType));

      // Crear el pedido usando el servicio
      const newOrder = await OrdersService.createDirectOrder(orderData);
      
      const mesaText = selectedMesa ? ` para Mesa ${selectedMesa.numero}` : '';
      showSuccess(`¡Pedido #${newOrder.id} creado exitosamente${mesaText}!`);
      
      // Si había una mesa seleccionada y era tipo dine_in, actualizar inmediatamente
      if (selectedMesa && orderType === 'dine_in') {
        console.log(`✅ Pedido creado exitosamente para Mesa ${selectedMesa.numero} - Actualizando estado...`);
        
        // Refresh inmediato múltiple con más frecuencia
        console.log(`🔄 REFRESH INMEDIATO 1 - Mesa ${selectedMesa.numero}`);
        setMesasRefreshTrigger(prevTrigger => prevTrigger + 1);
        
        // Refresh después de 500ms
        setTimeout(() => {
          console.log(`🔄 REFRESH RETARDADO 1 - Mesa ${selectedMesa.numero}`);
          setMesasRefreshTrigger(prevTrigger => prevTrigger + 1);
        }, 500);
        
        // Refresh después de 1 segundo
        setTimeout(() => {
          console.log(`🔄 REFRESH RETARDADO 2 - Mesa ${selectedMesa.numero}`);
          setMesasRefreshTrigger(prevTrigger => prevTrigger + 1);
        }, 1000);
        
        // Refresh después de 2 segundos
        setTimeout(() => {
          console.log(`🔄 REFRESH RETARDADO 3 - Mesa ${selectedMesa.numero}`);
          setMesasRefreshTrigger(prevTrigger => prevTrigger + 1);
        }, 2000);
      }
      
      // Limpiar el carrito y cerrar modal
      clearCart();
      setShowPaymentModal(false);
      
      // Recargar productos para actualizar stock
      loadInitialData();
      
      // Delay adicional para asegurar sincronización completa
      setTimeout(() => {
        console.log('Refresh adicional de mesas después de crear pedido');
        setMesasRefreshTrigger(prevTrigger => prevTrigger + 1);
      }, 5000); // 5 segundos de delay para sincronización completa
      
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
    <div className="container mx-auto px-4 py-8 pb-52">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Punto de Venta</h1>
        <div className="flex gap-2">
          <Button onClick={loadInitialData} variant="secondary" size="sm">
            🔄 Actualizar Productos
          </Button>
          <Button 
            onClick={() => {
              console.log('🔄 REFRESH MANUAL DE MESAS SOLICITADO');
              console.log('🔄 Trigger actual:', mesasRefreshTrigger);
              setMesasRefreshTrigger(prevTrigger => {
                const newTrigger = prevTrigger + 1;
                console.log('🔄 Nuevo trigger:', newTrigger);
                return newTrigger;
              });
            }} 
            variant="secondary" 
            size="sm"
          >
            🏠 Debug Mesas
          </Button>
          <Button 
            onClick={async () => {
              try {
                console.log('🔍 VERIFICANDO MESA 11 ESPECÍFICAMENTE...');
                const response = await fetch('http://localhost:3001/api/mesas/11/detalle');
                const data = await response.json();
                console.log('📊 ESTADO ACTUAL MESA 11:');
                console.log('   Mesa:', data.mesa);
                console.log('   Pedidos activos:', data.pedidos_activos);
                console.log('   Total pedidos:', data.total_pedidos_activos);
              } catch (error) {
                console.error('❌ Error al verificar Mesa 11:', error);
              }
            }} 
            variant="secondary" 
            size="sm"
          >
            🔍 Debug Mesa 11
          </Button>
          <Button 
            onClick={async () => {
              const mesaNum = prompt('¿Qué mesa quieres verificar? (número)');
              if (!mesaNum) return;
              
              try {
                console.log(`🔍 VERIFICANDO MESA ${mesaNum} ESPECÍFICAMENTE...`);
                const response = await fetch(`http://localhost:3001/api/mesas/${mesaNum}/detalle`);
                if (!response.ok) {
                  console.error(`❌ Error ${response.status}: Mesa ${mesaNum} no encontrada`);
                  return;
                }
                const data = await response.json();
                console.log(`📊 ESTADO ACTUAL MESA ${mesaNum}:`);
                console.log('   Mesa:', data.mesa);
                console.log('   Pedidos activos:', data.pedidos_activos);
                console.log('   Total pedidos:', data.total_pedidos_activos);
                
                // También verificar en la base de datos
                console.log(`💾 INFO BASE DE DATOS MESA ${mesaNum}:`);
                console.log(`   Estado en BD: ${data.mesa.estado}`);
                console.log(`   Actualizada: ${data.mesa.updated_at}`);
              } catch (error) {
                console.error(`❌ Error al verificar Mesa ${mesaNum}:`, error);
              }
            }} 
            variant="secondary" 
            size="sm"
          >
            🔍 Debug Cualquier Mesa
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
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
          <div className="bg-white rounded-lg shadow-xl lg:sticky lg:top-4 max-h-[calc(100vh-16rem)] flex flex-col">
            {/* Header del carrito - Fijo */}
            <div className="p-4 border-b flex-shrink-0">
              <h2 className="text-xl font-bold">Carrito de Compras</h2>
            </div>
            
            {/* CONTENEDOR 1: Información del Cliente - Fijo en la parte superior */}
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

            {/* CONTENEDOR 2: Items del carrito - Área con altura fija */}
            <div className={cartExpanded ? "flex-shrink-0" : "hidden"}>
                <div className="px-4 pt-4 pb-2">
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
                    <div className="flex flex-col">
                      {/* Header del carrito con mejor espaciado */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 flex-shrink-0">
                        <div className="text-base font-semibold text-gray-800">
                          Productos agregados
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={clearCart}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-all duration-200 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md"
                            title="Limpiar carrito"
                          >
                            <span className="text-sm">🗑️</span>
                            Limpiar
                          </button>
                          <button
                            onClick={() => setCartExpanded(!cartExpanded)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-all duration-200 bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg border border-primary/20 hover:border-primary/30 shadow-sm hover:shadow-md"
                          >
                            <span className="text-sm">{cartExpanded ? '🔼' : '🔽'}</span>
                            {cartExpanded ? 'Ocultar' : 'Ver productos'}
                            {!cartExpanded && (
                              <span className="bg-primary text-white text-[10px] font-medium px-2 py-0.5 rounded-full ml-1 min-w-[20px]">
                                {cart.reduce((sum, item) => sum + item.quantity, 0)}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      {/* Contador de productos */}
                      <div className="text-sm text-gray-600 mb-4 px-1">
                        <span>
                          {cart.length} {cart.length === 1 ? 'producto' : 'productos'} • {cart.reduce((sum, item) => sum + item.quantity, 0)} unidades en total
                        </span>
                      </div>
                      
                      {/* Productos del carrito - exactamente 3 productos visibles */}
                      <div className={`cart-scroll pr-1 transition-all duration-300 ease-in-out cart-container ${
                        cartExpanded ? 'opacity-100 overflow-y-auto' : 'opacity-0 max-h-0 overflow-hidden'
                      } ${orderType === 'dine_in' ? 'with-mesa-selector' : ''}`}>
                        <div className="space-y-2">
                          {cart.map(item => (
                            <div key={item.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cart-item">
                              {/* Contenido del item */}
                              <div className="p-2">
                                {/* Header del item con imagen, nombre y eliminar */}
                                <div className="flex items-center gap-3 mb-1">
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
                                    <h4 className="font-medium text-gray-900 text-sm leading-tight truncate">
                                      {item.name}
                                    </h4>
                                    <div className="text-xs text-gray-600">
                                      {formatCurrency(item.price)} c/u • Stock: {item.stock}
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromCart(item.id);
                                    }}
                                    className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold transition-colors flex-shrink-0"
                                    title="Eliminar producto"
                                  >
                                    ×
                                  </button>
                                </div>
                                
                                {/* Controles de cantidad y total en una línea */}
                                <div className="flex justify-between items-center bg-gray-50 rounded-lg p-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600">Cant:</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateCartQuantity(item.id, item.quantity - 1);
                                        }}
                                        className="w-6 h-6 rounded bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-sm font-bold transition-colors"
                                        disabled={item.quantity <= 1}
                                      >
                                        -
                                      </button>
                                      <span className="w-8 text-center text-sm font-bold bg-white px-1 py-1 rounded border border-gray-300">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateCartQuantity(item.id, item.quantity + 1);
                                        }}
                                        className="w-6 h-6 rounded bg-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-sm font-bold transition-colors"
                                        disabled={item.quantity >= item.stock}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <p className="text-base font-bold text-primary">
                                      {formatCurrency(item.price * item.quantity)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            {/* Resumen compacto cuando está colapsado - PARTE DEL CONTENEDOR 2 */}
            {!cartExpanded && cart.length > 0 && (
              <div className="px-4 pb-2 pt-2">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Header de la card compacta */}
                  <div className="bg-white/60 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">
                            Resumen del carrito
                          </div>
                          <div className="text-xs text-gray-600">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} productos en total
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setCartExpanded(true)}
                        className="inline-flex items-center justify-center w-8 h-8 text-primary hover:text-primary-dark transition-all duration-200 bg-primary/10 hover:bg-primary/20 rounded-lg border border-primary/20 hover:border-primary/30 shadow-sm hover:shadow-md"
                        title="Ver detalles del carrito"
                      >
                        <span className="text-sm">👁️</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Etiquetas de productos */}
                  <div className="px-4 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {cart.map((item, index) => {
                        const colors = [
                          'bg-blue-100 text-blue-800 border-blue-200',
                          'bg-green-100 text-green-800 border-green-200', 
                          'bg-purple-100 text-purple-800 border-purple-200',
                          'bg-orange-100 text-orange-800 border-orange-200',
                          'bg-pink-100 text-pink-800 border-pink-200',
                          'bg-indigo-100 text-indigo-800 border-indigo-200',
                          'bg-teal-100 text-teal-800 border-teal-200'
                        ];
                        const colorClass = colors[index % colors.length];
                        
                        return (
                          <span key={item.id} className={`inline-flex items-center text-[10px] px-2 py-1 rounded-md border font-medium transition-all duration-200 hover:scale-105 ${colorClass}`}>
                            {item.name} ({item.quantity})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENEDOR 3: Totales y botón - Fijo en la parte inferior */}
            {cart.length > 0 && (
              <div className="p-4 border-t bg-white flex-shrink-0 rounded-b-lg">
                                  {/* Resumen de items */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Resumen del pedido
                  </div>
                  
                  {/* Mostrar mesa asignada si hay una seleccionada */}
                  {selectedMesa && (
                    <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-lg">🪑</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-blue-900">
                              Mesa {selectedMesa.numero}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">
                              {selectedMesa.capacidad} personas máx.
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="text-xs text-blue-700 bg-blue-200 px-3 py-1.5 rounded-full font-medium shadow-sm">
                            {cart.length} {cart.length === 1 ? 'producto' : 'productos'}
                          </div>
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
        size="md"
      >
        <div className="space-y-3">
          {/* Resumen del Pedido */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-medium text-base mb-2">Resumen del Pedido</h3>
            
            {/* Información del Cliente */}
            <div className="mb-3 p-2 bg-white rounded border">
              <h4 className="font-medium text-xs mb-1">Cliente</h4>
              <div className="text-xs space-y-0.5">
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
            <div className="mb-3">
              <h4 className="font-medium text-xs mb-1">Productos</h4>
              <div className="space-y-1">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs bg-white p-1.5 rounded border">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500 ml-1">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales */}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Impuestos (19%):</span>
                <span>{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t pt-1">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Configuración del Pedido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tipo de Pedido
              </label>
              <select
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Método de Pago
              </label>
              <select
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Notas adicionales
            </label>
            <textarea
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas especiales del pedido..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 text-xs py-2"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcessOrder}
              className="flex-1 text-xs py-2"
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