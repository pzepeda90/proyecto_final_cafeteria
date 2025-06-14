import axios from 'axios';

// Configuración base de axios para dashboard del vendedor
const sellerAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
sellerAPI.interceptors.request.use(
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

class SellerDashboardService {
  // Obtener estadísticas del vendedor
  static async getSellerStats(sellerId) {
    try {
      const [pedidos, productos] = await Promise.all([
        sellerAPI.get('/pedidos'),
        sellerAPI.get('/productos')
      ]);

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      // Filtrar pedidos por períodos
      const pedidosHoy = pedidos.data.filter(pedido => 
        new Date(pedido.fecha_pedido) >= startOfDay
      );
      
      const pedidosSemana = pedidos.data.filter(pedido => 
        new Date(pedido.fecha_pedido) >= startOfWeek
      );

      const pedidosMes = pedidos.data.filter(pedido => 
        new Date(pedido.fecha_pedido) >= startOfMonth
      );

      // Calcular estadísticas
      const ventasHoy = pedidosHoy.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
      const ventasSemana = pedidosSemana.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
      const ventasMes = pedidosMes.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
      
      const clientesHoy = new Set(pedidosHoy.map(p => p.usuario_id)).size;
      const clientesSemana = new Set(pedidosSemana.map(p => p.usuario_id)).size;
      const clientesMes = new Set(pedidosMes.map(p => p.usuario_id)).size;

      const ticketPromedio = pedidosMes.length > 0 ? ventasMes / pedidosMes.length : 0;

      // Productos con stock bajo (menos de 10 unidades)
      const productosStockBajo = productos.data.filter(p => p.stock < 10).length;
      const productosAgotados = productos.data.filter(p => p.stock === 0).length;

      // Calcular eficiencia de ventas (pedidos/día promedio del mes)
      const diasDelMes = today.getDate();
      const eficienciaVentas = diasDelMes > 0 ? pedidosMes.length / diasDelMes : 0;

      return {
        ventasHoy,
        ventasSemana,
        ventasMes,
        clientesHoy,
        clientesSemana,
        clientesMes,
        ticketPromedio,
        pedidosHoy: pedidosHoy.length,
        pedidosSemana: pedidosSemana.length,
        pedidosMes: pedidosMes.length,
        totalProductos: productos.data.length,
        productosStockBajo,
        productosAgotados,
        eficienciaVentas,
        metaVentasMes: 500000, // Meta mensual (configurable)
        progresoMeta: ventasMes > 0 ? (ventasMes / 500000) * 100 : 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del vendedor:', error);
      throw new Error('Error al obtener estadísticas del vendedor');
    }
  }

  // Obtener pedidos recientes del vendedor
  static async getRecentOrders(limit = 10) {
    try {
      const response = await sellerAPI.get('/pedidos');
      const allOrders = response.data;
      
      // Ordenar por fecha descendente y tomar los más recientes
      const recentOrders = allOrders
        .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
        .slice(0, limit)
        .map(pedido => ({
          id: pedido.pedido_id,
          fecha: pedido.fecha_pedido,
          total: pedido.total,
          estado: pedido.estado_pedido || 'Pendiente',
          cliente: pedido.usuario_id, // En un sistema real, esto sería el nombre del cliente
          metodoPago: pedido.metodo_pago,
          items: pedido.items || []
        }));

      return recentOrders;
    } catch (error) {
      console.error('Error al obtener pedidos recientes:', error);
      return [];
    }
  }

  // Obtener productos más vendidos
  static async getTopProducts(limit = 5) {
    try {
      const [pedidos, productos] = await Promise.all([
        sellerAPI.get('/pedidos'),
        sellerAPI.get('/productos')
      ]);

      // Simular conteo de productos vendidos (en un sistema real esto vendría de detalles de pedidos)
      const productSales = {};
      
      // Crear datos simulados basados en productos existentes
      productos.data.forEach(producto => {
        // Simular ventas basadas en popularidad (productos con menor ID = más populares)
        const baseVentas = Math.max(1, 50 - producto.producto_id * 2);
        const variacion = Math.floor(Math.random() * 20) - 10; // ±10
        productSales[producto.producto_id] = Math.max(0, baseVentas + variacion);
      });

      const topProducts = Object.entries(productSales)
        .map(([id, cantidad]) => {
          const producto = productos.data.find(p => p.producto_id === parseInt(id));
          return producto ? {
            id: producto.producto_id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen_url,
            categoria: producto.categoria,
            stock: producto.stock,
            cantidadVendida: cantidad,
            ingresoGenerado: cantidad * producto.precio
          } : null;
        })
        .filter(item => item !== null)
        .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
        .slice(0, limit);

      return topProducts;
    } catch (error) {
      console.error('Error al obtener productos más vendidos:', error);
      return [];
    }
  }

  // Obtener productos con stock bajo
  static async getLowStockProducts() {
    try {
      const response = await sellerAPI.get('/productos');
      const productos = response.data;

      const lowStockProducts = productos
        .filter(producto => producto.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .map(producto => ({
          id: producto.producto_id,
          nombre: producto.nombre,
          precio: producto.precio,
          stock: producto.stock,
          categoria: producto.categoria,
          imagen: producto.imagen_url,
          estado: producto.stock === 0 ? 'Agotado' : 'Stock Bajo'
        }));

      return lowStockProducts;
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      return [];
    }
  }

  // Obtener datos para gráfico de ventas diarias (últimos 7 días)
  static async getDailySales() {
    try {
      const response = await sellerAPI.get('/pedidos');
      const pedidos = response.data;

      const today = new Date();
      const last7Days = [];
      
      // Generar últimos 7 días
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last7Days.push({
          fecha: date.toISOString().split('T')[0],
          dia: date.toLocaleDateString('es-CL', { weekday: 'short' }),
          ventas: 0,
          pedidos: 0
        });
      }

      // Agrupar pedidos por día
      pedidos.forEach(pedido => {
        const fechaPedido = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
        const dayData = last7Days.find(day => day.fecha === fechaPedido);
        if (dayData) {
          dayData.ventas += parseFloat(pedido.total || 0);
          dayData.pedidos += 1;
        }
      });

      return last7Days.map(day => ({
        dia: day.dia,
        ventas: Math.round(day.ventas),
        pedidos: day.pedidos
      }));
    } catch (error) {
      console.error('Error al obtener ventas diarias:', error);
      return [];
    }
  }

  // Obtener alertas y notificaciones para el vendedor
  static async getSellerAlerts() {
    try {
      const [productos, pedidos] = await Promise.all([
        sellerAPI.get('/productos'),
        sellerAPI.get('/pedidos')
      ]);

      const alerts = [];

      // Alertas de stock bajo
      const lowStock = productos.data.filter(p => p.stock < 5 && p.stock > 0);
      const outOfStock = productos.data.filter(p => p.stock === 0);

      if (outOfStock.length > 0) {
        alerts.push({
          tipo: 'error',
          titulo: 'Productos Agotados',
          mensaje: `${outOfStock.length} producto(s) sin stock`,
          accion: 'Ver Productos',
          icono: '🚨'
        });
      }

      if (lowStock.length > 0) {
        alerts.push({
          tipo: 'warning',
          titulo: 'Stock Bajo',
          mensaje: `${lowStock.length} producto(s) con poco stock`,
          accion: 'Revisar Stock',
          icono: '⚠️'
        });
      }

      // Alertas de pedidos pendientes
      const pedidosPendientes = pedidos.data.filter(p => 
        p.estado_pedido === 'Pendiente' || p.estado_pedido === 'En Proceso'
      );

      if (pedidosPendientes.length > 5) {
        alerts.push({
          tipo: 'info',
          titulo: 'Pedidos Pendientes',
          mensaje: `${pedidosPendientes.length} pedidos requieren atención`,
          accion: 'Ver Pedidos',
          icono: '📋'
        });
      }

      // Alerta de meta de ventas
      const stats = await this.getSellerStats();
      if (stats.progresoMeta >= 90) {
        alerts.push({
          tipo: 'success',
          titulo: '¡Meta Casi Alcanzada!',
          mensaje: `${stats.progresoMeta.toFixed(1)}% de la meta mensual`,
          accion: 'Ver Estadísticas',
          icono: '🎯'
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error al obtener alertas:', error);
      return [];
    }
  }

  // Obtener resumen de actividad del vendedor
  static async getActivitySummary() {
    try {
      const [stats, topProducts, recentOrders] = await Promise.all([
        this.getSellerStats(),
        this.getTopProducts(3),
        this.getRecentOrders(5)
      ]);

      return {
        stats,
        topProducts,
        recentOrders,
        resumen: {
          productosGestionados: stats.totalProductos,
          ventasRealizadas: stats.pedidosMes,
          clientesAtendidos: stats.clientesMes,
          ingresoGenerado: stats.ventasMes
        }
      };
    } catch (error) {
      console.error('Error al obtener resumen de actividad:', error);
      return null;
    }
  }
}

export default SellerDashboardService; 