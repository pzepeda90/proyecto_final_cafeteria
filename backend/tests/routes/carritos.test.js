const request = require('supertest');
const app = require('../../src/app');
const { Usuario, Producto, Carrito, DetalleCarrito, Rol } = require('../../src/models');
const jwt = require('jsonwebtoken');

describe('Rutas de Carritos', () => {
  let clientUser, otherUser;
  let clientToken, otherToken;
  let producto1, producto2, producto3;
  let carrito;

  beforeEach(async () => {
    // Limpiar tablas
    await DetalleCarrito.destroy({ where: {} });
    await Carrito.destroy({ where: {} });
    await Producto.destroy({ where: {} });
    await Usuario.destroy({ where: {} });
    await Rol.destroy({ where: {} });

    // Crear roles
    await Rol.bulkCreate([
      { id: 1, nombre: 'administrador' },
      { id: 2, nombre: 'cliente' },
      { id: 3, nombre: 'vendedor' }
    ]);

    // Crear usuarios
    clientUser = await Usuario.create({
      nombre: 'Cliente Test',
      apellido: 'User',
      email: 'cliente@test.com',
      password: 'password123',
      telefono: '1234567890',
      rol_id: 2
    });

    otherUser = await Usuario.create({
      nombre: 'Otro Cliente',
      apellido: 'User',
      email: 'otro@test.com',
      password: 'password123',
      telefono: '1234567891',
      rol_id: 2
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

    producto3 = await Producto.create({
      nombre: 'Croissant',
      precio: 1.50,
      descripcion: 'Croissant fresco',
      categoria: 'panaderia',
      stock: 20
    });

    // Crear carrito inicial
    carrito = await Carrito.create({
      usuario_id: clientUser.id,
      total: 0
    });

    // Generar tokens
    clientToken = jwt.sign({ userId: clientUser.id, role: 'cliente' }, process.env.JWT_SECRET || 'test_secret');
    otherToken = jwt.sign({ userId: otherUser.id, role: 'cliente' }, process.env.JWT_SECRET || 'test_secret');
  });

  describe('GET /api/cart', () => {
    beforeEach(async () => {
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

      await carrito.update({ total: 8.50 });
    });

    test('debería obtener el carrito del usuario autenticado', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.id).toBe(carrito.id);
      expect(response.body.total).toBe(8.50);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].producto_id).toBe(producto1.id);
      expect(response.body.items[0].cantidad).toBe(2);
    });

    test('debería crear carrito vacío si no existe', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${otherToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.items).toHaveLength(0);
      expect(response.body.usuario_id).toBe(otherUser.id);
    });

    test('debería fallar sin autenticación', async () => {
      await request(app)
        .get('/api/cart')
        .expect(401);
    });
  });

  describe('POST /api/cart/items', () => {
    test('debería agregar producto al carrito', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto1.id,
          cantidad: 3
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.message).toBe('Producto agregado al carrito');

      // Verificar que se agregó correctamente
      const detalles = await DetalleCarrito.findAll({ where: { carrito_id: carrito.id } });
      expect(detalles).toHaveLength(1);
      expect(detalles[0].cantidad).toBe(3);
      expect(detalles[0].precio_unitario).toBe(2.50);
    });

    test('debería actualizar cantidad si producto ya existe', async () => {
      // Agregar producto inicialmente
      await DetalleCarrito.create({
        carrito_id: carrito.id,
        producto_id: producto1.id,
        cantidad: 2,
        precio_unitario: 2.50
      });

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto1.id,
          cantidad: 1
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.message).toBe('Cantidad actualizada en carrito');

      // Verificar que se actualizó
      const detalle = await DetalleCarrito.findOne({ 
        where: { carrito_id: carrito.id, producto_id: producto1.id } 
      });
      expect(detalle.cantidad).toBe(3); // 2 + 1
    });

    test('debería fallar con producto inexistente', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: 999,
          cantidad: 1
        })
        .expect(404);
    });

    test('debería fallar con stock insuficiente', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto3.id,
          cantidad: 25 // Más del stock disponible (20)
        })
        .expect(400);
    });

    test('debería fallar con cantidad inválida', async () => {
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto1.id,
          cantidad: 0
        })
        .expect(400);
    });
  });

  describe('PUT /api/cart/items/:id', () => {
    let detalleCarrito;

    beforeEach(async () => {
      detalleCarrito = await DetalleCarrito.create({
        carrito_id: carrito.id,
        producto_id: producto1.id,
        cantidad: 2,
        precio_unitario: 2.50
      });
    });

    test('debería actualizar cantidad del producto', async () => {
      const response = await request(app)
        .put(`/api/cart/items/${detalleCarrito.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ cantidad: 5 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.message).toBe('Cantidad actualizada');

      // Verificar actualización
      await detalleCarrito.reload();
      expect(detalleCarrito.cantidad).toBe(5);
    });

    test('debería fallar al actualizar item de otro usuario', async () => {
      await request(app)
        .put(`/api/cart/items/${detalleCarrito.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ cantidad: 5 })
        .expect(403);
    });

    test('debería fallar con cantidad que excede stock', async () => {
      await request(app)
        .put(`/api/cart/items/${detalleCarrito.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ cantidad: 150 }) // Más del stock disponible
        .expect(400);
    });
  });

  describe('DELETE /api/cart/items/:id', () => {
    let detalleCarrito;

    beforeEach(async () => {
      detalleCarrito = await DetalleCarrito.create({
        carrito_id: carrito.id,
        producto_id: producto1.id,
        cantidad: 2,
        precio_unitario: 2.50
      });
    });

    test('debería eliminar producto del carrito', async () => {
      await request(app)
        .delete(`/api/cart/items/${detalleCarrito.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // Verificar eliminación
      const deleted = await DetalleCarrito.findByPk(detalleCarrito.id);
      expect(deleted).toBeNull();
    });

    test('debería fallar al eliminar item de otro usuario', async () => {
      await request(app)
        .delete(`/api/cart/items/${detalleCarrito.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);
    });

    test('debería fallar con item inexistente', async () => {
      await request(app)
        .delete('/api/cart/items/999')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(404);
    });
  });

  describe('DELETE /api/cart', () => {
    beforeEach(async () => {
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
    });

    test('debería vaciar el carrito completamente', async () => {
      const response = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.message).toBe('Carrito vaciado');

      // Verificar que se eliminaron todos los items
      const items = await DetalleCarrito.findAll({ where: { carrito_id: carrito.id } });
      expect(items).toHaveLength(0);

      // Verificar que el total se reseteo
      await carrito.reload();
      expect(carrito.total).toBe(0);
    });
  });

  describe('Cálculo de totales', () => {
    test('debería calcular correctamente el total del carrito', async () => {
      // Agregar productos
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto1.id,
          cantidad: 2
        });

      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto2.id,
          cantidad: 1
        });

      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto3.id,
          cantidad: 3
        });

      // Obtener carrito y verificar total
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // Total esperado: (2 * 2.50) + (1 * 3.50) + (3 * 1.50) = 5.00 + 3.50 + 4.50 = 13.00
      expect(response.body.total).toBe(13.00);
    });

    test('debería actualizar total al modificar cantidades', async () => {
      const detalle = await DetalleCarrito.create({
        carrito_id: carrito.id,
        producto_id: producto1.id,
        cantidad: 2,
        precio_unitario: 2.50
      });

      // Cambiar cantidad
      await request(app)
        .put(`/api/cart/items/${detalle.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ cantidad: 4 });

      // Verificar nuevo total
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.total).toBe(10.00); // 4 * 2.50
    });
  });
}); 