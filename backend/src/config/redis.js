const Redis = require('ioredis');
const { logger } = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
  logger.info('Conexión a Redis establecida');
});

redis.on('error', (error) => {
  logger.error(`Error en la conexión a Redis: ${error.message}`);
});

redis.on('ready', () => {
  logger.info('Redis está listo para recibir comandos');
});

redis.on('reconnecting', () => {
  logger.warn('Reconectando a Redis...');
});

// Función para limpiar todas las claves de caché
const clearAllCache = async () => {
  try {
    const keys = await redis.keys('cache:*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
    logger.info('Caché limpiado exitosamente');
    return true;
  } catch (error) {
    logger.error(`Error al limpiar caché: ${error.message}`);
    return false;
  }
};

// Función para obtener estadísticas de Redis
const getRedisStats = async () => {
  try {
    const info = await redis.info();
    const stats = {
      connected_clients: info.match(/connected_clients:(\d+)/)?.[1],
      used_memory: info.match(/used_memory:(\d+)/)?.[1],
      total_connections_received: info.match(/total_connections_received:(\d+)/)?.[1],
      total_commands_processed: info.match(/total_commands_processed:(\d+)/)?.[1],
    };
    return stats;
  } catch (error) {
    logger.error(`Error al obtener estadísticas de Redis: ${error.message}`);
    return null;
  }
};

module.exports = {
  redis,
  clearAllCache,
  getRedisStats
}; 