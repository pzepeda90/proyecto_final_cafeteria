const { validationResult, body, param } = require('express-validator');
const { HTTP_STATUS } = require('../utils/constants');
const Joi = require('joi');

// Middleware para validar los resultados de la validación
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: 'error',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Validaciones para usuarios
const validateUserRegistration = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/).withMessage('El nombre solo debe contener letras y espacios'),
  body('apellido')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/).withMessage('El apellido solo debe contener letras y espacios'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .trim()
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'),
  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es requerido')
    .matches(/^\+?[0-9]{8,15}$/).withMessage('El teléfono debe ser válido (8-15 dígitos)'),
  body('fecha_nacimiento')
    .trim()
    .notEmpty().withMessage('La fecha de nacimiento es requerida')
    .isDate().withMessage('La fecha de nacimiento debe ser válida')
    .custom(value => {
      const date = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - date.getFullYear();
      if (age < 18) {
        throw new Error('Debes ser mayor de 18 años');
      }
      return true;
    }),
  body('rol_id')
    .optional()
    .isInt().withMessage('El rol debe ser un ID válido'),
  validateRequest
];

// Validaciones para productos
const validateProduct = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10, max: 1000 }).withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('precio')
    .notEmpty().withMessage('El precio es requerido')
    .isFloat({ min: 0.01 }).withMessage('El precio debe ser un número positivo mayor a 0'),
  body('stock')
    .notEmpty().withMessage('El stock es requerido')
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo o cero'),
  body('categoria_id')
    .notEmpty().withMessage('La categoría es requerida')
    .isInt().withMessage('La categoría debe ser un ID válido'),
  body('vendedor_id')
    .notEmpty().withMessage('El vendedor es requerido')
    .isInt().withMessage('El vendedor debe ser un ID válido'),
  body('disponible')
    .optional()
    .isBoolean().withMessage('Disponible debe ser un valor booleano'),
  body('imagen_url')
    .optional()
    .isURL().withMessage('La URL de la imagen debe ser válida'),
  body('imagenes_adicionales')
    .optional()
    .isArray().withMessage('Las imágenes adicionales deben ser un array'),
  body('imagenes_adicionales.*.url')
    .optional()
    .isURL().withMessage('La URL de la imagen debe ser válida'),
  body('imagenes_adicionales.*.descripcion')
    .optional()
    .isString().withMessage('La descripción debe ser un texto'),
  body('imagenes_adicionales.*.orden')
    .optional()
    .isInt({ min: 1 }).withMessage('El orden debe ser un número entero positivo'),
  validateRequest
];

// Validaciones para pedidos
const validateOrder = [
  body('usuario_id')
    .notEmpty().withMessage('El usuario es requerido')
    .isInt().withMessage('El usuario debe ser un ID válido'),
  body('metodo_pago_id')
    .notEmpty().withMessage('El método de pago es requerido')
    .isInt().withMessage('El método de pago debe ser un ID válido'),
  body('direccion_id')
    .notEmpty().withMessage('La dirección es requerida')
    .isInt().withMessage('La dirección debe ser un ID válido'),
  body('carrito_id')
    .notEmpty().withMessage('El carrito es requerido')
    .isInt().withMessage('El carrito debe ser un ID válido'),
  body('subtotal')
    .notEmpty().withMessage('El subtotal es requerido')
    .isFloat({ min: 0 }).withMessage('El subtotal debe ser un número positivo'),
  body('impuestos')
    .notEmpty().withMessage('Los impuestos son requeridos')
    .isFloat({ min: 0 }).withMessage('Los impuestos deben ser un número positivo o cero'),
  body('total')
    .notEmpty().withMessage('El total es requerido')
    .isFloat({ min: 0 }).withMessage('El total debe ser un número positivo'),
  validateRequest
];

// Validaciones para reseñas
const validateReview = [
  body('usuario_id')
    .notEmpty().withMessage('El usuario es requerido')
    .isInt().withMessage('El usuario debe ser un ID válido'),
  body('producto_id')
    .notEmpty().withMessage('El producto es requerido')
    .isInt().withMessage('El producto debe ser un ID válido'),
  body('calificacion')
    .notEmpty().withMessage('La calificación es requerida')
    .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
  body('comentario')
    .trim()
    .notEmpty().withMessage('El comentario es requerido')
    .isLength({ min: 10, max: 500 }).withMessage('El comentario debe tener entre 10 y 500 caracteres'),
  validateRequest
];

