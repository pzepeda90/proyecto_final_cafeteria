const { CategoriaService } = require('../services');
const Joi = require('joi');

// Obtener todas las categorías
const obtenerCategorias = async (req, res) => {
  try {
    const categorias = await CategoriaService.findAll();
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Obtener una categoría por ID
const obtenerCategoriaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const categoria = await CategoriaService.findById(id);
    
    if (!categoria) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    
    res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// Crear una nueva categoría
const crearCategoria = async (req, res, next) => {
  try {
    const schema = Joi.object({
      nombre: Joi.string().min(2).max(100).required(),
      descripcion: Joi.string().allow('', null).optional(),
      imagen_url: Joi.string().uri().allow('', null).optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const categoria = await CategoriaService.create(req.body);
    
    res.status(201).json(categoria);
  } catch (error) {
    next(error);
  }
};

// Actualizar una categoría
const actualizarCategoria = async (req, res, next) => {
  try {
    const schema = Joi.object({
      nombre: Joi.string().min(2).max(100).optional(),
      descripcion: Joi.string().allow('', null).optional(),
      imagen_url: Joi.string().uri().allow('', null).optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { id } = req.params;
    
    const categoriaActualizada = await CategoriaService.update(id, req.body);
    
    if (!categoriaActualizada) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    
    res.json(categoriaActualizada);
  } catch (error) {
    next(error);
  }
};

// Eliminar una categoría
const eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  
  try {
    await CategoriaService.delete(id);
    
    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    if (error.message.includes('tiene productos asociados')) {
      return res.status(400).json({ 
        mensaje: 'No se puede eliminar esta categoría porque tiene productos asociados' 
      });
    }
    
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    }
    
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

module.exports = {
  obtenerCategorias,
  obtenerCategoriaPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
}; 