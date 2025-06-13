const { validationResult } = require('express-validator');
const { 
  validateUsuario, 
  validateProducto, 
  validatePedido,
  handleValidationErrors 
} = require('../../src/middlewares/validation.middleware');

describe('Validation Middleware', () => {
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

  describe('handleValidationErrors', () => {
    test('debería pasar al siguiente middleware si no hay errores', () => {
      // Mock de validationResult sin errores
      const mockValidationResult = {
        isEmpty: () => true,
        array: () => []
      };
      
      // Sobrescribir validationResult temporalmente
      const originalValidationResult = require('express-validator').validationResult;
      require('express-validator').validationResult = jest.fn(() => mockValidationResult);

      handleValidationErrors(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();

      // Restaurar función original
      require('express-validator').validationResult = originalValidationResult;
    });

    test('debería retornar errores de validación', () => {
      const mockErrors = [
        { msg: 'El nombre es requerido', param: 'nombre' },
        { msg: 'El email debe ser válido', param: 'email' }
      ];

      const mockValidationResult = {
        isEmpty: () => false,
        array: () => mockErrors
      };

      const originalValidationResult = require('express-validator').validationResult;
      require('express-validator').validationResult = jest.fn(() => mockValidationResult);

      handleValidationErrors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Errores de validación',
        details: mockErrors
      });
      expect(next).not.toHaveBeenCalled();

      require('express-validator').validationResult = originalValidationResult;
    });
  });

  describe('validateUsuario', () => {
    test('debería validar datos correctos de usuario', async () => {
      req.body = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        password: 'password123',
        telefono: '1234567890',
        rol_id: 2
      };

      // Ejecutar todas las validaciones
      for (const validation of validateUsuario) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      // Si no hay errores, next debería haber sido llamado
      const result = validationResult(req);
      expect(result.isEmpty()).toBe(true);
    });

    test('debería fallar con email inválido', async () => {
      req.body = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'email-invalido',
        password: 'password123',
        telefono: '1234567890',
        rol_id: 2
      };

      for (const validation of validateUsuario) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      expect(errors.some(error => error.param === 'email')).toBe(true);
    });

    test('debería fallar con campos requeridos faltantes', async () => {
      req.body = {
        email: 'test@test.com'
        // Faltan campos requeridos
      };

      for (const validation of validateUsuario) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(error => error.param === 'nombre')).toBe(true);
      expect(errors.some(error => error.param === 'apellido')).toBe(true);
    });

    test('debería fallar con contraseña muy corta', async () => {
      req.body = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        password: '123', // Muy corta
        telefono: '1234567890',
        rol_id: 2
      };

      for (const validation of validateUsuario) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      expect(errors.some(error => error.param === 'password')).toBe(true);
    });
  });

  describe('validateProducto', () => {
    test('debería validar datos correctos de producto', async () => {
      req.body = {
        nombre: 'Café Americano',
        precio: 2.50,
        descripcion: 'Delicioso café negro',
        categoria: 'bebidas',
        stock: 100
      };

      for (const validation of validateProducto) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(true);
    });

    test('debería fallar con precio inválido', async () => {
      req.body = {
        nombre: 'Café Americano',
        precio: -1, // Precio negativo
        descripcion: 'Delicioso café negro',
        categoria: 'bebidas',
        stock: 100
      };

      for (const validation of validateProducto) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      expect(errors.some(error => error.param === 'precio')).toBe(true);
    });

    test('debería fallar con stock negativo', async () => {
      req.body = {
        nombre: 'Café Americano',
        precio: 2.50,
        descripcion: 'Delicioso café negro',
        categoria: 'bebidas',
        stock: -5 // Stock negativo
      };

      for (const validation of validateProducto) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      expect(errors.some(error => error.param === 'stock')).toBe(true);
    });
  });

  describe('validatePedido', () => {
    test('debería validar datos correctos de pedido', async () => {
      req.body = {
        direccion_entrega: 'Calle Test 123, Ciudad',
        metodo_pago: 'efectivo',
        notas: 'Sin azúcar'
      };

      for (const validation of validatePedido) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(true);
    });

    test('debería fallar sin dirección de entrega', async () => {
      req.body = {
        metodo_pago: 'efectivo'
        // Falta direccion_entrega
      };

      for (const validation of validatePedido) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      expect(errors.some(error => error.param === 'direccion_entrega')).toBe(true);
    });

    test('debería fallar con método de pago inválido', async () => {
      req.body = {
        direccion_entrega: 'Calle Test 123',
        metodo_pago: 'bitcoin' // Método no válido
      };

      for (const validation of validatePedido) {
        if (typeof validation === 'function') {
          await validation(req, res, next);
        }
      }

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(false);
      
      const errors = result.array();
      expect(errors.some(error => error.param === 'metodo_pago')).toBe(true);
    });
  });

  describe('Validaciones de parámetros', () => {
    test('debería validar IDs numéricos', async () => {
      req.params = { id: '123' };

      // Simular validación de ID
      const { param } = require('express-validator');
      const validateId = param('id').isInt({ min: 1 });
      
      await validateId(req, res, next);

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(true);
    });

    test('debería fallar con ID no numérico', async () => {
      req.params = { id: 'abc' };

      const { param } = require('express-validator');
      const validateId = param('id').isInt({ min: 1 });
      
      await validateId(req, res, next);

      const result = validationResult(req);
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('Sanitización de datos', () => {
    test('debería sanitizar strings', async () => {
      req.body = {
        nombre: '  Juan  ',
        apellido: '  Pérez  ',
        email: '  JUAN@TEST.COM  '
      };

      // Simular sanitización
      const { body } = require('express-validator');
      const sanitizeName = body('nombre').trim();
      const sanitizeLastName = body('apellido').trim();
      const sanitizeEmail = body('email').trim().toLowerCase();

      await sanitizeName(req, res, next);
      await sanitizeLastName(req, res, next);
      await sanitizeEmail(req, res, next);

      // Verificar que los datos fueron sanitizados
      expect(req.body.nombre).toBe('Juan');
      expect(req.body.apellido).toBe('Pérez');
      expect(req.body.email).toBe('juan@test.com');
    });

    test('debería escapar caracteres HTML', async () => {
      req.body = {
        descripcion: '<script>alert("xss")</script>Descripción normal'
      };

      const { body } = require('express-validator');
      const sanitizeDescription = body('descripcion').escape();

      await sanitizeDescription(req, res, next);

      expect(req.body.descripcion).not.toContain('<script>');
      expect(req.body.descripcion).not.toContain('</script>');
    });
  });
});