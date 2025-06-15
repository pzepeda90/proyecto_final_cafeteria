import axios from 'axios';

// Configuración base de axios para dashboard
const dashboardAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
dashboardAPI.interceptors.request.use(
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

class DashboardService {
  // Obtener estadísticas generales
  static async getStats() {
    try {
      const [statsResponse, productos, pedidos] = await Promise.all([
        dashboardAPI.get('/pedidos/stats'),
        dashboardAPI.get('/productos'),
        dashboardAPI.get('/pedidos')
      ]);

      const stats = statsResponse.data;
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Filtrar pedidos del día actual
      const pedidosHoy = pedidos.data.filter(pedido => 
        new Date(pedido.fecha_pedido) >= startOfDay
      );

      // Calcular estadísticas del día
      const ventasHoy = pedidosHoy.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
      const clientesHoy = new Set(pedidosHoy.map(p => p.usuario_id)).size;
      const ticketPromedio = pedidosHoy.length > 0 ? ventasHoy / pedidosHoy.length : 0;

      // Productos con stock bajo (menos de 10 unidades)
      const productosStockBajo = productos.data.filter(p => p.stock < 10).length;

      // Usar estadísticas del backend y complementar con cálculos del día
      return {
        ventasHoy,
        ventasMes: stats.total_ventas || 0,
        ticketPromedio: stats.promedio_venta || ticketPromedio,
        clientesHoy,
        clientesMes: 0, // Calculado del lado del servidor en futuras versiones
        cmv: stats.total_ventas * 0.4,
        margenBruto: stats.total_ventas > 0 ? ((stats.total_ventas - (stats.total_ventas * 0.4)) / stats.total_ventas) * 100 : 0,
        gastosOperativos: stats.total_ventas * 0.25,
        rotacionInventario: 0.5, // Mock por ahora
        satisfaccionCliente: 4.6, // Mock por ahora
        merma: 2.5, // Mock por ahora
        productividadPersonal: clientesHoy > 0 ? clientesHoy / 3 : 0, // Asumiendo 3 empleados
        totalProductos: productos.data.length,
        productosStockBajo,
        totalPedidos: stats.total_pedidos || 0,
        pedidosHoy: pedidosHoy.length,
        pedidosMes: stats.total_pedidos || 0
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      // Fallback a método anterior si el endpoint de stats falla
      try {
        const [pedidos, productos] = await Promise.all([
          dashboardAPI.get('/pedidos'),
          dashboardAPI.get('/productos')
        ]);

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        const pedidosHoy = pedidos.data.filter(pedido => 
          new Date(pedido.fecha_pedido) >= startOfDay
        );
        
        const pedidosMes = pedidos.data.filter(pedido => 
          new Date(pedido.fecha_pedido) >= startOfMonth
        );

        const ventasHoy = pedidosHoy.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
        const ventasMes = pedidosMes.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
        const clientesHoy = new Set(pedidosHoy.map(p => p.usuario_id)).size;
        const clientesMes = new Set(pedidosMes.map(p => p.usuario_id)).size;
        const ticketPromedio = pedidosHoy.length > 0 ? ventasHoy / pedidosHoy.length : 0;

        const productosStockBajo = productos.data.filter(p => p.stock < 10).length;

        return {
          ventasHoy,
          ventasMes,
          ticketPromedio,
          clientesHoy,
          clientesMes,
          cmv: ventasMes * 0.4,
          margenBruto: ventasMes > 0 ? ((ventasMes - (ventasMes * 0.4)) / ventasMes) * 100 : 0,
          gastosOperativos: ventasMes * 0.25,
          rotacionInventario: 0.5,
          satisfaccionCliente: 4.6,
          merma: 2.5,
          productividadPersonal: clientesHoy > 0 ? clientesHoy / 3 : 0,
          totalProductos: productos.data.length,
          productosStockBajo,
          totalPedidos: pedidos.data.length,
          pedidosHoy: pedidosHoy.length,
          pedidosMes: pedidosMes.length
        };
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        throw new Error('Error al obtener estadísticas del dashboard');
      }
    }
  }

  // Obtener datos para gráfico de ventas diarias (últimos 30 días)
  static async getVentasDiarias() {
    try {
      const response = await dashboardAPI.get('/pedidos');
      const pedidos = response.data;

      const today = new Date();
      const last30Days = [];
      
      // Generar últimos 30 días
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        last30Days.push({
          fecha: date.toISOString().split('T')[0],
          dia: `${date.getDate()}/${date.getMonth() + 1}`,
          ventas: 0
        });
      }

      // Agrupar pedidos por día
      pedidos.forEach(pedido => {
        const fechaPedido = new Date(pedido.fecha_pedido).toISOString().split('T')[0];
        const dayData = last30Days.find(day => day.fecha === fechaPedido);
        if (dayData) {
          dayData.ventas += parseFloat(pedido.total || 0);
        }
      });

      return last30Days.map(day => ({
        dia: day.dia,
        ventas: Math.round(day.ventas)
      }));
    } catch (error) {
      console.error('Error al obtener ventas diarias:', error);
      return [];
    }
  }

  // Obtener datos para gráfico de ventas mensuales
  static async getVentasMensuales() {
    try {
      const response = await dashboardAPI.get('/pedidos');
      const pedidos = response.data;

      const currentYear = new Date().getFullYear();
      const meses = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];

      const ventasPorMes = meses.map((mes, index) => ({
        mes,
        ventas: 0
      }));

      // Agrupar pedidos por mes
      pedidos.forEach(pedido => {
        const fechaPedido = new Date(pedido.fecha_pedido);
        if (fechaPedido.getFullYear() === currentYear) {
          const mesIndex = fechaPedido.getMonth();
          ventasPorMes[mesIndex].ventas += parseFloat(pedido.total || 0);
        }
      });

      return ventasPorMes.map(item => ({
        ...item,
        ventas: Math.round(item.ventas)
      }));
    } catch (error) {
      console.error('Error al obtener ventas mensuales:', error);
      return [];
    }
  }

  // Obtener productos más vendidos
  static async getProductosMasVendidos() {
    try {
      const response = await dashboardAPI.get('/pedidos');
      const pedidos = response.data;

      const productosVendidos = {};

      // Contar productos vendidos
      pedidos.forEach(pedido => {
        if (pedido.DetallePedidos) {
          pedido.DetallePedidos.forEach(detalle => {
            const productoNombre = detalle.Producto?.nombre || `Producto ${detalle.producto_id}`;
            if (productosVendidos[productoNombre]) {
              productosVendidos[productoNombre] += detalle.cantidad;
            } else {
              productosVendidos[productoNombre] = detalle.cantidad;
            }
          });
        }
      });

      // Convertir a array y ordenar
      const productosArray = Object.entries(productosVendidos)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6); // Top 6 productos

      return productosArray.length > 0 ? productosArray : [
        { name: 'Sin datos', value: 0 }
      ];
    } catch (error) {
      console.error('Error al obtener productos más vendidos:', error);
      return [];
    }
  }

  // Obtener datos de productividad del personal (mock mejorado)
  static async getProductividadPersonal() {
    try {
      const response = await dashboardAPI.get('/pedidos');
      const pedidos = response.data;

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const pedidosHoy = pedidos.filter(pedido => 
        new Date(pedido.fecha_pedido) >= startOfDay
      );

      // Simular empleados (en un sistema real, esto vendría de la base de datos)
      const empleados = ['Ana García', 'Luis Martínez', 'Pedro Silva', 'Sofía López'];
      const totalPedidos = pedidosHoy.length;
      const totalVentas = pedidosHoy.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);

      return empleados.map((empleado, index) => {
        // Distribuir pedidos y ventas de manera realista
        const factor = 0.8 + (Math.random() * 0.4); // Factor entre 0.8 y 1.2
        const clientesBase = Math.floor(totalPedidos / empleados.length);
        const ventasBase = Math.floor(totalVentas / empleados.length);
        
        return {
          empleado: empleado.split(' ')[0], // Solo el nombre
          clientes: Math.max(0, Math.floor(clientesBase * factor)),
          ventas: Math.max(0, Math.floor(ventasBase * factor))
        };
      });
    } catch (error) {
      console.error('Error al obtener productividad del personal:', error);
      return [
        { empleado: 'Ana', clientes: 0, ventas: 0 },
        { empleado: 'Luis', clientes: 0, ventas: 0 },
        { empleado: 'Pedro', clientes: 0, ventas: 0 },
        { empleado: 'Sofía', clientes: 0, ventas: 0 }
      ];
    }
  }

  // Obtener datos de rotación de inventario
  static async getRotacionInventario() {
    try {
      const [pedidosResponse, productosResponse] = await Promise.all([
        dashboardAPI.get('/pedidos'),
        dashboardAPI.get('/productos')
      ]);

      const pedidos = pedidosResponse.data;
      const productos = productosResponse.data;

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
      const currentYear = new Date().getFullYear();
      
      return meses.map((mes, index) => {
        // Calcular rotación basada en ventas del mes vs inventario promedio
        const mesIndex = index;
        const ventasMes = pedidos.filter(pedido => {
          const fechaPedido = new Date(pedido.fecha_pedido);
          return fechaPedido.getFullYear() === currentYear && fechaPedido.getMonth() === mesIndex;
        }).reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);

        const inventarioPromedio = productos.reduce((sum, producto) => 
          sum + (producto.precio * producto.stock), 0
        );

        const rotacion = inventarioPromedio > 0 ? (ventasMes * 0.4) / inventarioPromedio : 0;

        return {
          mes,
          rotacion: Math.max(0.1, Math.min(5.0, rotacion)) // Entre 0.1 y 5.0
        };
      });
    } catch (error) {
      console.error('Error al obtener rotación de inventario:', error);
      return [];
    }
  }
}

export default DashboardService; 