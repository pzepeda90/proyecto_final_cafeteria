const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { setupPerformance } = require('./config/performance');

// Importar rutas
const productosRoutes = require('./routes/productos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const carritosRoutes = require('./routes/carritos.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const vendedoresRoutes = require('./routes/vendedores.routes');
const resenasRoutes = require('./routes/resenas.routes');
const metodosPagoRoutes = require('./routes/metodos_pago.routes');
const estadosPedidoRoutes = require('./routes/estados_pedido.routes');
const rolesRoutes = require('./routes/roles.routes');
const direccionesRoutes = require('./routes/direcciones.routes');
const mesasRoutes = require('./routes/mesas.routes');
const detallesCarritoRoutes = require('./routes/detalles_carrito.routes');

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(compression());

// Solo configurar performance si no estamos en tests
if (process.env.NODE_ENV !== 'test') {
  setupPerformance(app);
}

// Configurar rutas
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/carritos', carritosRoutes);
app.use('/api/carritos', detallesCarritoRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api', resenasRoutes);
app.use('/api/metodos-pago', metodosPagoRoutes);
app.use('/api/estados-pedido', estadosPedidoRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/direcciones', direccionesRoutes);
app.use('/api/mesas', mesasRoutes);

// Endpoint básico de estado
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'API de Cafetería El Bandito funcionando correctamente',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  const status = error.status || error.statusCode || 500;
  const mensaje = error.message || 'Error interno del servidor';
  
  res.status(status).json({
    error: true,
    mensaje,
    timestamp: Date.now(),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Middleware para manejar 404
app.use((req, res) => {
  res.status(404).json({ 
    error: true,
    mensaje: 'Ruta no encontrada',
    endpoint: req.originalUrl,
    method: req.method,
    timestamp: Date.now()
  });
});

module.exports = app; 