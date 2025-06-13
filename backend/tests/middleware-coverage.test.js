const jwt = require('jsonwebtoken');
const authMiddleware = require('../src/middlewares/auth.middleware');
const validationMiddleware = require('../src/middlewares/validation.middleware');
const vendedorMiddleware = require('../src/middlewares/vendedor.middleware');

describe('Tests de Middlewares - Coverage Boost', () => {
  
  describe('AuthMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        headers: {},
        user: null
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('verificarToken - sin token debería devolver 401', () => {
      authMiddleware.verificarToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Acceso denegado. Token no proporcionado.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('verificarToken - con token inválido debería devolver 401', () => {
      req.headers.authorization = 'Bearer invalid-token';
      
      authMiddleware.verificarToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Token inválido.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('verificarToken - con token válido debería continuar', () => {
      const token = jwt.sign(
        { id: 1, email: 'test@test.com' },
        process.env.JWT_SECRET || 'test-secret'
      );
      req.headers.authorization = `Bearer ${token}`;
      
      authMiddleware.verificarToken(req, res, next);
      
      expect(req.user).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    test('verificarAdmin - sin usuario debería devolver 403', () => {
      authMiddleware.verificarAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    });

    test('verificarAdmin - usuario sin rol admin debería devolver 403', () => {
      req.user = { id: 1, roles: [{ nombre: 'cliente' }] };
      
      authMiddleware.verificarAdmin(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test('verificarAdmin - usuario admin debería continuar', () => {
      req.user = { id: 1, roles: [{ nombre: 'admin' }] };
      
      authMiddleware.verificarAdmin(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('verificarVendedor - sin usuario debería devolver 403', () => {
      authMiddleware.verificarVendedor(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('verificarVendedor - usuario vendedor debería continuar', () => {
      req.user = { id: 1, roles: [{ nombre: 'vendedor' }] };
      
      authMiddleware.verificarVendedor(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('verificarPropietario - sin usuario debería devolver 403', () => {
      req.params = { id: '1' };
      
      authMiddleware.verificarPropietario(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('verificarPropietario - propietario válido debería continuar', () => {
      req.user = { id: 1 };
      req.params = { id: '1' };
      
      authMiddleware.verificarPropietario(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('verificarPropietario - no propietario debería devolver 403', () => {
      req.user = { id: 1 };
      req.params = { id: '2' };
      
      authMiddleware.verificarPropietario(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('ValidationMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        body: {},
        params: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('validarRegistroUsuario - datos válidos debería continuar', () => {
      req.body = {
        nombre: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      };
      
      validationMiddleware.validarRegistroUsuario(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('validarRegistroUsuario - sin nombre debería devolver 400', () => {
      req.body = {
        email: 'test@test.com',
        password: 'password123'
      };
      
      validationMiddleware.validarRegistroUsuario(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    test('validarRegistroUsuario - email inválido debería devolver 400', () => {
      req.body = {
        nombre: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };
      
      validationMiddleware.validarRegistroUsuario(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('validarLoginUsuario - datos válidos debería continuar', () => {
      req.body = {
        email: 'test@test.com',
        password: 'password123'
      };
      
      validationMiddleware.validarLoginUsuario(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('validarLoginUsuario - sin email debería devolver 400', () => {
      req.body = {
        password: 'password123'
      };
      
      validationMiddleware.validarLoginUsuario(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('validarProducto - datos válidos debería continuar', () => {
      req.body = {
        nombre: 'Test Product',
        precio: 100,
        categoria_id: 1
      };
      
      validationMiddleware.validarProducto(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('validarProducto - precio inválido debería devolver 400', () => {
      req.body = {
        nombre: 'Test Product',
        precio: -10,
        categoria_id: 1
      };
      
      validationMiddleware.validarProducto(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('validarPedido - datos válidos debería continuar', () => {
      req.body = {
        mesa_id: 1,
        metodo_pago_id: 1
      };
      
      validationMiddleware.validarPedido(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('validarId - ID válido debería continuar', () => {
      req.params = { id: '123' };
      
      validationMiddleware.validarId(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('validarId - ID inválido debería devolver 400', () => {
      req.params = { id: 'invalid' };
      
      validationMiddleware.validarId(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('VendedorMiddleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        user: null
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('verificarVendedor - sin usuario debería devolver 403', () => {
      vendedorMiddleware.verificarVendedor(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: 'Acceso denegado. Se requieren permisos de vendedor.'
      });
    });

    test('verificarVendedor - usuario sin rol vendedor debería devolver 403', () => {
      req.user = { id: 1, roles: [{ nombre: 'cliente' }] };
      
      vendedorMiddleware.verificarVendedor(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('verificarVendedor - usuario vendedor debería continuar', () => {
      req.user = { id: 1, roles: [{ nombre: 'vendedor' }] };
      
      vendedorMiddleware.verificarVendedor(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    test('verificarVendedor - usuario admin debería continuar', () => {
      req.user = { id: 1, roles: [{ nombre: 'admin' }] };
      
      vendedorMiddleware.verificarVendedor(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
}); 