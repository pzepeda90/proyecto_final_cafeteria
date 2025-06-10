const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');

// Limiter general para todas las rutas
const generalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: {
    status: 'error',
    message: 'Demasiadas peticiones, por favor intente más tarde'
  }
});

// Limiter específico para autenticación
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // límite de 5 intentos por hora
  message: {
    status: 'error',
    message: 'Demasiados intentos de inicio de sesión, por favor intente más tarde'
  }
});

// Limiter para creación de usuarios
const registerLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:register:'
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 3, // límite de 3 registros por día por IP
  message: {
    status: 'error',
    message: 'Demasiados registros desde esta IP, por favor intente más tarde'
  }
});

// Limiter para API pública
const publicApiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:public:'
  }),
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // límite de 30 peticiones por minuto
  message: {
    status: 'error',
    message: 'Demasiadas peticiones a la API pública, por favor intente más tarde'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  registerLimiter,
  publicApiLimiter
}; 