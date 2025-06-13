const request = require('supertest');
const app = require('../../src/app');
const { Usuario, Rol } = require('../../src/models');
const jwt = require('jsonwebtoken');
const { createTestUser, testData, generateTestToken } = require('../utils/test-helpers');

describe('Rutas de Usuarios', () => {
  let adminUser, clientUser, vendedorUser;
  let adminToken, clientToken, vendedorToken;

  beforeEach(async () => {
    // Limpiar tablas
    await Usuario.destroy({ where: {} });
    await Rol.destroy({ where: {} });

    // Crear roles
    await Rol.bulkCreate([
      { id: 1, nombre: 'administrador' },
      { id: 2, nombre: 'cliente' },
      { id: 3, nombre: 'vendedor' }
    ]);

    // Crear usuarios de prueba con contraseñas hasheadas
    const adminData = await createTestUser({
      ...testData.adminUser,
      rol_id: 1
    });
    adminUser = await Usuario.create(adminData);

    const clientData = await createTestUser({
      ...testData.clientUser,
      email: 'client@test.com',
      rol_id: 2
    });
    clientUser = await Usuario.create(clientData);

    const vendedorData = await createTestUser({
      ...testData.vendedorUser,
      rol_id: 3
    });
    vendedorUser = await Usuario.create(vendedorData);

    // Generar tokens
    adminToken = jwt.sign({ userId: adminUser.id, role: 'administrador' }, process.env.JWT_SECRET || 'test_secret');
    clientToken = jwt.sign({ userId: clientUser.id, role: 'cliente' }, process.env.JWT_SECRET || 'test_secret');
    vendedorToken = jwt.sign({ userId: vendedorUser.id, role: 'vendedor' }, process.env.JWT_SECRET || 'test_secret');
  });

  describe('POST /api/usuarios/registro', () => {
    test('debería registrar un nuevo usuario', async () => {
      const newUser = {
        nombre: 'Nuevo',
        apellido: 'Usuario',
        email: 'nuevo@test.com',
        password: 'password123',
        telefono: '1234567893'
      };

      const response = await request(app)
        .post('/api/usuarios/registro')
        .send(newUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.mensaje).toBe('Usuario registrado correctamente');
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.password).toBeUndefined(); // No debe devolver la contraseña
    });

    test('debería fallar con email duplicado', async () => {
      const duplicateUser = {
        nombre: 'Duplicate',
        apellido: 'User',
        email: 'admin@test.com', // Email que ya existe
        password: 'password123',
        telefono: '1234567894'
      };

      await request(app)
        .post('/api/usuarios/registro')
        .send(duplicateUser)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('debería fallar con datos inválidos', async () => {
      const invalidUser = {
        nombre: '',
        email: 'email-invalido',
        password: '123' // Muy corta
      };

      await request(app)
        .post('/api/usuarios/registro')
        .send(invalidUser)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('POST /api/usuarios/login', () => {
    test('debería hacer login correctamente', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('admin@test.com');
      expect(response.body.user.password).toBeUndefined();
    });

    test('debería fallar con credenciales incorrectas', async () => {
      await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword'
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  // Nota: Las rutas de listado, actualización y eliminación de usuarios
  // no están implementadas en la aplicación real, por lo que se omiten estos tests
}); 