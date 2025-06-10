const ProductoService = require('../services/producto.service');
const UsuarioService = require('../services/usuario.service');
const Joi = require('joi');

// Esquema de validación para creación de producto
const productoSchema = Joi.object({
  categoria_id: Joi.number().integer().positive().required()
    .messages({
      'any.required': 'La categoría es obligatoria',
      'number.base': 'La categoría debe ser un número',
      'number.integer': 'La categoría debe ser un número entero',
      'number.positive': 'La categoría debe ser un número positivo'
    }),
  nombre: Joi.string().min(2).max(100).required()
    .messages({
      'any.required': 'El nombre del producto es obligatorio',
      'string.base': 'El nombre debe ser texto',
      'string.min': 'El nombre debe tener al menos {#limit} caracteres',
      'string.max': 'El nombre no debe exceder {#limit} caracteres'
    }),
  descripcion: Joi.string().allow('', null),
  precio: Joi.number().precision(2).positive().required()
    .messages({
      'any.required': 'El precio es obligatorio',
      'number.base': 'El precio debe ser un número',
      'number.positive': 'El precio debe ser un valor positivo'
    }),
  imagen_url: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'La URL de la imagen debe ser válida'
    }),
  stock: Joi.number().integer().min(0).default(0)
    .messages({
      'number.base': 'El stock debe ser un número',
      'number.integer': 'El stock debe ser un número entero',
      'number.min': 'El stock no puede ser negativo'
    }),
  disponible: Joi.boolean().default(true),
  vendedor_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'El ID del vendedor debe ser un número',
      'number.integer': 'El ID del vendedor debe ser un número entero',
      'number.positive': 'El ID del vendedor debe ser un número positivo'
    }),
  imagenes_adicionales: Joi.array().items(
    Joi.string().uri()
      .messages({
        'string.uri': 'Las URLs de imágenes adicionales deben ser válidas'
      })
  ).optional()
});

// Esquema para actualización de producto (campos opcionales)
const actualizarProductoSchema = Joi.object({
  categoria_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'La categoría debe ser un número',
      'number.integer': 'La categoría debe ser un número entero',
      'number.positive': 'La categoría debe ser un número positivo'
    }),
  nombre: Joi.string().min(2).max(100)
    .messages({
      'string.base': 'El nombre debe ser texto',
      'string.min': 'El nombre debe tener al menos {#limit} caracteres',
      'string.max': 'El nombre no debe exceder {#limit} caracteres'
    }),
  descripcion: Joi.string().allow('', null),
  precio: Joi.number().precision(2).positive()
    .messages({
      'number.base': 'El precio debe ser un número',
      'number.positive': 'El precio debe ser un valor positivo'
    }),
  imagen_url: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'La URL de la imagen debe ser válida'
    }),
  stock: Joi.number().integer().min(0)
    .messages({
      'number.base': 'El stock debe ser un número',
      'number.integer': 'El stock debe ser un número entero',
      'number.min': 'El stock no puede ser negativo'
    }),
  disponible: Joi.boolean(),
  imagenes_adicionales: Joi.array().items(
    Joi.string().uri()
      .messages({
        'string.uri': 'Las URLs de imágenes adicionales deben ser válidas'
      })
  ).optional()
});

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
  try {
    const options = {};
    
    // Aplicar filtros si se proporcionan
    if (req.query.categoria_id) {
      options.categoria_id = req.query.categoria_id;
    }
    
    if (req.query.disponible !== undefined) {
      options.disponible = req.query.disponible === 'true';
    }
    
    if (req.query.vendedor_id) {
      options.vendedor_id = req.query.vendedor_id;
    }
    
    if (req.query.busqueda) {
      options.busqueda = req.query.busqueda;
    }
    
    const productos = await ProductoService.findAll(options);
    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
};

// Obtener producto por ID
const obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;
  
  try {
    const producto = await ProductoService.findById(id);
    
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    res.json(producto);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ mensaje: 'Error al obtener producto' });
  }
};

// Crear nuevo producto
const crearProducto = async (req, res, next) => {
  try {
    const { error, value } = productoSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errores = error.details.map(detail => ({
        campo: detail.context.key,
        mensaje: detail.message
      }));
      
      return next({ 
        status: 400, 
        message: 'Error de validación', 
        errores,
        code: 'VALIDACION' 
      });
    }
    
    // Verificar si el usuario es admin o vendedor
    const usuario = await UsuarioService.findById(req.usuario.id);
    let vendedor_id;
    
    // Si es admin, usar el vendedor_id proporcionado o el predeterminado
    if (usuario && usuario.rol === 'admin') {
      vendedor_id = value.vendedor_id || 1; // ID del vendedor por defecto
    } else {
      // Verificar si el usuario tiene perfil de vendedor
      // Por ahora, usamos el vendedor predeterminado
      vendedor_id = 1; // ID del vendedor por defecto
    }
    
    // Crear el producto con los datos validados
    const producto = await ProductoService.create({
      ...value,
      vendedor_id
    });
    
    res.status(201).json(producto);
  } catch (error) {
    next(error);
  }
};

// Actualizar producto
const actualizarProducto = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const { error, value } = actualizarProductoSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errores = error.details.map(detail => ({
        campo: detail.context.key,
        mensaje: detail.message
      }));
      
      return next({ 
        status: 400, 
        message: 'Error de validación', 
        errores,
        code: 'VALIDACION' 
      });
    }
    
    // Verificar si el producto existe
    const productoExistente = await ProductoService.findById(id);
    
    if (!productoExistente) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Verificar permisos (admin o el vendedor del producto)
    const usuario = await UsuarioService.findById(req.usuario.id);
    
    if (!usuario || (usuario.rol !== 'admin' && usuario.vendedor_id !== productoExistente.vendedor_id)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para actualizar este producto' });
    }
    
    // Actualizar el producto con los datos validados
    const productoActualizado = await ProductoService.update(id, value);
    
    res.json(productoActualizado);
  } catch (error) {
    next(error);
  }
};

// Eliminar producto
const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar si el producto existe
    const producto = await ProductoService.findById(id);
    
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Verificar permisos (admin o el vendedor del producto)
    const usuario = await UsuarioService.findById(req.usuario.id);
    
    if (!usuario || (usuario.rol !== 'admin' && usuario.vendedor_id !== producto.vendedor_id)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar este producto' });
    }
    
    // Eliminar el producto
    await ProductoService.delete(id);
    
    res.json({
      mensaje: 'Producto eliminado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
};

// Agregar imagen a producto
const agregarImagen = async (req, res, next) => {
  const { id } = req.params;
  
  try {
    const schema = Joi.object({
      url: Joi.string().uri().required(),
      descripcion: Joi.string().allow('', null)
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    // Verificar si el producto existe
    const producto = await ProductoService.findById(id);
    
    if (!producto) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }
    
    // Agregar la imagen
    const imagen = await ProductoService.addImage(
      id, 
      req.body.url, 
      req.body.descripcion || ''
    );
    
    res.status(201).json(imagen);
  } catch (error) {
    next(error);
  }
};

// Exportar funciones del controlador
module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  agregarImagen
}; 