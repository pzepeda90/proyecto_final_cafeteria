const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Hashea una contraseña para usar en tests
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Genera un token JWT válido para tests
 * @param {Object} user - Datos del usuario
 * @returns {string} - Token JWT
 */
const generateTestToken = (user) => {
  return jwt.sign(
    { 
      usuario_id: user.usuario_id,
      email: user.email,
      rol: user.rol || 'cliente'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Crea un usuario con contraseña hasheada para tests
 * @param {Object} userData - Datos del usuario
 * @returns {Object} - Datos del usuario con password_hash
 */
const createTestUser = async (userData) => {
  const password = userData.password || 'password123';
  const password_hash = await hashPassword(password);
  
  return {
    ...userData,
    password_hash,
    // Remover password del objeto final
    password: undefined
  };
};

/**
 * Datos de prueba comunes
 */
const testData = {
  adminUser: {
    nombre: 'Admin Test',
    apellido: 'User', 
    email: 'admin@test.com',
    telefono: '1234567890',
    rol: 'admin'
  },
  clientUser: {
    nombre: 'Cliente Test',
    apellido: 'User',
    email: 'cliente@test.com', 
    telefono: '0987654321',
    rol: 'cliente'
  },
  vendedorUser: {
    nombre: 'Vendedor Test',
    apellido: 'User',
    email: 'vendedor@test.com',
    telefono: '5555555555',
    rol: 'vendedor'
  },
  testProduct: {
    nombre: 'Café Test',
    precio: 2.50,
    descripcion: 'Café de prueba',
    categoria: 'bebidas',
    stock: 100
  }
};

module.exports = {
  hashPassword,
  generateTestToken,
  createTestUser,
  testData
}; 