const Redis = require('ioredis');

let redisClient = null;

// Solo intentar conectar a Redis si está configurado
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  try {
    const redisConfig = process.env.REDIS_URL ? {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: null,
      // Desactivar reconexión automática para evitar spam de errores
      connectTimeout: 1000,
      commandTimeout: 1000
    } : {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      retryStrategy: () => null, // No reintentar conexión
      maxRetriesPerRequest: 1,
      connectTimeout: 1000,
      commandTimeout: 1000,
      lazyConnect: true
    };

    redisClient = new Redis(process.env.REDIS_URL || redisConfig);
    
    redisClient.on('connect', () => {
      console.log('✅ Redis conectado para caché');
    });
    
    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis no disponible:', err.message);
      redisClient = null; // Desactivar Redis si hay error
    });
    
    redisClient.on('close', () => {
      console.warn('⚠️ Conexión Redis cerrada, caché deshabilitado');
      redisClient = null;
    });
    
  } catch (error) {
    console.warn('⚠️ Error configurando Redis:', error.message);
    redisClient = null;
  }
} else {
  console.log('ℹ️ Redis no configurado, caché deshabilitado');
}

module.exports = redisClient; 