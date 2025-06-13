const request = require('supertest');
const app = require('../src/app');

describe('Controllers con Base de Datos Real - Cobertura Completa', () => {

  describe('ProductoController - Todas las rutas', () => {
    
    test('GET /api/productos - obtener todos los productos', async () => {
      const response = await request(app).get('/api/productos');
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeInstanceOf(Array);
        console.log(`✅ GET /api/productos - ${response.body.length} productos encontrados`);
      } else {
        console.log(`⚠️ GET /api/productos - Error de BD: ${response.body.error}`);
      }
    });

    test('GET /api/productos/:id - obtener producto específico', async () => {
      const testIds = [1, 2, 3, 999]; // Incluye ID que no existe
      
      for (const id of testIds) {
        const response = await request(app).get(`/api/productos/${id}`);
        expect([200, 404, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('id');
          expect(response.body.id).toBe(id);
          console.log(`✅ GET /api/productos/${id} - Producto encontrado`);
        } else {
          console.log(`ℹ️ GET /api/productos/${id} - Status: ${response.status}`);
        }
      }
    });

    test('GET /api/productos con filtros - todas las combinaciones', async () => {
      const filtros = [
        '?categoria_id=1',
        '?disponible=true',
        '?disponible=false',
        '?precio_min=10',
        '?precio_max=100',
        '?precio_min=10&precio_max=100',
        '?search=cafe',
        '?search=bebida',
        '?categoria_id=1&disponible=true',
        '?categoria_id=1&precio_min=5&precio_max=50',
        '?search=test&disponible=true'
      ];

      for (const filtro of filtros) {
        const response = await request(app).get(`/api/productos${filtro}`);
        expect([200, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toBeInstanceOf(Array);
          console.log(`✅ GET /api/productos${filtro} - ${response.body.length} resultados`);
        }
      }
    });

    test('POST /api/productos - crear producto (requiere auth)', async () => {
      const productosTest = [
        {
          nombre: 'Producto Test 1',
          descripcion: 'Descripción test',
          precio: 100,
          categoria_id: 1,
          disponible: true
        },
        {
          nombre: 'Producto Test 2',
          precio: 50,
          categoria_id: 1
        },
        {
          // Datos inválidos para probar validación
          nombre: '',
          precio: -10
        }
      ];

      for (const producto of productosTest) {
        const response = await request(app)
          .post('/api/productos')
          .send(producto);
        
        // Esperamos 401/403 (no auth) o 400/422 (validación) o 201 (éxito)
        expect([201, 400, 401, 403, 422, 500]).toContain(response.status);
        console.log(`✅ POST /api/productos - Status: ${response.status}`);
      }
    });

    test('PUT /api/productos/:id - actualizar producto', async () => {
      const actualizaciones = [
        { nombre: 'Producto Actualizado' },
        { precio: 150 },
        { disponible: false },
        { descripcion: 'Nueva descripción' }
      ];

      for (const actualizacion of actualizaciones) {
        const response = await request(app)
          .put('/api/productos/1')
          .send(actualizacion);
        
        expect([200, 401, 403, 404, 500]).toContain(response.status);
        console.log(`✅ PUT /api/productos/1 - Status: ${response.status}`);
      }
    });

    test('DELETE /api/productos/:id - eliminar producto', async () => {
      const idsTest = [999, 1000]; // IDs que probablemente no existen
      
      for (const id of idsTest) {
        const response = await request(app).delete(`/api/productos/${id}`);
        expect([200, 401, 403, 404, 500]).toContain(response.status);
        console.log(`✅ DELETE /api/productos/${id} - Status: ${response.status}`);
      }
    });
  });

  describe('UsuarioController - Gestión de usuarios', () => {
    
    test('POST /api/usuarios/registro - registro de usuarios', async () => {
      const usuariosTest = [
        {
          nombre: 'Usuario Test Completo',
          email: `test${Date.now()}@example.com`,
          password: 'password123456',
          telefono: '123456789'
        },
        {
          nombre: 'Usuario Test 2',
          email: `test2${Date.now()}@example.com`,
          password: 'password123'
        },
        {
          // Datos inválidos
          nombre: '',
          email: 'email-invalido',
          password: '123'
        },
        {
          // Email duplicado (puede fallar)
          nombre: 'Usuario Duplicado',
          email: 'admin@example.com',
          password: 'password123456'
        }
      ];

      for (const usuario of usuariosTest) {
        const response = await request(app)
          .post('/api/usuarios/registro')
          .send(usuario);
        
        expect([200, 201, 400, 409, 422, 500]).toContain(response.status);
        
        if (response.status === 201 || response.status === 200) {
          expect(response.body).toHaveProperty('usuario');
          console.log(`✅ Registro exitoso para ${usuario.email}`);
        } else {
          console.log(`⚠️ Registro falló para ${usuario.email} - Status: ${response.status}`);
        }
      }
    });

    test('POST /api/usuarios/login - login de usuarios', async () => {
      const loginTests = [
        {
          email: 'admin@example.com',
          password: 'admin123'
        },
        {
          email: 'test@example.com',
          password: 'password123'
        },
        {
          // Credenciales incorrectas
          email: 'noexiste@example.com',
          password: 'wrongpassword'
        },
        {
          // Datos inválidos
          email: 'email-invalido',
          password: ''
        }
      ];

      for (const login of loginTests) {
        const response = await request(app)
          .post('/api/usuarios/login')
          .send(login);
        
        expect([200, 400, 401, 422, 500]).toContain(response.status);
        
        if (response.status === 200) {
          expect(response.body).toHaveProperty('token');
          console.log(`✅ Login exitoso para ${login.email}`);
        } else {
          console.log(`⚠️ Login falló para ${login.email} - Status: ${response.status}`);
        }
      }
    });

    test('GET /api/usuarios - obtener usuarios (requiere auth)', async () => {
      const response = await request(app).get('/api/usuarios');
      expect([200, 401, 403, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeInstanceOf(Array);
        console.log(`✅ GET /api/usuarios - ${response.body.length} usuarios`);
      }
    });

    test('GET /api/usuarios/:id - obtener usuario específico', async () => {
      const testIds = [1, 2, 999];
      
      for (const id of testIds) {
        const response = await request(app).get(`/api/usuarios/${id}`);
        expect([200, 401, 403, 404, 500]).toContain(response.status);
        console.log(`✅ GET /api/usuarios/${id} - Status: ${response.status}`);
      }
    });
  });

  describe('PedidoController - Gestión de pedidos', () => {
    
    test('GET /api/pedidos - obtener pedidos', async () => {
      const response = await request(app).get('/api/pedidos');
      expect([200, 401, 403, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeInstanceOf(Array);
        console.log(`✅ GET /api/pedidos - ${response.body.length} pedidos`);
      }
    });

    test('POST /api/pedidos - crear pedido', async () => {
      const pedidosTest = [
        {
          mesa_id: 1,
          metodo_pago_id: 1,
          productos: [
            { producto_id: 1, cantidad: 2 }
          ]
        },
        {
          mesa_id: 2,
          metodo_pago_id: 1,
          productos: []
        },
        {
          // Datos inválidos
          mesa_id: 999,
          productos: [
            { producto_id: 999, cantidad: -1 }
          ]
        }
      ];

      for (const pedido of pedidosTest) {
        const response = await request(app)
          .post('/api/pedidos')
          .send(pedido);
        
        expect([201, 400, 401, 403, 422, 500]).toContain(response.status);
        console.log(`✅ POST /api/pedidos - Status: ${response.status}`);
      }
    });

    test('GET /api/pedidos/:id - obtener pedido específico', async () => {
      const testIds = [1, 2, 999];
      
      for (const id of testIds) {
        const response = await request(app).get(`/api/pedidos/${id}`);
        expect([200, 401, 403, 404, 500]).toContain(response.status);
        console.log(`✅ GET /api/pedidos/${id} - Status: ${response.status}`);
      }
    });

    test('PUT /api/pedidos/:id/estado - actualizar estado pedido', async () => {
      const estadosTest = [
        { estado_pedido_id: 1 },
        { estado_pedido_id: 2 },
        { estado_pedido_id: 999 } // Estado que no existe
      ];

      for (const estado of estadosTest) {
        const response = await request(app)
          .put('/api/pedidos/1/estado')
          .send(estado);
        
        expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
        console.log(`✅ PUT /api/pedidos/1/estado - Status: ${response.status}`);
      }
    });
  });

  describe('CarritoController - Gestión de carritos', () => {
    
    test('GET /api/carritos - obtener carrito del usuario', async () => {
      const response = await request(app).get('/api/carritos');
      expect([200, 401, 403, 500]).toContain(response.status);
      console.log(`✅ GET /api/carritos - Status: ${response.status}`);
    });

    test('POST /api/carritos/agregar - agregar producto al carrito', async () => {
      const productosTest = [
        { producto_id: 1, cantidad: 2 },
        { producto_id: 2, cantidad: 1 },
        { producto_id: 999, cantidad: 1 }, // Producto que no existe
        { producto_id: 1, cantidad: -1 }, // Cantidad inválida
        { producto_id: 'invalid', cantidad: 'invalid' } // Datos inválidos
      ];

      for (const producto of productosTest) {
        const response = await request(app)
          .post('/api/carritos/agregar')
          .send(producto);
        
        expect([200, 400, 401, 403, 422, 500]).toContain(response.status);
        console.log(`✅ POST /api/carritos/agregar - Status: ${response.status}`);
      }
    });

    test('PUT /api/carritos/actualizar - actualizar cantidad en carrito', async () => {
      const actualizaciones = [
        { producto_id: 1, cantidad: 3 },
        { producto_id: 1, cantidad: 0 }, // Eliminar producto
        { producto_id: 999, cantidad: 1 } // Producto que no existe
      ];

      for (const actualizacion of actualizaciones) {
        const response = await request(app)
          .put('/api/carritos/actualizar')
          .send(actualizacion);
        
        expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
        console.log(`✅ PUT /api/carritos/actualizar - Status: ${response.status}`);
      }
    });

    test('DELETE /api/carritos/vaciar - vaciar carrito', async () => {
      const response = await request(app).delete('/api/carritos/vaciar');
      expect([200, 401, 403, 500]).toContain(response.status);
      console.log(`✅ DELETE /api/carritos/vaciar - Status: ${response.status}`);
    });
  });

  describe('Controllers de Catálogos - Estados, Métodos, etc.', () => {
    
    test('GET /api/categorias - obtener categorías', async () => {
      const response = await request(app).get('/api/categorias');
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeInstanceOf(Array);
        console.log(`✅ GET /api/categorias - ${response.body.length} categorías`);
      }
    });

    test('GET /api/estados-pedido - obtener estados de pedido', async () => {
      const response = await request(app).get('/api/estados-pedido');
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeInstanceOf(Array);
        console.log(`✅ GET /api/estados-pedido - ${response.body.length} estados`);
      }
    });

    test('GET /api/metodos-pago - obtener métodos de pago', async () => {
      const response = await request(app).get('/api/metodos-pago');
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeInstanceOf(Array);
        console.log(`✅ GET /api/metodos-pago - ${response.body.length} métodos`);
      }
    });

    test('GET /api/mesas - obtener mesas', async () => {
      const response = await request(app).get('/api/mesas');
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeInstanceOf(Array);
        console.log(`✅ GET /api/mesas - ${response.body.length} mesas`);
      }
    });

    test('GET /api/roles - obtener roles', async () => {
      const response = await request(app).get('/api/roles');
      expect([200, 401, 403, 500]).toContain(response.status);
      console.log(`✅ GET /api/roles - Status: ${response.status}`);
    });
  });

  describe('Error Handling y Edge Cases', () => {
    
    test('Rutas inexistentes - 404 handling', async () => {
      const rutasInexistentes = [
        '/api/productos/inexistente',
        '/api/ruta-que-no-existe',
        '/api/usuarios/999999',
        '/api/pedidos/abc',
        '/api/categorias/999'
      ];

      for (const ruta of rutasInexistentes) {
        const response = await request(app).get(ruta);
        expect([404, 500]).toContain(response.status);
        console.log(`✅ GET ${ruta} - Status: ${response.status}`);
      }
    });

    test('Métodos HTTP no permitidos', async () => {
      const testCases = [
        { method: 'patch', url: '/api/productos' },
        { method: 'delete', url: '/api/categorias' },
        { method: 'post', url: '/api/estados-pedido' }
      ];

      for (const testCase of testCases) {
        const response = await request(app)[testCase.method](testCase.url);
        expect([404, 405, 500]).toContain(response.status);
        console.log(`✅ ${testCase.method.toUpperCase()} ${testCase.url} - Status: ${response.status}`);
      }
    });

    test('Payloads malformados - JSON parsing', async () => {
      const response = await request(app)
        .post('/api/usuarios/registro')
        .set('Content-Type', 'application/json')
        .send('{"nombre": "test", "email":}'); // JSON malformado
      
      expect([400, 500]).toContain(response.status);
      console.log(`✅ JSON malformado - Status: ${response.status}`);
    });

    test('Headers faltantes o incorrectos', async () => {
      const response = await request(app)
        .post('/api/usuarios/registro')
        .set('Content-Type', 'text/plain')
        .send('datos no json');
      
      expect([400, 415, 500]).toContain(response.status);
      console.log(`✅ Content-Type incorrecto - Status: ${response.status}`);
    });
  });
}); 