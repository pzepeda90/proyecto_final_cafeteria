const MesaService = require('../services/mesa.service');
const { clearMesasCache } = require('../utils/cache');
const Joi = require('joi');

// Obtener todas las mesas con pedidos activos
const getAllWithOrders = async (req, res, next) => {
  try {
    const mesas = await MesaService.findAllWithOrders();
    res.json(mesas);
  } catch (error) {
    next(error);
  }
};

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
    console.log('Controller: Recibida petición para actualizar estado de mesa');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    const { id } = req.params;
    const { estado } = req.body;
    
    const schema = Joi.object({
      estado: Joi.string().valid('disponible', 'ocupada', 'reservada', 'fuera_servicio').required()
    });

    const { error } = schema.validate({ estado });
    if (error) {
      console.log('Controller: Error de validación:', error.details[0].message);
      return res.status(400).json({ 
        mensaje: 'Estado inválido', 
        error: error.details[0].message 
      });
    }

    console.log(`Controller: Validación exitosa, actualizando mesa ${id} a estado ${estado}`);
    const mesa = await MesaService.updateStatus(id, estado);
    
    // Invalidar cache de mesas después de actualizar
    try {
      await clearMesasCache();
      console.log('Controller: Cache de mesas completamente limpiado');
    } catch (cacheError) {
      console.warn('Controller: Error al limpiar cache:', cacheError);
    }
    
    console.log('Controller: Mesa actualizada exitosamente:', mesa.toJSON());
    res.json({
      mensaje: 'Estado de mesa actualizado exitosamente',
      mesa
    });
  } catch (error) {
    console.error('Controller: Error al actualizar estado:', error);
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

// Obtener mesa específica con información de pedidos
const getMesaWithOrdersById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { Pedido, Usuario, EstadoPedido } = require('../models/orm');
    const { Op } = require('sequelize');
    
    const mesa = await MesaService.findById(id);
    if (!mesa) {
      return res.status(404).json({ mensaje: 'Mesa no encontrada' });
    }
    
    // Buscar pedidos activos para esta mesa
    const pedidosActivos = await Pedido.findAll({
      where: {
        mesa_id: id,
        estado_pedido_id: {
          [Op.notIn]: await EstadoPedido.findAll({
            where: { nombre: { [Op.in]: ['Entregado', 'Cancelado'] } },
            attributes: ['estado_pedido_id']
          }).then(estados => estados.map(e => e.estado_pedido_id))
        }
      },
      include: [
        { model: Usuario, attributes: ['nombre', 'apellido'] },
        { model: EstadoPedido, attributes: ['nombre', 'descripcion'] }
      ],
      order: [['fecha_pedido', 'DESC']]
    });
    
    console.log(`🔍 Mesa ${mesa.numero} - Estado: ${mesa.estado}, Pedidos activos: ${pedidosActivos.length}`);
    pedidosActivos.forEach(p => {
      console.log(`   - Pedido ID: ${p.pedido_id}, Estado: ${p.EstadoPedido.nombre}`);
    });
    
    res.json({
      mesa: mesa.toJSON(),
      pedidos_activos: pedidosActivos.map(p => p.toJSON()),
      total_pedidos_activos: pedidosActivos.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllWithOrders,
  getAll,
  getAvailable,
  getById,
  create,
  update,
  updateStatus,
  delete: deleteMesa,
  getMesaWithOrdersById
}; 