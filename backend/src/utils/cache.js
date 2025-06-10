const redis = require('../config/redis');
const { logger } = require('./logger');

// Tiempo de expiración por defecto (5 minutos)
const DEFAULT_EXPIRATION = 300;

// Función para obtener datos del caché
const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error(`Error al obtener caché para key ${key}: ${error.message}`);
    return null;
  }
};

// Función para guardar datos en el caché
const setCache = async (key, data, expiration = DEFAULT_EXPIRATION) => {
  try {
    await redis.setex(key, expiration, JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error(`Error al guardar caché para key ${key}: ${error.message}`);
    return false;
  }
};

// Función para eliminar datos del caché
const deleteCache = async (key) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    logger.error(`Error al eliminar caché para key ${key}: ${error.message}`);
    return false;
  }
};

// Middleware para caché de rutas
const cacheMiddleware = (duration = DEFAULT_EXPIRATION) => {
  return async (req, res, next) => {
    // Solo cachear peticiones GET
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await getCache(key);
      
      if (cachedResponse) {
        return res.json(cachedResponse);
      }
      
      // Guardar la función original de res.json
      const originalJson = res.json;
      
      // Sobrescribir res.json para cachear la respuesta
      res.json = function (body) {
        setCache(key, body, duration);
        return originalJson.call(this, body);
      };
      
      next();
    } catch (error) {
      logger.error(`Error en cacheMiddleware: ${error.message}`);
      next();
    }
  };
};

// Función para invalidar caché por patrón
const invalidateCacheByPattern = async (pattern) => {
  try {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
    return true;
  } catch (error) {
    logger.error(`Error al invalidar caché por patrón ${pattern}: ${error.message}`);
    return false;
  }
};

// Funciones específicas para entidades comunes
const cacheKeys = {
  products: 'products',
  categories: 'categories',
  user: (userId) => `user:${userId}`,
  cart: (userId) => `cart:${userId}`,
  orders: (userId) => `orders:${userId}`,
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  cacheMiddleware,
  invalidateCacheByPattern,
  cacheKeys,
  DEFAULT_EXPIRATION
}; 