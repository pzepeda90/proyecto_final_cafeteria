require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./routes/api.swagger');

// Importar configuración de performance
const {
  rateLimits,
  cacheMiddleware,
  compressionMiddleware,
  helmetConfig,
  performanceMiddleware,
  invalidateCache,
  payloadLimitMiddleware,
  healthCheckMiddleware,
  corsConfig,
  gracefulShutdown,
} = require('./config/performance');

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

// Middleware de seguridad y performance (orden importante)
app.use(helmetConfig);
app.use(compressionMiddleware);
app.use(performanceMiddleware);

// Health check endpoint (sin rate limiting)
app.get('/health', healthCheckMiddleware);

// Rate limiting general (solo en producción)
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimits.general);
}

// CORS optimizado
app.use(cors(corsConfig));

// Límite de payload
app.use(payloadLimitMiddleware('10mb'));

// Parseo de JSON optimizado
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verificar que el JSON sea válido antes de parsearlo
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'JSON inválido' });
      return;
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 1000 
}));

// Middleware de logging optimizado para desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} - ${req.method} ${req.url}`);
    next();
  });
}

// Configuración Swagger (con cache)
app.use('/api-docs', 
  cacheMiddleware(3600), // Cache por 1 hora
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec)
);

// Rutas con rate limiting específico y cache estratégico

// Rutas de autenticación (solo rate limiting en producción)
if (process.env.NODE_ENV === 'production') {
  app.use('/api/usuarios/login', rateLimits.auth);
  app.use('/api/usuarios/register', rateLimits.auth);
}

// Rutas de productos (solo cache, sin rate limiting en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/productos', 
    cacheMiddleware(300), // 5 minutos de cache
    productosRoutes
  );
} else {
  app.use('/api/productos', 
    rateLimits.products,
    cacheMiddleware(300), // 5 minutos de cache
    productosRoutes
  );
}

// Rutas de categorías (cache muy largo)
app.use('/api/categorias',
  cacheMiddleware(1800), // 30 minutos de cache
  categoriasRoutes
);

// Rutas de usuarios (sin cache, datos sensibles)
app.use('/api/usuarios', usuariosRoutes);

// Rutas de pedidos (rate limiting solo en producción)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/pedidos',
    invalidateCache(['/api/productos', '/api/carritos']),
    pedidosRoutes
  );
} else {
  app.use('/api/pedidos',
    rateLimits.orders,
    invalidateCache(['/api/productos', '/api/carritos']),
    pedidosRoutes
  );
}

// Rutas de carritos (sin cache, datos dinámicos)
app.use('/api/carritos', carritosRoutes);
app.use('/api/carritos', detallesCarritoRoutes);

// Rutas de vendedores (cache moderado)
app.use('/api/vendedores',
  cacheMiddleware(600), // 10 minutos
  vendedoresRoutes
);

// Rutas de reseñas (sin cache, datos dinámicos en tiempo real)
app.use('/api', resenasRoutes);

// Rutas de configuración (cache largo)
app.use('/api/metodos-pago',
  cacheMiddleware(1800), // 30 minutos
  metodosPagoRoutes
);

app.use('/api/estados-pedido',
  cacheMiddleware(1800), // 30 minutos
  estadosPedidoRoutes
);

app.use('/api/roles',
  cacheMiddleware(3600), // 1 hora
  rolesRoutes
);

// Rutas de direcciones (sin cache, datos personales)
app.use('/api/direcciones', direccionesRoutes);

// Rutas de mesas (cache muy corto para POS en tiempo real)
app.use('/api/mesas',
  cacheMiddleware(5), // 5 segundos para actualizaciones casi en tiempo real
  mesasRoutes
);

// Ruta de prueba con información de performance
app.get('/', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({ 
    mensaje: 'API de Cafetería El Bandito funcionando correctamente',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
    },
    performance: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  });
});

// Endpoint para métricas de performance
app.get('/metrics', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    timestamp: Date.now(),
    uptime: process.uptime(),
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers
    },
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuUsage: process.cpuUsage()
    }
  });
});

// Middleware de manejo de errores optimizado
app.use((error, req, res, next) => {
  // Log del error con más contexto
  const errorContext = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: error.message,
      stack: error.stack,
      status: error.status || error.statusCode || 500
    }
  };
  
  console.error('Error capturado:', JSON.stringify(errorContext, null, 2));
  
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
  
  // Agregar headers de no-cache para errores
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  // Responder con JSON
  res.status(status).json({
    error: true,
    mensaje,
    timestamp: Date.now(),
    // Solo incluir stack trace en desarrollo
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Middleware para manejar 404 optimizado
app.use((req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.url} - IP: ${req.ip}`);
  
  res.status(404).json({ 
    error: true,
    mensaje: 'Ruta no encontrada',
    endpoint: req.originalUrl,
    method: req.method,
    timestamp: Date.now()
  });
});

// Configuración del servidor con optimizaciones
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`📚 Swagger disponible en http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health check en http://localhost:${PORT}/health`);
  console.log(`📊 Métricas en http://localhost:${PORT}/metrics`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

// Configuración de timeouts del servidor
server.timeout = 30000; // 30 segundos
server.keepAliveTimeout = 65000; // 65 segundos
server.headersTimeout = 66000; // 66 segundos

// Manejar cierre graceful del servidor
const shutdown = () => {
  console.log('🔄 Iniciando cierre del servidor...');
  
  server.close((err) => {
    if (err) {
      console.error('❌ Error cerrando servidor:', err);
      process.exit(1);
    }
    
    console.log('✅ Servidor cerrado correctamente');
    gracefulShutdown();
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Manejar promesas rechazadas no capturadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // No terminar el proceso, solo logear
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Terminar el proceso de forma segura
  shutdown();
}); 