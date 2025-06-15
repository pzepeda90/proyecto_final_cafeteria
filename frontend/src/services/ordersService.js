import axios from 'axios';

// Configuración base de axios para pedidos
const ordersAPI = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
ordersAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
ordersAPI.interceptors.response.use(
  (response) => {
    console.log('✅ OrdersService Response:', response.data);
    return response;
  },
  (error) => {
    console.error('❌ OrdersService Response Error:', error.response?.data || error.message);
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Mapeo de datos del backend al frontend
const mapOrderFromBackend = (backendOrder) => {
  // Validar que el objeto no sea null o undefined
  if (!backendOrder) {
    throw new Error('Datos del pedido no válidos');
  }
  

  
  return {
    id: backendOrder.pedido_id,
    numero_pedido: backendOrder.numero_pedido,
    userId: backendOrder.usuario_id,
    vendedorId: backendOrder.vendedor_id,
    clientName: backendOrder.Usuario ? `${backendOrder.Usuario.nombre} ${backendOrder.Usuario.apellido}` : 'Cliente',
    takenBy: backendOrder.Vendedor ? `${backendOrder.Vendedor.nombre} ${backendOrder.Vendedor.apellido}` : 'Sistema',
    tableNumber: backendOrder.Mesa ? `Mesa ${backendOrder.Mesa.numero}` : null,
    date: backendOrder.fecha_pedido,
    status: backendOrder.EstadoPedido?.nombre || 'Pendiente',
    statusId: backendOrder.estado_pedido_id,
    statusColor: backendOrder.EstadoPedido?.color || '#6B7280',
    paymentMethod: backendOrder.MetodoPago?.nombre || 'efectivo',
    paymentMethodId: backendOrder.metodo_pago_id,
    shippingAddress: backendOrder.Direccion ? 
      `${backendOrder.Direccion.calle} ${backendOrder.Direccion.numero || ''}, ${backendOrder.Direccion.ciudad}` : 
      'Retiro en local',
    addressId: backendOrder.direccion_id,
    subtotal: parseFloat(backendOrder.subtotal || 0),
    taxes: parseFloat(backendOrder.impuestos || 0),
    discount: parseFloat(backendOrder.descuento || 0),
    total: parseFloat(backendOrder.total || 0),
    deliveryType: backendOrder.tipo_entrega || 'local',
    estimatedDelivery: backendOrder.fecha_entrega_estimada,
    actualDelivery: backendOrder.fecha_entrega_real,
    notes: backendOrder.notas,
    items: backendOrder.DetallePedidos?.map(detalle => ({
      id: detalle.producto_id,
      name: detalle.Producto?.nombre || 'Producto',
      quantity: detalle.cantidad,
      price: parseFloat(detalle.precio_unitario),
      subtotal: parseFloat(detalle.subtotal),
      image: detalle.Producto?.imagen_url,
      notes: detalle.notas
    })) || [],
    history: backendOrder.HistorialEstadoPedidos?.map(historial => ({
      id: historial.historial_id,
      statusId: historial.estado_pedido_id,
      statusName: historial.EstadoPedido?.nombre,
      date: historial.fecha_cambio,
      comment: historial.comentario,
      userId: historial.usuario_id
    })) || [],
    createdAt: backendOrder.created_at,
    updatedAt: backendOrder.updated_at
  };
};

// Mapeo de datos del frontend al backend
const mapOrderToBackend = (frontendOrder) => {
  return {
    metodo_pago_id: frontendOrder.paymentMethodId || 1,
    direccion_id: frontendOrder.addressId,
    tipo_entrega: frontendOrder.deliveryType || 'local',
    notas: frontendOrder.notes,
    productos: frontendOrder.items?.map(item => ({
      producto_id: item.id,
      cantidad: item.quantity,
      precio_unitario: item.price,
      notas: item.notes
    })) || []
  };
};

class OrdersService {
  // Obtener todos los pedidos (con filtros opcionales)
  static async getOrders(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.estado_pedido_id) {
        params.append('estado_pedido_id', filters.estado_pedido_id);
      }
      if (filters.fecha_inicio) {
        params.append('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        params.append('fecha_fin', filters.fecha_fin);
      }
      
      const response = await ordersAPI.get(`/pedidos?${params.toString()}`);
      return response.data.map(mapOrderFromBackend);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pedidos');
    }
  }

  // Obtener un pedido por ID
  static async getOrderById(orderId) {
    try {
      const response = await ordersAPI.get(`/pedidos/${orderId}`);
      return mapOrderFromBackend(response.data);
    } catch (error) {
      console.error('Error al obtener pedido:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener pedido');
    }
  }

  // Crear un nuevo pedido
  static async createOrder(orderData) {
    try {
      const backendData = mapOrderToBackend(orderData);
      console.log('📤 Creando pedido:', backendData);
      
      const response = await ordersAPI.post('/pedidos', backendData);
      return mapOrderFromBackend(response.data.pedido);
    } catch (error) {
      console.error('Error al crear pedido:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al crear pedido');
    }
  }

  // Actualizar estado de un pedido
  static async updateOrderStatus(orderId, statusId, comment = '') {
    try {
      const response = await ordersAPI.put(`/pedidos/${orderId}/estado`, {
        estado_pedido_id: statusId,
        comentario: comment
      });
      return mapOrderFromBackend(response.data.pedido);
    } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar estado del pedido');
    }
  }

  // Obtener historial de estados de un pedido
  static async getOrderHistory(orderId) {
    try {
      const response = await ordersAPI.get(`/pedidos/${orderId}/historial`);
      return response.data.map(historial => ({
        id: historial.historial_id,
        statusId: historial.estado_pedido_id,
        statusName: historial.EstadoPedido?.nombre,
        date: historial.fecha_cambio,
        comment: historial.comentario,
        userId: historial.usuario_id
      }));
    } catch (error) {
      console.error('Error al obtener historial del pedido:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener historial del pedido');
    }
  }

  // Obtener estados de pedido disponibles
  static async getOrderStatuses() {
    try {
      const response = await ordersAPI.get('/estados-pedido');
      return response.data.map(estado => ({
        id: estado.estado_pedido_id,
        name: estado.nombre,
        description: estado.descripcion,
        color: estado.color || '#6B7280',
        order: estado.orden || 0,
        active: estado.activo !== false
      }));
    } catch (error) {
      console.error('Error al obtener estados de pedido:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener estados de pedido');
    }
  }

  // Obtener métodos de pago disponibles
  static async getPaymentMethods() {
    try {
      const response = await ordersAPI.get('/metodos-pago');
      return response.data.map(metodo => ({
        id: metodo.metodo_pago_id,
        name: metodo.nombre,
        description: metodo.descripcion,
        active: metodo.activo !== false
      }));
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener métodos de pago');
    }
  }

  // Crear pedido desde carrito (para clientes)
  static async createOrderFromCart(paymentMethodId, addressId = null, notes = '') {
    try {
      const response = await ordersAPI.post('/pedidos', {
        metodo_pago_id: paymentMethodId,
        direccion_id: addressId,
        notas: notes
      });
      return mapOrderFromBackend(response.data.pedido);
    } catch (error) {
      console.error('Error al crear pedido desde carrito:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al crear pedido desde carrito');
    }
  }

  // Crear pedido directo (para vendedores en POS)
  static async createDirectOrder(orderData) {
    try {
      // Validar datos requeridos
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('El carrito está vacío');
      }

      if (!orderData.paymentMethodId) {
        throw new Error('Método de pago requerido');
      }

      // Para pedidos directos, necesitamos crear un "carrito temporal" o manejar diferente
      const backendData = {
        metodo_pago_id: orderData.paymentMethodId,
        direccion_id: orderData.addressId || null,
        mesa_id: orderData.mesaId || null,
        tipo_entrega: orderData.deliveryType || 'local',
        notas: orderData.notes || '',
        productos: orderData.items.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio_unitario: item.price
        }))
      };
      
      console.log('📤 Creando pedido directo:', backendData);
      console.log('🆔 Mesa ID en backendData:', backendData.mesa_id);
      console.log('📝 Tipo entrega en backendData:', backendData.tipo_entrega);
      
      const response = await ordersAPI.post('/pedidos/directo', backendData);
      console.log('✅ OrdersService Response:', response.data);
      console.log('🆔 Mesa ID en respuesta:', response.data.pedido?.mesa_id);
      
      // Validar que la respuesta tenga el pedido
      if (!response.data || !response.data.pedido) {
        throw new Error('Respuesta inválida del servidor: pedido no encontrado');
      }
      
      return mapOrderFromBackend(response.data.pedido);
    } catch (error) {
      console.error('❌ OrdersService Response Error:', error.response?.data);
      console.error('Error al crear pedido directo:', error);
      
      // Mejorar el manejo de errores
      let errorMessage = 'Error al crear pedido directo';
      
      if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      } else if (error.response?.status === 400) {
        errorMessage = 'Datos inválidos para crear el pedido';
      } else if (error.response?.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente';
      } else if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Obtener estadísticas de pedidos (para dashboards)
  static async getOrderStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.fecha_inicio) {
        params.append('fecha_inicio', filters.fecha_inicio);
      }
      if (filters.fecha_fin) {
        params.append('fecha_fin', filters.fecha_fin);
      }
      
      const response = await ordersAPI.get(`/pedidos/estadisticas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      // Si no existe el endpoint, calcular estadísticas del lado del cliente
      const orders = await this.getOrders(filters);
      return this.calculateStats(orders);
    }
  }

  // Calcular estadísticas del lado del cliente
  static calculateStats(orders) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.date);
      return orderDate.getMonth() === currentMonth && 
             orderDate.getFullYear() === currentYear;
    });

    const totalRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalOrders: orders.length,
      monthlyOrders: monthlyOrders.length,
      totalRevenue,
      monthlyRevenue: totalRevenue,
      statusCounts,
      averageOrderValue: orders.length > 0 ? totalRevenue / monthlyOrders.length : 0
    };
  }
}

export default OrdersService; 