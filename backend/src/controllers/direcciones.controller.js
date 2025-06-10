const Direccion = require('../models/orm/direccion.orm');
const Joi = require('joi');

/**
 * Controlador para gestión de direcciones
 */
const direccionesController = {
  /**
   * Obtener todas las direcciones de un usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object 
   */
  async getAll(req, res, next) {
    try {
      const direcciones = await Direccion.findAll({
        where: { usuario_id: req.usuario.id }
      });
      res.json(direcciones);
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      next(error);
    }
  },

  /**
   * Obtener una dirección específica
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const direccion = await Direccion.findByPk(id);
      
      if (!direccion || direccion.usuario_id !== req.usuario.id) {
        return res.status(404).json({ mensaje: 'Dirección no encontrada' });
      }
      
      res.json(direccion);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Crear una nueva dirección
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async create(req, res, next) {
    try {
      const schema = Joi.object({
        calle: Joi.string().min(2).max(255).required(),
        numero: Joi.string().max(50),
        ciudad: Joi.string().min(2).max(100).required(),
        comuna: Joi.string().min(2).max(100).required(),
        codigo_postal: Joi.string().min(2).max(20).required(),
        pais: Joi.string().min(2).max(50).required(),
        principal: Joi.boolean().default(false)
      });
      
      const { error } = schema.validate(req.body);
      if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
      
      const { calle, numero, ciudad, comuna, codigo_postal, pais, principal } = req.body;
      
      // Crear la dirección
      const direccion = await Direccion.create({
        usuario_id: req.usuario.id,
        calle,
        numero,
        ciudad,
        comuna,
        codigo_postal,
        pais,
        principal: principal || false
      });
      
      // Responder exitosamente
      res.status(201).json({
        mensaje: 'Dirección añadida correctamente',
        direccion
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Actualizar una dirección existente
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async update(req, res, next) {
    try {
      const schema = Joi.object({
        calle: Joi.string().min(2).max(255).required(),
        numero: Joi.string().max(50),
        ciudad: Joi.string().min(2).max(100).required(),
        comuna: Joi.string().min(2).max(100).required(),
        codigo_postal: Joi.string().min(2).max(20).required(),
        pais: Joi.string().min(2).max(50).required(),
        principal: Joi.boolean()
      });
      
      const { error } = schema.validate(req.body);
      if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
      
      const { id } = req.params;
      const { calle, numero, ciudad, comuna, codigo_postal, pais, principal } = req.body;
      
      // Verificar que la dirección pertenezca al usuario
      const direccion = await Direccion.findByPk(id);
      if (!direccion || direccion.usuario_id !== req.usuario.id) {
        return res.status(404).json({ mensaje: 'Dirección no encontrada' });
      }
      
      // Actualizar la dirección
      await Direccion.update(
        {
          calle,
          numero,
          ciudad,
          comuna,
          codigo_postal,
          pais,
          principal
        },
        {
          where: { direccion_id: id }
        }
      );
      
      const direccionActualizada = await Direccion.findByPk(id);
      
      // Responder exitosamente
      res.json({
        mensaje: 'Dirección actualizada correctamente',
        direccion: direccionActualizada
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Eliminar una dirección
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar que la dirección pertenezca al usuario
      const direccion = await Direccion.findByPk(id);
      if (!direccion || direccion.usuario_id !== req.usuario.id) {
        return res.status(404).json({ mensaje: 'Dirección no encontrada' });
      }
      
      // Eliminar la dirección
      await Direccion.destroy({
        where: { direccion_id: id }
      });
      
      // Responder exitosamente
      res.json({
        mensaje: 'Dirección eliminada correctamente'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Establecer una dirección como principal
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async setPrincipal(req, res, next) {
    try {
      const { id } = req.params;
      
      // Verificar que la dirección pertenezca al usuario
      const direccion = await Direccion.findByPk(id);
      if (!direccion || direccion.usuario_id !== req.usuario.id) {
        return res.status(404).json({ mensaje: 'Dirección no encontrada' });
      }
      
      // Primero quitar principal de todas las direcciones del usuario
      await Direccion.update(
        { principal: false },
        { where: { usuario_id: req.usuario.id } }
      );
      
      // Establecer como principal la seleccionada
      await Direccion.update(
        { principal: true },
        { where: { direccion_id: id } }
      );
      
      const direccionActualizada = await Direccion.findByPk(id);
      
      // Responder exitosamente
      res.json({
        mensaje: 'Dirección establecida como principal',
        direccion: direccionActualizada
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = direccionesController; 