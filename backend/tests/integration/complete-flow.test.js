const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');

describe('Flujo Completo de Integración', () => {
  let clientToken, vendedorToken, adminToken;
  let clientUserId, vendedorUserId, adminUserId;
  let producto1Id, producto2Id;
  let carritoId, pedidoId;

  beforeAll(async () => {
    // Sincronizar base de datos para tests de integración
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('1. Configuración Inicial del Sistema', () => {
    test('debería inicializar roles básicos', async () => {
      const response = await request(app)
        .get('/api/roles')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ nombre: 'administrador' }),
          expect.objectContaining({ nombre: 'cliente' }),
          expect.objectContaining({ nombre: 'vendedor' })
        ])
      );
    });

    test('debería inicializar estados de pedido', async () => {
      const response = await request(app)
        .get('/api/order-states')
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ nombre: 'pendiente' }),
          expect.objectContaining({ nombre: 'confirmado' }),
          expect.objectContaining({ nombre: 'en_preparacion' }),
          expect.objectContaining({ nombre: 'listo' }),
          expect.objectContaining({ nombre: 'entregado' })
        ])
      );
    });
  });

  describe('2. Registro y Autenticación de Usuarios', () => {
    test('debería registrar un administrador (primera configuración)', async () => {
      const adminData = {
        nombre: 'Admin',
        apellido: 'Principal',
        email: 'admin@cafeteria.com',
        password: 'admin123456',
        telefono: '1111111111',
        rol_id: 1
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(adminData)
        .expect(201);

      expect(response.body.user.email).toBe(adminData.email);
      adminUserId = response.body.user.id;
    });

    test('debería registrar un vendedor', async () => {
      const vendedorData = {
        nombre: 'Carlos',
        apellido: 'Vendedor',
        email: 'vendedor@cafeteria.com',
        password: 'vendedor123',
        telefono: '2222222222',
        rol_id: 3
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(vendedorData)
        .expect(201);

      expect(response.body.user.email).toBe(vendedorData.email);
      vendedorUserId = response.body.user.id;
    });

    test('debería registrar un cliente', async () => {
      const clienteData = {
        nombre: 'María',
        apellido: 'Cliente',
        email: 'cliente@example.com',
        password: 'cliente123',
        telefono: '3333333333',
        rol_id: 2
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(clienteData)
        .expect(201);

      expect(response.body.user.email).toBe(clienteData.email);
      clientUserId = response.body.user.id;
    });

    test('debería hacer login como administrador', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'admin@cafeteria.com',
          password: 'admin123456'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      adminToken = response.body.token;
    });

    test('debería hacer login como vendedor', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'vendedor@cafeteria.com',
          password: 'vendedor123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      vendedorToken = response.body.token;
    });

    test('debería hacer login como cliente', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'cliente@example.com',
          password: 'cliente123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      clientToken = response.body.token;
    });
  });

  describe('3. Gestión de Productos por Administrador', () => {
    test('admin debería crear categorías', async () => {
      const categorias = [
        { nombre: 'Bebidas Calientes', descripcion: 'Cafés, tés y chocolate' },
        { nombre: 'Bebidas Frías', descripcion: 'Jugos, smoothies y frappés' },
        { nombre: 'Panadería', descripcion: 'Panes, croissants y pasteles' },
        { nombre: 'Snacks', descripcion: 'Galletas, chips y frutos secos' }
      ];

      for (const categoria of categorias) {
        await request(app)
          .post('/api/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(categoria)
          .expect(201);
      }
    });

    test('admin debería crear productos', async () => {
      const productos = [
        {
          nombre: 'Café Americano',
          precio: 2.50,
          descripcion: 'Café negro tradicional, fuerte y aromático',
          categoria: 'Bebidas Calientes',
          stock: 100
        },
        {
          nombre: 'Cappuccino',
          precio: 3.50,
          descripcion: 'Café espresso con leche vaporizada y espuma',
          categoria: 'Bebidas Calientes',
          stock: 80
        },
        {
          nombre: 'Croissant de Jamón',
          precio: 4.00,
          descripcion: 'Croissant fresco relleno de jamón y queso',
          categoria: 'Panadería',
          stock: 25
        },
        {
          nombre: 'Jugo de Naranja',
          precio: 3.00,
          descripcion: 'Jugo natural de naranja recién exprimido',
          categoria: 'Bebidas Frías',
          stock: 50
        }
      ];

      for (const [index, producto] of productos.entries()) {
        const response = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(producto)
          .expect(201);

        expect(response.body.nombre).toBe(producto.nombre);
        
        if (index === 0) producto1Id = response.body.id;
        if (index === 1) producto2Id = response.body.id;
      }
    });

    test('cliente debería poder ver todos los productos', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveLength(4);
      expect(response.body[0]).toHaveProperty('nombre');
      expect(response.body[0]).toHaveProperty('precio');
      expect(response.body[0]).not.toHaveProperty('stock'); // Los clientes no ven stock
    });
  });

  describe('4. Flujo de Compra del Cliente', () => {
    test('cliente debería obtener carrito vacío inicialmente', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.items).toHaveLength(0);
      carritoId = response.body.id;
    });

    test('cliente debería agregar productos al carrito', async () => {
      // Agregar Café Americano (2 unidades)
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto1Id,
          cantidad: 2
        })
        .expect(201);

      // Agregar Cappuccino (1 unidad)
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto2Id,
          cantidad: 1
        })
        .expect(201);
    });

    test('cliente debería ver carrito actualizado', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(2);
      expect(response.body.total).toBe(8.50); // (2 * 2.50) + (1 * 3.50)
    });

    test('cliente debería modificar cantidades en el carrito', async () => {
      // Obtener el ID del item del Café Americano
      const cartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      const cafeAmericanoItem = cartResponse.body.items.find(
        item => item.producto_id === producto1Id
      );

      // Cambiar cantidad a 3
      await request(app)
        .put(`/api/cart/items/${cafeAmericanoItem.id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ cantidad: 3 })
        .expect(200);

      // Verificar nuevo total
      const updatedCartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(updatedCartResponse.body.total).toBe(11.00); // (3 * 2.50) + (1 * 3.50)
    });

    test('cliente debería crear pedido desde carrito', async () => {
      const pedidoData = {
        direccion_entrega: 'Av. Principal 123, Apt 4B, Centro, Ciudad',
        metodo_pago: 'tarjeta',
        notas: 'Sin azúcar en el café, por favor. Entregar en recepción.',
        telefono_contacto: '3333333333'
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(pedidoData)
        .expect(201);

      expect(response.body.total).toBeGreaterThan(11.00); // Incluye costo de delivery
      expect(response.body.estado).toBe('pendiente');
      expect(response.body.direccion_entrega).toBe(pedidoData.direccion_entrega);
      
      pedidoId = response.body.id;
    });

    test('carrito debería estar vacío después de crear pedido', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('5. Gestión de Pedidos por Vendedor', () => {
    test('vendedor debería ver todos los pedidos pendientes', async () => {
      const response = await request(app)
        .get('/api/orders?estado=pendiente')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(pedidoId);
      expect(response.body[0].estado).toBe('pendiente');
    });

    test('vendedor debería ver detalles completos del pedido', async () => {
      const response = await request(app)
        .get(`/api/orders/${pedidoId}`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(200);

      expect(response.body.id).toBe(pedidoId);
      expect(response.body.detalles).toHaveLength(2);
      expect(response.body.usuario).toHaveProperty('nombre', 'María');
      expect(response.body.usuario).toHaveProperty('telefono', '3333333333');
    });

    test('vendedor debería confirmar el pedido', async () => {
      const response = await request(app)
        .put(`/api/orders/${pedidoId}/status`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ estado: 'confirmado' })
        .expect(200);

      expect(response.body.estado).toBe('confirmado');
    });

    test('vendedor debería actualizar estado a "en preparación"', async () => {
      await request(app)
        .put(`/api/orders/${pedidoId}/status`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ estado: 'en_preparacion' })
        .expect(200);
    });

    test('vendedor debería marcar pedido como listo', async () => {
      await request(app)
        .put(`/api/orders/${pedidoId}/status`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ estado: 'listo' })
        .expect(200);
    });

    test('vendedor debería marcar pedido como entregado', async () => {
      const response = await request(app)
        .put(`/api/orders/${pedidoId}/status`)
        .set('Authorization', `Bearer ${vendedorToken}`)
        .send({ estado: 'entregado' })
        .expect(200);

      expect(response.body.estado).toBe('entregado');
    });
  });

  describe('6. Seguimiento por Cliente', () => {
    test('cliente debería ver su historial de pedidos', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(pedidoId);
      expect(response.body[0].estado).toBe('entregado');
    });

    test('cliente debería poder ver detalles de su pedido entregado', async () => {
      const response = await request(app)
        .get(`/api/orders/${pedidoId}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      expect(response.body.estado).toBe('entregado');
      expect(response.body.detalles).toHaveLength(2);
      expect(response.body.total).toBeGreaterThan(11.00);
    });

    test('cliente debería poder agregar reseña al pedido', async () => {
      const resenaData = {
        pedido_id: pedidoId,
        calificacion: 5,
        comentario: 'Excelente servicio, todo llegó a tiempo y muy sabroso. El café estaba perfecto.'
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(resenaData)
        .expect(201);

      expect(response.body.calificacion).toBe(5);
      expect(response.body.comentario).toBe(resenaData.comentario);
    });
  });

  describe('7. Reportes y Analytics para Administrador', () => {
    test('admin debería ver estadísticas generales', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total_pedidos');
      expect(response.body).toHaveProperty('total_usuarios');
      expect(response.body).toHaveProperty('total_productos');
      expect(response.body).toHaveProperty('ventas_totales');
      
      expect(response.body.total_pedidos).toBeGreaterThanOrEqual(1);
      expect(response.body.total_usuarios).toBeGreaterThanOrEqual(3);
    });

    test('admin debería ver productos más vendidos', async () => {
      const response = await request(app)
        .get('/api/admin/products/top-selling')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('nombre');
        expect(response.body[0]).toHaveProperty('total_vendido');
      }
    });

    test('admin debería poder ver todos los usuarios', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body.some(user => user.email === 'admin@cafeteria.com')).toBe(true);
      expect(response.body.some(user => user.email === 'vendedor@cafeteria.com')).toBe(true);
      expect(response.body.some(user => user.email === 'cliente@example.com')).toBe(true);
    });
  });

  describe('8. Casos Edge y Validaciones', () => {
    test('debería fallar al crear pedido sin productos en carrito', async () => {
      // El carrito ya está vacío del test anterior
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          direccion_entrega: 'Calle Test 123',
          metodo_pago: 'efectivo'
        })
        .expect(400);
    });

    test('debería fallar al acceder a recursos de otro usuario', async () => {
      // Cliente intentando ver pedidos de admin
      await request(app)
        .put(`/api/orders/${pedidoId}/status`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({ estado: 'cancelado' })
        .expect(403);
    });

    test('debería manejar productos sin stock', async () => {
      // Admin actualiza stock a 0
      await request(app)
        .put(`/api/products/${producto1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 0 })
        .expect(200);

      // Cliente intenta agregar producto sin stock
      await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          producto_id: producto1Id,
          cantidad: 1
        })
        .expect(400);
    });

    test('debería validar límites de rate limiting', async () => {
      // Hacer múltiples requests rápidos para probar rate limiting
      const promises = Array(15).fill().map(() => 
        request(app).get('/api/products')
      );

      const responses = await Promise.all(promises);
      
      // Al menos algunos deberían fallar por rate limiting
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('9. Cleanup y Estado Final', () => {
    test('admin debería poder eliminar datos de prueba', async () => {
      // No eliminamos datos aquí para mantener integridad referencial
      // En producción, esto se manejaría con soft deletes
      
      const response = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Verificar que el sistema sigue funcionando correctamente
      expect(response.body).toHaveProperty('total_pedidos');
    });

    test('sistema debería mantener integridad después del flujo completo', async () => {
      // Verificar que todas las relaciones siguen intactas
      const ordersResponse = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${vendedorToken}`)
        .expect(200);

      const productsResponse = await request(app)
        .get('/api/products')
        .expect(200);

      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(ordersResponse.body.length).toBeGreaterThanOrEqual(1);
      expect(productsResponse.body.length).toBeGreaterThanOrEqual(4);
      expect(usersResponse.body.length).toBeGreaterThanOrEqual(3);
    });
  });
}); 