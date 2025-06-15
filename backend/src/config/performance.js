const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const { performance } = require('perf_hooks');
const RateLimitRedis = require('rate-limit-redis');
const NodeCache = require('node-cache');

/**
 * Configuración de optimizaciones de performance para el backend
 */

// Configuración de Redis para cache
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 60000,
  commandTimeout: 5000,
};

// Instancia de Redis
let redisClient = null;

// Solo intentar conectar a Redis si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });
    
    redisClient.on('connect', () => {
      console.log('✅ Conectado a Redis para cache');
    });
    
    redisClient.on('error', (err) => {
      console.warn('⚠️ Error de Redis:', err.message);
    });
  } catch (error) {
    console.warn('⚠️ Redis no disponible, cache deshabilitado');
  }
}

/**
 * Rate limiting configurado por endpoint
 */
const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    store: redisClient ? new (require('rate-limit-redis').RedisStore)({
      sendCommand: (...args) => redisClient.call(...args),
    }) : undefined,
  });
};

// Rate limits específicos (configuración menos restrictiva para desarrollo)
const rateLimits = {
  // Rate limit general más permisivo
  general: process.env.NODE_ENV === 'development' 
    ? createRateLimit(15 * 60 * 1000, 1000, 'Demasiadas peticiones desde esta IP')
    : createRateLimit(15 * 60 * 1000, 100, 'Demasiadas peticiones desde esta IP'),
  
  // Rate limit para login más permisivo en desarrollo
  auth: process.env.NODE_ENV === 'development'
    ? createRateLimit(5 * 60 * 1000, 100, 'Demasiados intentos de login, intenta más tarde', true)
    : createRateLimit(15 * 60 * 1000, 5, 'Demasiados intentos de login, intenta más tarde', true),
  
  // Rate limit para API de productos muy permisivo
  products: process.env.NODE_ENV === 'development'
    ? createRateLimit(15 * 60 * 1000, 10000, 'Límite de consultas de productos excedido')
    : createRateLimit(15 * 60 * 1000, 300, 'Límite de consultas de productos excedido'),
  
  // Rate limit para crear pedidos más permisivo
  orders: process.env.NODE_ENV === 'development'
    ? createRateLimit(5 * 60 * 1000, 1000, 'Límite de creación de pedidos excedido')
    : createRateLimit(5 * 60 * 1000, 10, 'Límite de creación de pedidos excedido'),
  
  // Rate limit para uploads más permisivo
  uploads: process.env.NODE_ENV === 'development'
    ? createRateLimit(10 * 60 * 1000, 1000, 'Límite de subida de archivos excedido')
    : createRateLimit(10 * 60 * 1000, 20, 'Límite de subida de archivos excedido'),
};

// Cache en memoria con TTL configurable
const cache = new NodeCache({
  stdTTL: 300, // 5 minutos por defecto
  checkperiod: 60, // Verificar cada minuto
  useClones: false // Mejor performance
});

// Middleware de cache
const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Excluir rutas de reseñas del cache (datos en tiempo real)
    const url = req.originalUrl || req.url;
    if (url.includes('/resenas') || url.includes('/productos/') && url.includes('/resenas')) {
      console.log(`⚡ NO-CACHE: ${url} (reseñas en tiempo real)`);
      return next();
    }

    // Crear clave única basada en URL y query params
    const key = url;
    
    // Intentar obtener del cache
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      console.log(`🚀 Cache HIT: ${key}`);
      return res.json(cachedResponse);
    }

    // Si no está en cache, interceptar la respuesta
    const originalJson = res.json;
    res.json = function(data) {
      // Guardar en cache solo si es exitoso
      if (res.statusCode === 200) {
        cache.set(key, data, ttl);
        console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
      }
      
      // Llamar al método original
      return originalJson.call(this, data);
    };

    next();
  };
};

// Limpiar cache por patrón
const clearCachePattern = (pattern) => {
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(pattern));
  
  matchingKeys.forEach(key => {
    cache.del(key);
  });
  
  console.log(`🗑️ Cache cleared: ${matchingKeys.length} keys matching "${pattern}"`);
  return matchingKeys.length;
};

// Función específica para limpiar cache de reseñas
const clearResenasNodeCache = (productoId = null) => {
  const keys = cache.keys();
  let patterns = ['resenas'];
  
  if (productoId) {
    patterns.push(`productos/${productoId}/resenas`);
  }
  
  let clearedCount = 0;
  patterns.forEach(pattern => {
    const matchingKeys = keys.filter(key => key.includes(pattern));
    matchingKeys.forEach(key => {
      cache.del(key);
      clearedCount++;
    });
  });
  
  console.log(`🗑️ NodeCache reseñas cleared: ${clearedCount} keys`);
  return clearedCount;
};

