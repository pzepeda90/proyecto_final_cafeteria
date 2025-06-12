const MesaService = require('../services/mesa.service');
const Joi = require('joi');

// Obtener todas las mesas
const getAll = async (req, res, next) => {
  try {
    const mesas = await MesaService.findAll();
    res.json(mesas);
  } catch (error) {
    next(error);
  }
};

// Obtener mesas disponibles
const getAvailable = async (req, res, next) => {
  try {
    const mesas = await MesaService.findAvailable();
    res.json(mesas);
  } catch (error) {
    next(error);
  }
};

// Obtener mesa por ID
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mesa = await MesaService.findById(id);
    
    if (!mesa) {
      return res.status(404).json({ mensaje: 'Mesa no encontrada' });
    }
    
    res.json(mesa);
  } catch (error) {
    next(error);
  }
};

// Crear nueva mesa
const create = async (req, res, next) => {
  try {
    const schema = Joi.object({
      numero: Joi.string().min(1).max(10).required(),
      capacidad: Joi.number().integer().min(1).max(20).required(),
      ubicacion: Joi.string().max(100).allow('', null),
      estado: Joi.string().valid('disponible', 'ocupada', 'reservada', 'fuera_servicio').default('disponible')
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        mensaje: 'Datos inválidos', 
        error: error.details[0].message 
      });
    }

    const mesa = await MesaService.create(req.body);
    res.status(201).json({
      mensaje: 'Mesa creada exitosamente',
      mesa
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        mensaje: 'Ya existe una mesa con ese número' 
      });
    }
    next(error);
  }
};

// Actualizar mesa
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const schema = Joi.object({
      numero: Joi.string().min(1).max(10),
      capacidad: Joi.number().integer().min(1).max(20),
      ubicacion: Joi.string().max(100).allow('', null),
      estado: Joi.string().valid('disponible', 'ocupada', 'reservada', 'fuera_servicio'),
      activa: Joi.boolean()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        mensaje: 'Datos inválidos', 
        error: error.details[0].message 
      });
    }

    const mesa = await MesaService.update(id, req.body);
    res.json({
      mensaje: 'Mesa actualizada exitosamente',
      mesa
    });
  } catch (error) {
    if (error.message === 'Mesa no encontrada') {
      return res.status(404).json({ mensaje: error.message });
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        mensaje: 'Ya existe una mesa con ese número' 
      });
    }
    next(error);
  }
};

// Actualizar estado de mesa
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const schema = Joi.object({
      estado: Joi.string().valid('disponible', 'ocupada', 'reservada', 'fuera_servicio').required()
    });

    const { error } = schema.validate({ estado });
    if (error) {
      return res.status(400).json({ 
        mensaje: 'Estado inválido', 
        error: error.details[0].message 
      });
    }

    const mesa = await MesaService.updateStatus(id, estado);
    res.json({
      mensaje: 'Estado de mesa actualizado exitosamente',
      mesa
    });
  } catch (error) {
    if (error.message === 'Mesa no encontrada') {
      return res.status(404).json({ mensaje: error.message });
    }
    next(error);
  }
};

// Eliminar mesa (marcar como inactiva)
const deleteMesa = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await MesaService.delete(id);
    res.json({
      mensaje: 'Mesa eliminada exitosamente'
    });
  } catch (error) {
    if (error.message === 'Mesa no encontrada') {
      return res.status(404).json({ mensaje: error.message });
    }
    next(error);
  }
};

module.exports = {
  getAll,
  getAvailable,
  getById,
  create,
  update,
  updateStatus,
  delete: deleteMesa
}; 