// Validaciones para direcciones
const validateAddress = [
  body('usuario_id')
    .notEmpty().withMessage('El usuario es requerido')
    .isInt().withMessage('El usuario debe ser un ID válido'),
  body('calle')
    .trim()
    .notEmpty().withMessage('La calle es requerida')
    .isLength({ min: 3, max: 255 }).withMessage('La calle debe tener entre 3 y 255 caracteres'),
  body('numero')
    .trim()
    .notEmpty().withMessage('El número es requerido')
    .isLength({ min: 1, max: 50 }).withMessage('El número debe tener entre 1 y 50 caracteres'),
  body('ciudad')
    .trim()
    .notEmpty().withMessage('La ciudad es requerida')
    .isLength({ min: 2, max: 100 }).withMessage('La ciudad debe tener entre 2 y 100 caracteres'),
  body('comuna')
    .trim()
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('La comuna debe tener entre 2 y 100 caracteres'),
  body('codigo_postal')
    .trim()
    .optional()
    .isLength({ min: 3, max: 20 }).withMessage('El código postal debe tener entre 3 y 20 caracteres'),
  body('pais')
    .trim()
    .notEmpty().withMessage('El país es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El país debe tener entre 2 y 50 caracteres'),
  body('principal')
    .optional()
    .isBoolean().withMessage('Principal debe ser un valor booleano'),
  validateRequest
];

// Validaciones para historial de estados
const validateHistorialEstado = [
  body('pedido_id')
    .notEmpty().withMessage('El pedido es requerido')
    .isInt().withMessage('El pedido debe ser un ID válido'),
  body('estado_pedido_id')
    .notEmpty().withMessage('El estado es requerido')
    .isInt().withMessage('El estado debe ser un ID válido'),
  body('comentario')
    .optional()
    .isString().withMessage('El comentario debe ser texto'),
  validateRequest
];

// Validaciones para roles
const validateRole = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('descripcion')
    .trim()
    .optional()
    .isLength({ max: 255 }).withMessage('La descripción no debe exceder 255 caracteres'),
  validateRequest
];

// Validaciones para imágenes de producto
const validateProductImage = [
  body('producto_id')
    .notEmpty().withMessage('El producto es requerido')
    .isInt().withMessage('El producto debe ser un ID válido'),
  body('url')
    .trim()
    .notEmpty().withMessage('La URL es requerida')
    .isURL().withMessage('Debe ser una URL válida'),
  body('descripcion')
    .trim()
    .optional()
    .isLength({ max: 255 }).withMessage('La descripción no debe exceder 255 caracteres'),
  body('orden')
    .optional()
    .isInt({ min: 1 }).withMessage('El orden debe ser un número entero positivo'),
  validateRequest
];

// Validaciones para parámetros de URL
const validateId = [
  param('id')
    .isInt().withMessage('El ID debe ser un número entero válido'),
  validateRequest
];

