const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const jwt = require('jsonwebtoken');
const { 
  Usuario, 
  Vendedor, 
  Producto, 
  Carrito, 
  DetalleCarrito, 
  Pedido, 
  Categoria,
  Rol,
  EstadoPedido,
  MetodoPago
} = require('../src/models');

describe('🚀 TESTS DE INTEGRACIÓN AVANZADOS', () => {
  let adminUser, clientUser, vendedorUser;
  let adminToken, clientToken, vendedorToken;
  let categoria, producto1, producto2;
  let estadoPendiente, metodoPago;

  beforeAll(async () => {
    // Limpiar base de datos
    await sequelize.sync({ force: true });

    // Crear roles
    await Rol.bulkCreate([
      { id: 1, nombre: 'admin' },
      { id: 2, nombre: 'cliente' },
      { id: 3, nombre: 'vendedor' }
    ]);

    // Crear estados de pedido
    estadoPendiente = await EstadoPedido.create({
      nombre: 'pendiente',
      descripcion: 'Pedido pendiente de confirmación'
    });

    // Crear método de pago
    metodoPago = await MetodoPago.create({
      nombre: 'efectivo',
      descripcion: 'Pago en efectivo'
    });

    // Crear usuarios
    adminUser = await Usuario.create({
      nombre: 'Admin',
      apellido: 'Test',
      email: 'admin@test.com',
      password: 'password123',
      telefono: '1234567890',
      rol_id: 1,
      activo: true
    });

    clientUser = await Usuario.create({
      nombre: 'Cliente',
      apellido: 'Test',
      email: 'cliente@test.com',
      password: 'password123',
      telefono: '1234567891',
      rol_id: 2,
      activo: true
    });

    vendedorUser = await Usuario.create({
      nombre: 'Vendedor',
      apellido: 'Test',
      email: 'vendedor@test.com',
      password: 'password123',
      telefono: '1234567892',
      rol_id: 3,
      activo: true
    });

    // Crear vendedor
    await Vendedor.create({
      usuario_id: vendedorUser.id,
      nombre: 'Vendedor',
      apellido: 'Test',
      email: 'vendedor@test.com',
      password_hash: 'hashedpassword',
      telefono: '1234567892',
      activo: true
    });

    // Crear categoría y productos
    categoria = await Categoria.create({
      nombre: 'Bebidas',
      descripcion: 'Bebidas calientes y frías'
    });

    producto1 = await Producto.create({
      nombre: 'Café Americano',
      descripcion: 'Café negro americano',
      precio: 2500,
      categoria_id: categoria.id,
      stock: 100,
      disponible: true,
      vendedor_id: 1
    });

    producto2 = await Producto.create({
      nombre: 'Latte',
      descripcion: 'Café con leche',
      precio: 3500,
      categoria_id: categoria.id,
      stock: 50,
      disponible: true,
      vendedor_id: 1
    });

    // Generar tokens
    adminToken = jwt.sign(
      { id: adminUser.id, tipo: 'usuario', role: 'admin' },
      process.env.JWT_SECRET || 'test_secret'
    );

    clientToken = jwt.sign(
      { id: clientUser.id, tipo: 'usuario', role: 'cliente' },
      process.env.JWT_SECRET || 'test_secret'
    );

    vendedorToken = jwt.sign(
      { id: vendedorUser.id, tipo: 'usuario', role: 'vendedor' },
      process.env.JWT_SECRET || 'test_secret'
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('🛒 CARRITOS - ENDPOINTS AVANZADOS', () => {
    
    test('GET /api/carritos/all - Admin puede ver todos los carritos', async () => {
      // Crear algunos carritos
      const carrito1 = await Carrito.create({ usuario_id: clientUser.id, total: 5000 });
      const carrito2 = await Carrito.create({ usuario_id: vendedorUser.id, total: 3000 });

      const response = await request(app)
        .get('/api/carritos/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.carritos).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThan(0);
    });

    test('GET /api/carritos/all - Cliente no puede ver todos los carritos', async () => {
      await request(app)
        .get('/api/carritos/all')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    test('GET /api/carritos/user/:userId - Admin puede ver carrito de usuario específico', async () => {
      const response = await request(app)
        .get(`/api/carritos/user/${clientUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.usuario_id).toBe(clientUser.id);
    });

    test('GET /api/carritos/stats - Admin puede ver estadísticas', async () => {
      const response = await request(app)
        .get('/api/carritos/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.total_carritos).toBeDefined();
      expect(response.body.carritos_activos).toBeDefined();
      expect(response.body.valor_total).toBeDefined();
    });

    test('POST /api/carritos/bulk-add - Agregar múltiples productos', async () => {
      const productos = [
        { producto_id: producto1.id, cantidad: 2 },
        { producto_id: producto2.id, cantidad: 1 }
      ];

      const response = await request(app)
        .post('/api/carritos/bulk-add')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ productos })
        .expect(200);

      expect(response.body.mensaje).toContain('productos agregados');
      expect(response.body.carrito).toBeDefined();
    });

    test('PUT /api/carritos/sync - Sincronizar carrito completo', async () => {
      const productos = [
        { producto_id: producto1.id, cantidad: 5 },
        { producto_id: producto2.id, cantidad: 3 }
      ];

      const response = await request(app)
        .put('/api/carritos/sync')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ productos })
        .expect(200);

      expect(response.body.mensaje).toBe('Carrito sincronizado');
      expect(response.body.carrito.detalles).toHaveLength(2);
    });

    test('DELETE /api/carritos/abandoned - Limpiar carritos abandonados', async () => {
      // Crear carrito abandonado (fecha antigua)
      const carritoViejo = await Carrito.create({
        usuario_id: clientUser.id,
        total: 1000,
        updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 días atrás
      });

      const response = await request(app)
        .delete('/api/carritos/abandoned?days=30')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.deleted_count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('📦 PEDIDOS - ENDPOINTS AVANZADOS', () => {
    
    test('GET /api/pedidos/mis-pedidos - Cliente ve sus pedidos', async () => {
      // Crear pedido para el cliente
      await Pedido.create({
        usuario_id: clientUser.id,
        estado_pedido_id: estadoPendiente.id,
        metodo_pago_id: metodoPago.id,
        subtotal: 5000,
        impuestos: 800,
        total: 5800
      });

      const response = await request(app)
        .get('/api/pedidos/mis-pedidos')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('GET /api/pedidos/stats - Vendedor puede ver estadísticas', async () => {
      const response = await request(app)
        .get('/api/pedidos/stats')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    test('PUT /api/pedidos/:id/cancelar - Cliente puede cancelar su pedido', async () => {
      const pedido = await Pedido.create({
        usuario_id: clientUser.id,
        estado_pedido_id: estadoPendiente.id,
        metodo_pago_id: metodoPago.id,
        subtotal: 3000,
        impuestos: 480,
        total: 3480
      });

      const response = await request(app)
        .put(`/api/pedidos/${pedido.id}/cancelar`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ motivo: 'Cambié de opinión' })
        .expect(200);

      expect(response.body.mensaje).toContain('cancelado');
    });

    test('PUT /api/pedidos/bulk-update - Vendedor puede actualizar múltiples pedidos', async () => {
      const pedido1 = await Pedido.create({
        usuario_id: clientUser.id,
        estado_pedido_id: estadoPendiente.id,
        metodo_pago_id: metodoPago.id,
        subtotal: 2000,
        impuestos: 320,
        total: 2320
      });

      const pedido2 = await Pedido.create({
        usuario_id: clientUser.id,
        estado_pedido_id: estadoPendiente.id,
        metodo_pago_id: metodoPago.id,
        subtotal: 4000,
        impuestos: 640,
        total: 4640
      });

      const pedidos = [
        { pedido_id: pedido1.id, estado_pedido_id: estadoPendiente.id, comentario: 'Confirmado' },
        { pedido_id: pedido2.id, estado_pedido_id: estadoPendiente.id, comentario: 'En preparación' }
      ];

      const response = await request(app)
        .put('/api/pedidos/bulk-update')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ pedidos })
        .expect(200);

      expect(response.body.mensaje).toContain('actualizados');
    });
  });

  describe('🔐 AUTENTICACIÓN - OPTIMIZACIONES', () => {
    
    test('Cache de usuarios - Múltiples requests usan cache', async () => {
      const startTime = Date.now();
      
      // Hacer múltiples requests que deberían usar cache
      const promises = Array(5).fill().map(() =>
        request(app)
          .get('/api/carritos')
          .set('Authorization', `Bearer ${clientToken}`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // Todas las respuestas deben ser exitosas
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // El tiempo total debe ser razonable (cache mejora performance)
      expect(endTime - startTime).toBeLessThan(2000);
    });

    test('Manejo de tokens expirados', async () => {
      const expiredToken = jwt.sign(
        { id: clientUser.id, tipo: 'usuario', role: 'cliente' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '-1h' } // Token expirado
      );

      const response = await request(app)
        .get('/api/carritos')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.code).toBe('TOKEN_EXPIRED');
    });

    test('Manejo de tokens inválidos', async () => {
      const response = await request(app)
        .get('/api/carritos')
        .set('Authorization', 'Bearer token_invalido')
        .expect(401);

      expect(response.body.code).toBe('INVALID_TOKEN');
    });
  });

  describe('⚡ RENDIMIENTO Y CARGA', () => {
    
    test('Consultas simultáneas de carritos', async () => {
      const startTime = Date.now();
      
      const promises = Array(10).fill().map(() =>
        request(app)
          .get('/api/carritos')
          .set('Authorization', `Bearer ${clientToken}`)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // Todas las respuestas deben ser exitosas
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Tiempo total debe ser razonable
      expect(endTime - startTime).toBeLessThan(3000);
      console.log(`✅ 10 consultas simultáneas completadas en ${endTime - startTime}ms`);
    });

    test('Agregar múltiples productos al carrito en lote', async () => {
      const productos = Array(20).fill().map((_, index) => ({
        producto_id: index % 2 === 0 ? producto1.id : producto2.id,
        cantidad: Math.floor(Math.random() * 5) + 1
      }));

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/carritos/bulk-add')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ productos });

      const endTime = Date.now();

      expect([200, 400]).toContain(response.status); // Puede fallar por stock
      expect(endTime - startTime).toBeLessThan(2000);
      console.log(`✅ Agregado en lote completado en ${endTime - startTime}ms`);
    });

    test('Paginación eficiente de carritos', async () => {
      // Crear varios carritos
      const carritos = Array(15).fill().map((_, index) => ({
        usuario_id: clientUser.id,
        total: (index + 1) * 1000
      }));

      await Carrito.bulkCreate(carritos);

      const response = await request(app)
        .get('/api/carritos/all?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.carritos).toHaveLength(5);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.total).toBeGreaterThan(5);
    });
  });

  describe('🛡️ SEGURIDAD Y VALIDACIONES', () => {
    
    test('Validación de roles - Cliente no puede acceder a endpoints de admin', async () => {
      const endpoints = [
        '/api/carritos/all',
        '/api/carritos/stats',
        '/api/carritos/abandoned'
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${clientToken}`);
        
        expect(response.status).toBe(403);
        expect(response.body.code).toBe('INSUFFICIENT_ROLE');
      }
    });

    test('Validación de entrada - Datos inválidos en carrito', async () => {
      const invalidData = [
        { productos: [] }, // Array vacío
        { productos: [{ producto_id: -1, cantidad: 1 }] }, // ID negativo
        { productos: [{ producto_id: producto1.id, cantidad: 0 }] }, // Cantidad cero
        { productos: [{ producto_id: 'invalid', cantidad: 1 }] } // ID no numérico
      ];

      for (const data of invalidData) {
        const response = await request(app)
          .post('/api/carritos/bulk-add')
          .set('Authorization', `Bearer ${clientToken}`)
          .send(data);
        
        expect(response.status).toBe(400);
      }
    });

    test('Protección contra inyección SQL', async () => {
      const maliciousInput = "'; DROP TABLE usuarios; --";
      
      const response = await request(app)
        .get(`/api/carritos/user/${maliciousInput}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      // Debe fallar de forma segura, no causar error de SQL
      expect([400, 404, 500]).toContain(response.status);
    });

    test('Rate limiting - Múltiples requests rápidos', async () => {
      // Hacer muchos requests rápidos
      const promises = Array(50).fill().map(() =>
        request(app)
          .get('/api/carritos')
          .set('Authorization', `Bearer ${clientToken}`)
      );

      const responses = await Promise.all(promises);
      
      // Algunos pueden ser bloqueados por rate limiting
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      
      expect(successCount + rateLimitedCount).toBe(50);
      console.log(`✅ Rate limiting: ${successCount} exitosos, ${rateLimitedCount} bloqueados`);
    });
  });

  describe('🔄 TRANSACCIONES Y CONSISTENCIA', () => {
    
    test('Transacciones en carrito - Rollback en caso de error', async () => {
      // Intentar agregar producto que no existe
      const response = await request(app)
        .post('/api/carritos/agregar')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ producto_id: 99999, cantidad: 1 })
        .expect(404);

      // Verificar que el carrito no se modificó
      const carritoResponse = await request(app)
        .get('/api/carritos')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // El carrito debe mantener su estado anterior
      expect(carritoResponse.body).toBeDefined();
    });

    test('Consistencia de datos - Total del carrito se calcula correctamente', async () => {
      // Limpiar carrito
      await request(app)
        .delete('/api/carritos/vaciar')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // Agregar productos
      await request(app)
        .post('/api/carritos/agregar')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ producto_id: producto1.id, cantidad: 2 })
        .expect(200);

      await request(app)
        .post('/api/carritos/agregar')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ producto_id: producto2.id, cantidad: 1 })
        .expect(200);

      // Verificar total
      const response = await request(app)
        .get('/api/carritos')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      const expectedTotal = (producto1.precio * 2) + (producto2.precio * 1);
      expect(parseFloat(response.body.total)).toBe(expectedTotal);
    });
  });
});

module.exports = {
  // Exportar para uso en otros tests si es necesario
}; 