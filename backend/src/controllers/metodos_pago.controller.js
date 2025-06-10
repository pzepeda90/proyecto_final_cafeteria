const MetodoPagoService = require('../services/metodo_pago.service');
const Joi = require('joi');

const metodosPagoController = {
  async getAll(req, res) {
    const metodos = await MetodoPagoService.findAll();
    res.json(metodos);
  },
  async getById(req, res) {
    const metodo = await MetodoPagoService.findById(req.params.id);
    if (!metodo) return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
    res.json(metodo);
  },
  async create(req, res, next) {
    try {
      const schema = Joi.object({
        nombre: Joi.string().min(2).max(100).required(),
        descripcion: Joi.string().allow('', null).optional(),
        activo: Joi.boolean().optional()
      });
      const { error } = schema.validate(req.body);
      if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
      const metodo = await MetodoPagoService.create(req.body);
      res.status(201).json(metodo);
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const schema = Joi.object({
        nombre: Joi.string().min(2).max(100).optional(),
        descripcion: Joi.string().allow('', null).optional(),
        activo: Joi.boolean().optional()
      });
      const { error } = schema.validate(req.body);
      if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
      const metodo = await MetodoPagoService.update(req.params.id, req.body);
      if (!metodo) return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
      res.json(metodo);
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res) {
    const metodo = await MetodoPagoService.delete(req.params.id);
    if (!metodo) return res.status(404).json({ mensaje: 'Método de pago no encontrado' });
    res.json(metodo);
  }
};

module.exports = metodosPagoController; 