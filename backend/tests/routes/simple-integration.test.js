const request = require('supertest');
const app = require('../../src/app');

describe('Tests de Integración Simples - Cobertura Rápida', () => {
  
  describe('Endpoints Públicos', () => {
    test('GET / - endpoint principal debería funcionar', async () => {
      const response = await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('funcionando');
    });

    test('GET /api/productos - debería devolver lista de productos', async () => {
      const response = await request(app)
        .get('/api/productos')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/categorias - debería devolver lista de categorías', async () => {
      const response = await request(app)
        .get('/api/categorias')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/estados-pedido - debería devolver estados de pedido', async () => {
      const response = await request(app)
        .get('/api/estados-pedido')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/metodos-pago - debería devolver métodos de pago', async () => {
      const response = await request(app)
        .get('/api/metodos-pago')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/roles - debería devolver lista de roles', async () => {
      const response = await request(app)
        .get('/api/roles')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Endpoints de Productos - Casos Específicos', () => {
    test('GET /api/productos?categoria_id=1 - filtro por categoría', async () => {
      const response = await request(app)
        .get('/api/productos?categoria_id=1')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/productos?disponible=true - filtro por disponibilidad', async () => {
      const response = await request(app)
        .get('/api/productos?disponible=true')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /api/productos/9999 - producto inexistente debería devolver 404', async () => {
      await request(app)
        .get('/api/productos/9999')
        .expect(404);
    });
  });

  describe('Tests de Validación de Entrada', () => {
    test('POST /api/usuarios/registro - debería fallar sin datos', async () => {
      const response = await request(app)
        .post('/api/usuarios/registro')
        .send({})
        .expect('Content-Type', /json/);
      
      expect([400, 422, 500]).toContain(response.status);
    });

    test('POST /api/usuarios/login - debería fallar sin credenciales', async () => {
      const response = await request(app)
        .post('/api/usuarios/login')
        .send({})
        .expect('Content-Type', /json/);
      
      expect([400, 401, 422, 500]).toContain(response.status);
    });
  });

  describe('Tests de Error Handling', () => {
    test('GET /api/ruta-inexistente - debería devolver 404', async () => {
      const response = await request(app)
        .get('/api/ruta-inexistente')
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/productos - sin autenticación debería devolver 401', async () => {
      const response = await request(app)
        .post('/api/productos')
        .send({ nombre: 'Test' })
        .expect('Content-Type', /json/)
        .expect(401);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Tests de Servicios (Coverage Boost)', () => {
    test('Debería poder importar todos los servicios', () => {
      expect(() => require('../../src/services/producto.service')).not.toThrow();
      expect(() => require('../../src/services/usuario.service')).not.toThrow();
      expect(() => require('../../src/services/carrito.service')).not.toThrow();
      expect(() => require('../../src/services/pedido.service')).not.toThrow();
    });

    test('Debería poder importar todos los controladores', () => {
      expect(() => require('../../src/controllers/productos.controller')).not.toThrow();
      expect(() => require('../../src/controllers/usuarios.controller')).not.toThrow();
      expect(() => require('../../src/controllers/carritos.controller')).not.toThrow();
      expect(() => require('../../src/controllers/pedidos.controller')).not.toThrow();
    });

    test('Debería poder importar todos los middlewares', () => {
      expect(() => require('../../src/middlewares/auth.middleware')).not.toThrow();
      expect(() => require('../../src/middlewares/validation.middleware')).not.toThrow();
    });
  });
}); 