// Estadísticas del cache
const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize
  };
};

// Limpiar todo el cache
const clearAllCache = () => {
  const keyCount = cache.keys().length;
  cache.flushAll();
  console.log(`🗑️ All cache cleared: ${keyCount} keys`);
  return keyCount;
};

/**
 * Middleware de compresión personalizado
 */
const compressionMiddleware = compression({
  filter: (req, res) => {
    // No comprimir si el cliente no lo soporta
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Comprimir todo excepto imágenes pequeñas
    return compression.filter(req, res);
  },
  level: 6, // Nivel de compresión balanceado
  threshold: 1024, // Solo comprimir si es mayor a 1KB
});

/**
 * Configuración de helmet para seguridad
 */
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * Middleware de performance monitoring
 */
const performanceMiddleware = (req, res, next) => {
  const startTime = performance.now();
  
  // Interceptar el final de la respuesta
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Agregar header de tiempo de respuesta
    res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    // Log para requests lentos (> 1 segundo)
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
    
    // Log para requests muy lentos (> 5 segundos)
    if (duration > 5000) {
      console.error(`🚨 Very slow request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
    }
    
    return originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Middleware para invalidar cache
 */
const invalidateCache = (patterns = []) => {
  return async (req, res, next) => {
    // Interceptar respuestas exitosas
    const originalSend = res.json;
    
    res.json = function(data) {
      // Si la operación fue exitosa, invalidar cache
      if (res.statusCode >= 200 && res.statusCode < 300 && redisClient) {
        patterns.forEach(async (pattern) => {
          try {
            const keys = await redisClient.keys(`cache:*${pattern}*`);
            if (keys.length > 0) {
              await redisClient.del(...keys);
              console.log(`🗑️ Cache invalidated: ${keys.length} keys with pattern "${pattern}"`);
            }
          } catch (error) {
            console.warn('Error invalidating cache:', error);
          }
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Middleware para limitar tamaño de payload
 */
const payloadLimitMiddleware = (limit = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length'));
    
    // Convertir el límite a bytes
    let limitInBytes;
    if (typeof limit === 'string') {
      if (limit.endsWith('mb')) {
        limitInBytes = parseInt(limit) * 1024 * 1024;
      } else if (limit.endsWith('kb')) {
        limitInBytes = parseInt(limit) * 1024;
      } else {
        limitInBytes = parseInt(limit);
      }
    } else {
      limitInBytes = limit;
    }
    
    if (contentLength && contentLength > limitInBytes) {
      return res.status(413).json({
        error: 'Payload demasiado grande',
        maxSize: limit,
      });
    }
    
    next();
  };
};

/**
 * Middleware de health check optimizado
 */
const healthCheckMiddleware = (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    cache: redisClient ? 'connected' : 'disconnected',
  };
  
  res.status(200).json(healthCheck);
};

/**
 * Configuración de CORS optimizada
 */
const corsConfig = {
  origin: (origin, callback) => {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5174',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      // URLs específicas para producción
      'https://cafeteria-lbandito.netlify.app',
      'https://proyecto-final-cafeteria-frontend.netlify.app'
    ].filter(Boolean);
    
    // Permitir requests sin origin (apps móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 horas
};

/**
 * Función para cerrar conexiones gracefully
 */
const gracefulShutdown = () => {
  console.log('🔄 Iniciando cierre graceful...');
  
  if (redisClient) {
    redisClient.disconnect();
    console.log('✅ Redis desconectado');
  }
  
  process.exit(0);
};

// Manejar señales de cierre
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const setupPerformance = (app) => {
  // Compresión de respuestas
  app.use(compression());

  // Rate limiting básico
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'test' ? Number.MAX_SAFE_INTEGER : 100 // Valor muy alto para tests en lugar de 0
  });

  app.use(limiter);

  // Headers de seguridad básicos
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  return app;
};

module.exports = {
  rateLimits,
  cache,
  cacheMiddleware,
  clearCachePattern,
  clearResenasNodeCache,
  getCacheStats,
  clearAllCache,
  compressionMiddleware,
  helmetConfig,
  performanceMiddleware,
  invalidateCache,
  payloadLimitMiddleware,
  healthCheckMiddleware,
  corsConfig,
  redisClient,
  gracefulShutdown,
  setupPerformance,
}; 