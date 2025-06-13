const request = require('supertest');
const app = require('../../src/app');
const { Usuario, Producto, Pedido, DetallePedido, Carrito, DetalleCarrito, EstadoPedido, Rol } = require('../../src/models');
const jwt = require('jsonwebtoken');

describe('Rutas de Pedidos', () => {
  let clientUser, vendedorUser, adminUser;
  let clientToken, vendedorToken, adminToken;
  let producto1, producto2;
  let carrito, estadoPendiente, estadoConfirmado;

  beforeEach(async () => {
    // Limpiar tablas
    await DetallePedido.destroy({ where: {} });
    await Pedido.destroy({ where: {} });
    await DetalleCarrito.destroy({ where: {} });
    await Carrito.destroy({ where: {} });
    await Producto.destroy({ where: {} });
    await Usuario.destroy({ where: {} });
    await EstadoPedido.destroy({ where: {} });
    await Rol.destroy({ where: {} });

    // Crear roles
    await Rol.bulkCreate([
      { id: 1, nombre: 'administrador' },
      { id: 2, nombre: 'cliente' },
      { id: 3, nombre: 'vendedor' }
    ]);

    // Crear estados de pedido
    estadoPendiente = await EstadoPedido.create({ id: 1, nombre: 'pendiente' });
    estadoConfirmado = await EstadoPedido.create({ id: 2, nombre: 'confirmado' });

    // Crear usuarios
    clientUser = await Usuario.create({
      nombre: 'Cliente Test',
      apellido: 'User',
      email: 'cliente@test.com',
      password: 'password123',
      telefono: '1234567890',
      rol_id: 2
    });

    vendedorUser = await Usuario.create({
      nombre: 'Vendedor Test',
      apellido: 'User',
      email: 'vendedor@test.com',
      password: 'password123',
      telefono: '1234567891',
      rol_id: 3
    });

    adminUser = await Usuario.create({
      nombre: 'Admin Test',
      apellido: 'User',
      email: 'admin@test.com',
      password: 'password123',
      telefono: '1234567892',
      rol_id: 1
    });

    // Crear productos
    producto1 = await Producto.create({
      nombre: 'Café Americano',
      precio: 2.50,
      descripcion: 'Café negro tradicional',
      categoria: 'bebidas',
      stock: 100
    });

    producto2 = await Producto.create({
      nombre: 'Café Latte',
      precio: 3.50,
      descripcion: 'Café con leche cremosa',
      categoria: 'bebidas',
      stock: 50
    });

    // Crear carrito con productos
    carrito = await Carrito.create({
      usuario_id: clientUser.id,
      total: 6.00
    });

    await DetalleCarrito.create({
      carrito_id: carrito.id,
      producto_id: producto1.id,
      cantidad: 2,
      precio_unitario: 2.50
    });

    await DetalleCarrito.create({
      carrito_id: carrito.id,
      producto_id: producto2.id,
      cantidad: 1,
      precio_unitario: 3.50
    });

    // Generar tokens
    clientToken = jwt.sign({ userId: clientUser.id, role: 'cliente' }, process.env.JWT_SECRET || 'test_secret');
    vendedorToken = jwt.sign({ userId: vendedorUser.id, role: 'vendedor' }, process.env.JWT_SECRET || 'test_secret');
    adminToken = jwt.sign({ userId: adminUser.id, role: 'administrador' }, process.env.JWT_SECRET || 'test_secret');
  });

  describe('POST /api/orders', () => {
    test('cliente debería poder crear un pedido desde su carrito', async () => {
      const pedidoData = {
        carrito_id: carrito.id,
        direccion_entrega: 'Calle Test 123',
        metodo_pago: 'efectivo',
        notas: 'Sin azúcar'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(pedidoData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.total).toBe(8.50); // 6.00 + delivery
      expect(response.body.estado).toBe('pendiente');
      expect(response.body.usuario_id).toBe(clientUser.id);

      // Verificar que se crearon los detalles
      const detalles = await DetallePedido.findAll({ where: { pedido_id: response.body.id } });
      expect(detalles).toHaveLength(2);
    });

    test('debería fallar sin carrito válido', async () => {
      const pedidoData = {
        carrito_id: 999, // ID inexistente
        direccion_entrega: 'Calle Test 123',
        metodo_pago: 'efectivo'
      };

      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(pedidoData)
        .expect(400);
    });

    test('debería fallar sin autenticación', async () => {
      await request(app)
        .post('/api/orders')
        .send({})
        .expect(401);
    });
  });

  describe('GET /api/orders', () => {
    let pedido1, pedido2;

    beforeEach(async () => {
      pedido1 = await Pedido.create({
        usuario_id: clientUser.id,
        total: 8.50,
        estado_id: estadoPendiente.id,
        direccion_entrega: 'Calle Test 123',
        metodo_pago: 'efectivo'
      });

      pedido2 = await Pedido.create({
        usuario_id: clientUser.id,
        total: 12.00,
        estado_id: estadoConfirmado.id,
        direccion_entrega: 'Calle Test 456',
        metodo_pago: 'tarjeta'
      });
    });

    test('cliente debería ver solo sus pedidos', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(2);
      response.body.forEach(pedido => {
        expect(pedido.usuario_id).toBe(clientUser.id);
      });
    });

    test('vendedor debería ver todos los pedidos', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    test('debería filtrar por estado', async () => {
      const response = await request(app)
        .get('/api/orders?estado=pendiente')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].estado).toBe('pendiente');
    });
  });

  describe('PUT /api/orders/:id/status', () => {
    let pedido;

    beforeEach(async () => {
      pedido = await Pedido.create({
        usuario_id: clientUser.id,
        total: 8.50,
        estado_id: estadoPendiente.id,
        direccion_entrega: 'Calle Test 123',
        metodo_pago: 'efectivo'
      });
    });

    test('vendedor debería poder actualizar estado del pedido', async () => {
      const response = await request(app)
        .put(`/api/orders/${pedido.id}/status`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ estado: 'confirmado' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.estado).toBe('confirmado');
    });

    test('cliente no debería poder cambiar estado', async () => {
      await request(app)
        .put(`/api/orders/${pedido.id}/status`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ estado: 'confirmado' })
        .expect(403);
    });

    test('debería fallar con estado inválido', async () => {
      await request(app)
        .put(`/api/orders/${pedido.id}/status`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ estado: 'estado_inexistente' })
        .expect(400);
    });
  });

  describe('GET /api/orders/:id', () => {
    let pedido;
    let detalles;

    beforeEach(async () => {
      pedido = await Pedido.create({
        usuario_id: clientUser.id,
        total: 8.50,
        estado_id: estadoPendiente.id,
        direccion_entrega: 'Calle Test 123',
        metodo_pago: 'efectivo'
      });

      detalles = await DetallePedido.create({
        pedido_id: pedido.id,
        producto_id: producto1.id,
        cantidad: 2,
        precio_unitario: 2.50
      });
    });

    test('cliente debería ver detalles de su pedido', async () => {
      const response = await request(app)
        .get(`/api/orders/${pedido.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe(pedido.id);
      expect(response.body.detalles).toHaveLength(1);
      expect(response.body.detalles[0].producto_id).toBe(producto1.id);
    });

    test('cliente no debería ver pedido de otro', async () => {
      const otroPedido = await Pedido.create({
        usuario_id: vendedorUser.id,
        total: 5.00,
        estado_id: estadoPendiente.id,
        direccion_entrega: 'Otra dirección',
        metodo_pago: 'efectivo'
      });

      await request(app)
        .get(`/api/orders/${otroPedido.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(403);
    });

    test('vendedor debería ver cualquier pedido', async () => {
      const response = await request(app)
        .get(`/api/orders/${pedido.id}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe(pedido.id);
    });
  });

  describe('DELETE /api/orders/:id', () => {
    let pedido;

    beforeEach(async () => {
      pedido = await Pedido.create({
        usuario_id: clientUser.id,
        total: 8.50,
        estado_id: estadoPendiente.id,
        direccion_entrega: 'Calle Test 123',
        metodo_pago: 'efectivo'
      });
    });

    test('cliente debería poder cancelar su pedido pendiente', async () => {
      await request(app)
        .delete(`/api/orders/${pedido.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      const canceledOrder = await Pedido.findByPk(pedido.id);
      expect(canceledOrder).toBeNull();
    });

    test('cliente no debería cancelar pedido confirmado', async () => {
      await pedido.update({ estado_id: estadoConfirmado.id });

      await request(app)
        .delete(`/api/orders/${pedido.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(400);
    });

    test('admin debería poder eliminar cualquier pedido', async () => {
      await request(app)
        .delete(`/api/orders/${pedido.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
}); 