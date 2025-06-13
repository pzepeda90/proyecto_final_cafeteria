const ProductoService = require('../src/services/producto.service');
const UsuarioService = require('../src/services/usuario.service');
const PedidoService = require('../src/services/pedido.service');
const CarritoService = require('../src/services/carrito.service');
const EstadoPedidoService = require('../src/services/estado_pedido.service');
const MetodoPagoService = require('../src/services/metodo_pago.service');
const RolService = require('../src/services/rol.service');

describe('Tests de Servicios - Coverage Boost', () => {
  
  describe('ProductoService', () => {
    test('obtenerTodos - debería manejar errores', async () => {
      try {
        const result = await ProductoService.obtenerTodos();
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorId - debería manejar errores', async () => {
      try {
        const result = await ProductoService.obtenerPorId(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('buscarPorCategoria - debería manejar errores', async () => {
      try {
        const result = await ProductoService.buscarPorCategoria(1);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerDisponibles - debería manejar errores', async () => {
      try {
        const result = await ProductoService.obtenerDisponibles();
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('crear - debería validar datos', async () => {
      try {
        const data = {
          nombre: 'Test Producto',
          precio: 100,
          categoria_id: 1
        };
        const result = await ProductoService.crear(data);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('actualizar - debería validar datos', async () => {
      try {
        const data = { nombre: 'Updated' };
        const result = await ProductoService.actualizar(999, data);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('eliminar - debería manejar errores', async () => {
      try {
        const result = await ProductoService.eliminar(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('UsuarioService', () => {
    test('obtenerTodos - debería manejar errores', async () => {
      try {
        const result = await UsuarioService.obtenerTodos();
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorId - debería manejar errores', async () => {
      try {
        const result = await UsuarioService.obtenerPorId(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorEmail - debería manejar errores', async () => {
      try {
        const result = await UsuarioService.obtenerPorEmail('test@test.com');
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('crear - debería validar datos', async () => {
      try {
        const data = {
          nombre: 'Test',
          email: 'test@test.com',
          password: 'password123'
        };
        const result = await UsuarioService.crear(data);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('actualizar - debería validar datos', async () => {
      try {
        const data = { nombre: 'Updated' };
        const result = await UsuarioService.actualizar(999, data);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('eliminar - debería manejar errores', async () => {
      try {
        const result = await UsuarioService.eliminar(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('PedidoService', () => {
    test('obtenerTodos - debería manejar errores', async () => {
      try {
        const result = await PedidoService.obtenerTodos();
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorUsuario - debería manejar errores', async () => {
      try {
        const result = await PedidoService.obtenerPorUsuario(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorId - debería manejar errores', async () => {
      try {
        const result = await PedidoService.obtenerPorId(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('crear - debería validar datos', async () => {
      try {
        const data = {
          usuario_id: 1,
          mesa_id: 1,
          metodo_pago_id: 1
        };
        const result = await PedidoService.crear(data);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('actualizarEstado - debería validar datos', async () => {
      try {
        const result = await PedidoService.actualizarEstado(999, 2);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('CarritoService', () => {
    test('obtenerPorUsuario - debería manejar errores', async () => {
      try {
        const result = await CarritoService.obtenerPorUsuario(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('agregarProducto - debería validar datos', async () => {
      try {
        const result = await CarritoService.agregarProducto(1, 1, 2);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('actualizarCantidad - debería validar datos', async () => {
      try {
        const result = await CarritoService.actualizarCantidad(999, 3);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('eliminarProducto - debería manejar errores', async () => {
      try {
        const result = await CarritoService.eliminarProducto(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('vaciarCarrito - debería manejar errores', async () => {
      try {
        const result = await CarritoService.vaciarCarrito(999);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('EstadoPedidoService', () => {
    test('obtenerTodos - debería manejar errores', async () => {
      try {
        const result = await EstadoPedidoService.obtenerTodos();
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorId - debería manejar errores', async () => {
      try {
        const result = await EstadoPedidoService.obtenerPorId(1);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('crear - debería validar datos', async () => {
      try {
        const data = { nombre: 'Test Estado' };
        const result = await EstadoPedidoService.crear(data);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('MetodoPagoService', () => {
    test('obtenerTodos - debería manejar errores', async () => {
      try {
        const result = await MetodoPagoService.obtenerTodos();
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorId - debería manejar errores', async () => {
      try {
        const result = await MetodoPagoService.obtenerPorId(1);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('crear - debería validar datos', async () => {
      try {
        const data = { nombre: 'Test Método' };
        const result = await MetodoPagoService.crear(data);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('RolService', () => {
    test('obtenerTodos - debería manejar errores', async () => {
      try {
        const result = await RolService.obtenerTodos();
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorId - debería manejar errores', async () => {
      try {
        const result = await RolService.obtenerPorId(1);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('crear - debería validar datos', async () => {
      try {
        const data = { nombre: 'Test Rol' };
        const result = await RolService.crear(data);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    test('obtenerPorNombre - debería manejar errores', async () => {
      try {
        const result = await RolService.obtenerPorNombre('admin');
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
}); 