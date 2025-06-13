const jwt = require('jsonwebtoken');
const { authMiddleware, requireRole } = require('../../src/middlewares/auth.middleware');
const { Usuario, Rol } = require('../../src/models');

describe('Auth Middleware', () => {
  let req, res, next;
  let testUser, adminUser;
  let validToken, invalidToken, expiredToken;

  beforeEach(async () => {
    // Limpiar base de datos
    await Usuario.destroy({ where: {} });
    await Rol.destroy({ where: {} });

    // Crear roles
    await Rol.bulkCreate([
      { id: 1, nombre: 'administrador' },
      { id: 2, nombre: 'cliente' },
      { id: 3, nombre: 'vendedor' }
    ]);

    // Crear usuarios de prueba
    testUser = await Usuario.create({
      nombre: 'Test',
      apellido: 'User',
      email: 'test@test.com',
      password: 'password123',
      telefono: '1234567890',
      rol_id: 2
    });

    adminUser = await Usuario.create({
      nombre: 'Admin',
      apellido: 'User',
      email: 'admin@test.com',
      password: 'password123',
      telefono: '1234567891',
      rol_id: 1
    });

    // Crear tokens
    validToken = jwt.sign(
      { userId: testUser.id, role: 'cliente' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '1h' }
    );

    invalidToken = 'invalid.token.here';
    
    expiredToken = jwt.sign(
      { userId: testUser.id, role: 'cliente' },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn: '-1h' } // Token expirado
    );

    // Mock de request, response, next
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

  describe('authMiddleware', () => {
    test('debería autenticar con token válido', async () => {
      req.headers.authorization = `Bearer ${validToken}`;

      await authMiddleware(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(testUser.id);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('debería fallar sin token', async () => {
      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Token de acceso requerido' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería fallar con token inválido', async () => {
      req.headers.authorization = `Bearer ${invalidToken}`;

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Token inválido' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería fallar con token expirado', async () => {
      req.headers.authorization = `Bearer ${expiredToken}`;

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Token expirado' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería fallar con formato de Authorization incorrecto', async () => {
      req.headers.authorization = validToken; // Sin "Bearer "

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Token de acceso requerido' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería fallar si el usuario no existe', async () => {
      const tokenWithInvalidUser = jwt.sign(
        { userId: 999, role: 'cliente' },
        process.env.JWT_SECRET || 'test_secret'
      );
      
      req.headers.authorization = `Bearer ${tokenWithInvalidUser}`;

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Usuario no encontrado' 
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      req.user = {
        id: testUser.id,
        role: 'cliente'
      };
    });

    test('debería permitir acceso con rol correcto', () => {
      const middleware = requireRole(['cliente']);
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('debería permitir acceso con múltiples roles válidos', () => {
      const middleware = requireRole(['administrador', 'cliente']);
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('debería denegar acceso con rol incorrecto', () => {
      const middleware = requireRole(['administrador']);
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Acceso denegado. Rol insuficiente' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debería fallar si no hay usuario en req', () => {
      req.user = null;
      const middleware = requireRole(['cliente']);
      
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ 
        error: 'Usuario no autenticado' 
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('administrador debería tener acceso a todo', () => {
      req.user.role = 'administrador';
      const middleware = requireRole(['vendedor']);
      
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Combinación de middlewares', () => {
    test('debería funcionar auth + requireRole juntos', async () => {
      const adminToken = jwt.sign(
        { userId: adminUser.id, role: 'administrador' },
        process.env.JWT_SECRET || 'test_secret'
      );
      
      req.headers.authorization = `Bearer ${adminToken}`;

      // Simular middleware chain
      await authMiddleware(req, res, next);
      
      if (next.mock.calls.length > 0) {
        const roleMiddleware = requireRole(['administrador']);
        roleMiddleware(req, res, next);
      }

      expect(next).toHaveBeenCalledTimes(2);
      expect(req.user.role).toBe('administrador');
    });
  });
}); 