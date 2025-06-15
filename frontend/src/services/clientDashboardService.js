import axios from 'axios';
import { API_URL } from '../config/api';

// Configuración base de axios para dashboard del cliente
const clientAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
clientAPI.interceptors.request.use(
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

class ClientDashboardService {
  // Obtener estadísticas del cliente
  static async getClientStats(userId) {
    try {
      const [pedidos, productos] = await Promise.all([
        clientAPI.get('/pedidos'),
        clientAPI.get('/productos')
      ]);

      // Filtrar pedidos del cliente actual
      const userOrders = pedidos.data.filter(pedido => pedido.usuario_id === userId);
      
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Pedidos del mes actual
      const pedidosMes = userOrders.filter(pedido => 
        new Date(pedido.fecha_pedido) >= startOfMonth
      );

      // Pedidos del año actual
      const pedidosAno = userOrders.filter(pedido => 
        new Date(pedido.fecha_pedido) >= startOfYear
      );

      // Calcular estadísticas
      const totalGastadoMes = pedidosMes.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
      const totalGastadoAno = pedidosAno.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0);
      const pedidosRealizadosMes = pedidosMes.length;
      const pedidosRealizadosAno = pedidosAno.length;
      const ticketPromedio = userOrders.length > 0 ? 
        userOrders.reduce((sum, pedido) => sum + parseFloat(pedido.total || 0), 0) / userOrders.length : 0;

      // Último pedido
      const ultimoPedido = userOrders.length > 0 ? 
        userOrders.sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))[0] : null;

      return {
        totalGastadoMes,
        totalGastadoAno,
        pedidosRealizadosMes,
        pedidosRealizadosAno,
        ticketPromedio,
        totalPedidos: userOrders.length,
        ultimoPedido,
        ahorroEstimado: totalGastadoAno * 0.15 // Estimado de ahorro con promociones
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del cliente:', error);
      throw new Error('Error al obtener estadísticas del cliente');
    }
  }

  // Obtener pedidos del cliente
  static async getClientOrders(userId) {
    try {
      const response = await clientAPI.get('/pedidos');
      const allOrders = response.data;
      
      // Filtrar pedidos del cliente y ordenar por fecha descendente
      const userOrders = allOrders
        .filter(pedido => pedido.usuario_id === userId)
        .sort((a, b) => new Date(b.fecha_pedido) - new Date(a.fecha_pedido))
        .map(pedido => ({
          id: pedido.pedido_id,
          fecha: pedido.fecha_pedido,
          total: pedido.total,
          estado: pedido.estado_pedido || 'Pendiente',
          items: pedido.items || [], // Si hay detalles de items
          metodoPago: pedido.metodo_pago
        }));

      return userOrders;
    } catch (error) {
      console.error('Error al obtener pedidos del cliente:', error);
      return [];
    }
  }

  // Obtener productos favoritos basados en frecuencia de pedidos
  static async getFavoriteProducts(userId) {
    try {
      const orders = await this.getClientOrders(userId);
      const productCount = {};

      // Contar frecuencia de productos (simulado por ahora)
      orders.forEach(order => {
        // En un sistema real, esto vendría de los detalles del pedido
        // Por ahora simulamos productos populares
        const simulatedItems = [
          { nombre: 'Café Americano', cantidad: Math.floor(Math.random() * 3) + 1 },
          { nombre: 'Cappuccino', cantidad: Math.floor(Math.random() * 2) + 1 },
          { nombre: 'Croissant', cantidad: Math.floor(Math.random() * 2) + 1 }
        ];

        simulatedItems.forEach(item => {
          if (Math.random() > 0.3) { // 70% probabilidad de que aparezca
            productCount[item.nombre] = (productCount[item.nombre] || 0) + item.cantidad;
          }
        });
      });

      return Object.entries(productCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([nombre, veces]) => ({ nombre, veces }));
    } catch (error) {
      console.error('Error al obtener productos favoritos:', error);
      return [];
    }
  }

  // Obtener promociones personalizadas
  static async getPersonalizedPromotions(userId) {
    try {
      const [favorites, stats] = await Promise.all([
        this.getFavoriteProducts(userId),
        this.getClientStats(userId)
      ]);

      const promotions = [
        {
          id: 1,
          titulo: `15% de descuento en ${favorites[0]?.nombre || 'tu próxima compra'}`,
          descripcion: 'Válido hasta fin de mes',
          codigo: 'CLIENTE15',
          descuento: 15,
          tipo: 'porcentaje',
          activa: true
        },
        {
          id: 2,
          titulo: '2x1 en productos seleccionados',
          descripcion: 'Aplica de lunes a viernes',
          codigo: '2X1CAFE',
          descuento: 50,
          tipo: 'porcentaje',
          activa: true
        },
        {
          id: 3,
          titulo: 'Envío gratis',
          descripcion: 'En compras superiores a $15.000',
          codigo: 'ENVIOGRATIS',
          descuento: 0,
          tipo: 'envio',
          activa: stats.ticketPromedio > 10000
        }
      ];

      // Promoción especial para clientes frecuentes
      if (stats.pedidosRealizadosAno >= 10) {
        promotions.unshift({
          id: 4,
          titulo: '20% de descuento - Cliente VIP',
          descripcion: 'Exclusivo para clientes frecuentes',
          codigo: 'VIP20',
          descuento: 20,
          tipo: 'porcentaje',
          activa: true
        });
      }

      return promotions.filter(promo => promo.activa);
    } catch (error) {
      console.error('Error al obtener promociones:', error);
      return [];
    }
  }

  // Obtener gráfico de gastos mensuales del cliente
  static async getMonthlySpending(userId) {
    try {
      const orders = await this.getClientOrders(userId);
      const currentYear = new Date().getFullYear();
      
      const meses = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ];

      const gastosPorMes = meses.map((mes, index) => ({
        mes,
        gasto: 0,
        pedidos: 0
      }));

      // Agrupar gastos por mes
      orders.forEach(order => {
        const fechaPedido = new Date(order.fecha);
        if (fechaPedido.getFullYear() === currentYear) {
          const mesIndex = fechaPedido.getMonth();
          gastosPorMes[mesIndex].gasto += order.total || 0;
          gastosPorMes[mesIndex].pedidos += 1;
        }
      });

      return gastosPorMes;
    } catch (error) {
      console.error('Error al obtener gastos mensuales:', error);
      return [];
    }
  }

  // Obtener recomendaciones de productos
  static async getProductRecommendations(userId) {
    try {
      const [productos, favorites] = await Promise.all([
        clientAPI.get('/productos'),
        this.getFavoriteProducts(userId)
      ]);

      // Filtrar productos disponibles y excluir favoritos
      const favoriteNames = favorites.map(fav => fav.nombre.toLowerCase());
      const recommendations = productos.data
        .filter(producto => 
          producto.disponible && 
          !favoriteNames.includes(producto.nombre.toLowerCase())
        )
        .sort(() => Math.random() - 0.5) // Orden aleatorio
        .slice(0, 4)
        .map(producto => ({
          id: producto.producto_id,
          nombre: producto.nombre,
          precio: producto.precio,
          descripcion: producto.descripcion,
          imagen: producto.imagen_url,
          categoria: producto.categoria
        }));

      return recommendations;
    } catch (error) {
      console.error('Error al obtener recomendaciones:', error);
      return [];
    }
  }
}

export default ClientDashboardService; 