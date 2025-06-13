const { sequelize } = require('../src/models');

// Configurar entorno de test
process.env.NODE_ENV = 'test';

beforeAll(async () => {
  // ✅ NO SINCRONIZAR - usar base de datos existente
  // await sequelize.sync({ force: true }); // PELIGROSO - BORRARÍA TU BD REAL
  
  // Solo verificar conexión
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD establecida para tests');
  } catch (error) {
    console.error('❌ Error conectando a BD para tests:', error.message);
  }
});

afterAll(async () => {
  // Cerrar conexión después de todos los tests
  await sequelize.close();
});

// Mock de Redis para tests
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn()
  }));
});

// Mock de servicios externos
jest.mock('../src/services', () => ({
  UsuarioService: {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  VendedorService: {
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

// Configuración global para timeouts
jest.setTimeout(15000); 