// Validaciones para usuarios
const registroUsuarioSchema = Joi.object({
  nombre: Joi.string().min(2).max(50).required()
    .messages({
      'any.required': 'El nombre es obligatorio',
      'string.min': 'El nombre debe tener al menos {#limit} caracteres',
      'string.max': 'El nombre no debe exceder {#limit} caracteres'
    }),
  apellido: Joi.string().min(2).max(50).required()
    .messages({
      'any.required': 'El apellido es obligatorio',
      'string.min': 'El apellido debe tener al menos {#limit} caracteres',
      'string.max': 'El apellido no debe exceder {#limit} caracteres'
    }),
  email: Joi.string().email().required()
    .messages({
      'any.required': 'El email es obligatorio',
      'string.email': 'Debe proporcionar un email válido'
    }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required()
    .messages({
      'any.required': 'La contraseña es obligatoria',
      'string.min': 'La contraseña debe tener al menos {#limit} caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial'
    }),
  telefono: Joi.string().pattern(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/).allow('', null)
    .messages({
      'string.pattern.base': 'El formato del teléfono no es válido'
    }),
  fecha_nacimiento: Joi.date().max('now').allow(null)
    .messages({
      'date.max': 'La fecha de nacimiento no puede ser en el futuro'
    })
});

// Validación para direcciones
const direccionSchema = Joi.object({
  calle: Joi.string().required()
    .messages({
      'any.required': 'La calle es obligatoria'
    }),
  numero: Joi.string().required()
    .messages({
      'any.required': 'El número es obligatorio'
    }),
  ciudad: Joi.string().required()
    .messages({
      'any.required': 'La ciudad es obligatoria'
    }),
  comuna: Joi.string().required()
    .messages({
      'any.required': 'La comuna es obligatoria'
    }),
  codigo_postal: Joi.string().required()
    .messages({
      'any.required': 'El código postal es obligatorio'
    }),
  pais: Joi.string().required()
    .messages({
      'any.required': 'El país es obligatorio'
    }),
  principal: Joi.boolean().default(false)
});

// Validación para reseñas
const resenaSchema = Joi.object({
  producto_id: Joi.number().integer().positive().required()
    .messages({
      'any.required': 'El ID del producto es obligatorio',
      'number.base': 'El ID del producto debe ser un número',
      'number.integer': 'El ID del producto debe ser un número entero',
      'number.positive': 'El ID del producto debe ser un número positivo'
    }),
  titulo: Joi.string().min(3).max(100).required()
    .messages({
      'any.required': 'El título es obligatorio',
      'string.min': 'El título debe tener al menos {#limit} caracteres',
      'string.max': 'El título no debe exceder {#limit} caracteres'
    }),
  comentario: Joi.string().min(10).max(1000).required()
    .messages({
      'any.required': 'El comentario es obligatorio',
      'string.min': 'El comentario debe tener al menos {#limit} caracteres',
      'string.max': 'El comentario no debe exceder {#limit} caracteres'
    }),
  calificacion: Joi.number().integer().min(1).max(5).required()
    .messages({
      'any.required': 'La calificación es obligatoria',
      'number.base': 'La calificación debe ser un número',
      'number.integer': 'La calificación debe ser un número entero',
      'number.min': 'La calificación mínima es 1',
      'number.max': 'La calificación máxima es 5'
    })
});

// Validación para carrito
const agregarAlCarritoSchema = Joi.object({
  producto_id: Joi.number().integer().positive().required()
    .messages({
      'any.required': 'El ID del producto es obligatorio',
      'number.base': 'El ID del producto debe ser un número',
      'number.integer': 'El ID del producto debe ser un número entero',
      'number.positive': 'El ID del producto debe ser un número positivo'
    }),
  cantidad: Joi.number().integer().min(1).required()
    .messages({
      'any.required': 'La cantidad es obligatoria',
      'number.base': 'La cantidad debe ser un número',
      'number.integer': 'La cantidad debe ser un número entero',
      'number.min': 'La cantidad mínima es 1'
    })
});

// Validación para pedidos
const crearPedidoSchema = Joi.object({
  direccion_id: Joi.number().integer().positive().required()
    .messages({
      'any.required': 'La dirección es obligatoria',
      'number.base': 'El ID de la dirección debe ser un número',
      'number.integer': 'El ID de la dirección debe ser un número entero',
      'number.positive': 'El ID de la dirección debe ser un número positivo'
    }),
  metodo_pago_id: Joi.number().integer().positive().required()
    .messages({
      'any.required': 'El método de pago es obligatorio',
      'number.base': 'El ID del método de pago debe ser un número',
      'number.integer': 'El ID del método de pago debe ser un número entero',
      'number.positive': 'El ID del método de pago debe ser un número positivo'
    }),
  observaciones: Joi.string().allow('', null)
});

// Middleware para validar según el esquema
const validarCuerpo = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errores = error.details.map(detail => ({
        campo: detail.context.key,
        mensaje: detail.message
      }));
      
      return res.status(400).json({
        status: 'error',
        message: 'Error de validación',
        errores
      });
    }
    
    // Reemplaza los valores con los validados
    req.body = value;
    next();
  };
};

module.exports = {
  validateRequest,
  validateUserRegistration,
  validateProduct,
  validateOrder,
  validateReview,
  validateAddress,
  validateHistorialEstado,
  validateRole,
  validateProductImage,
  validateId,
  validarRegistroUsuario: validarCuerpo(registroUsuarioSchema),
  validarDireccion: validarCuerpo(direccionSchema),
  validarResena: validarCuerpo(resenaSchema),
  validarAgregarAlCarrito: validarCuerpo(agregarAlCarritoSchema),
  validarCrearPedido: validarCuerpo(crearPedidoSchema)
}; 