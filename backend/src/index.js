require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./routes/api.swagger');

// Importar rutas
const productosRoutes = require('./routes/productos.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const carritosRoutes = require('./routes/carritos.routes');
const detallesCarritoRoutes = require('./routes/detalles_carrito.routes');
const vendedoresRoutes = require('./routes/vendedores.routes');
const resenasRoutes = require('./routes/resenas.routes');
const metodosPagoRoutes = require('./routes/metodos_pago.routes');
const estadosPedidoRoutes = require('./routes/estados_pedido.routes');
const rolesRoutes = require('./routes/roles.routes');
const direccionesRoutes = require('./routes/direcciones.routes');
const mesasRoutes = require('./routes/mesas.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de logging para diagnóstico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Configuración Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/carritos', carritosRoutes);
app.use('/api/carritos', detallesCarritoRoutes);
app.use('/api/vendedores', vendedoresRoutes);
app.use('/api', resenasRoutes); // Las rutas de reseñas incluyen /productos/:id/resenas y /resenas/:id
app.use('/api/metodos-pago', metodosPagoRoutes);
app.use('/api/estados-pedido', estadosPedidoRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/direcciones', direccionesRoutes);
app.use('/api/mesas', mesasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Cafetería El Bandito funcionando correctamente' });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error capturado por middleware:', error);
  
  // Si ya se envió una respuesta, delegar al manejador de errores por defecto
  if (res.headersSent) {
    return next(error);
  }
  
  // Determinar el código de estado
  const status = error.status || error.statusCode || 500;
  
  // Determinar el mensaje de error
  let mensaje = 'Error interno del servidor';
  
  if (error.message) {
    mensaje = error.message;
  } else if (error.code === 'VALIDACION') {
    mensaje = 'Error de validación';
  }
  
  // Responder con JSON
  res.status(status).json({
    mensaje,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Middleware para manejar 404
app.use((req, res) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  console.log(`Accede a Swagger en http://localhost:${PORT}/api-docs`);
}); 