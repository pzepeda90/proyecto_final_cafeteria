// tests/env-setup.js
// Configuración de variables de entorno para tests

// Establecer NODE_ENV a test
process.env.NODE_ENV = 'test';

// ✅ USAR TU CONFIGURACIÓN REAL
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'cafeteria_l_bandito';
process.env.DB_USER = 'patriciozepeda';
process.env.DB_PASS = '';

// Variables de entorno para la aplicación
process.env.JWT_SECRET = 'tu_jwt_secret_muy_seguro_aqui_123456789';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = 'http://localhost:5173';

// Variables opcionales
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Logging
console.log('🧪 Test environment setup completed');
console.log(`📊 Using PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
console.log(`👤 DB User: ${process.env.DB_USER}`); 