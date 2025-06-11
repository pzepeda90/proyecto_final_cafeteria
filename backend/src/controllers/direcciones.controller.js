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
      console.log('Usuario solicitando direcciones:', {
        id: req.usuario.id,
        email: req.usuario.email,
        role: req.usuario.role
      });

      const direcciones = await Direccion.findAll({
        where: { usuario_id: req.usuario.id },
        raw: true
      });

      console.log('Direcciones encontradas:', {
        cantidad: direcciones.length,
        direcciones: direcciones
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
      console.log('Recibida solicitud para crear dirección:', req.body);

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
      if (error) {
        console.log('Error de validación:', error.details[0].message);
        return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
      }
      
      const { calle, numero, ciudad, comuna, codigo_postal, pais, principal } = req.body;
      
      // Si la dirección será principal, actualizar las otras
      if (principal) {
        console.log('Nueva dirección será principal, actualizando otras direcciones');
        await Direccion.update(
          { principal: false },
          { where: { usuario_id: req.usuario.id } }
        );
      }
      
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

      console.log('Dirección creada:', direccion.toJSON());
      
      // Responder exitosamente
      res.status(201).json({
        mensaje: 'Dirección añadida correctamente',
        direccion: direccion.toJSON()
      });
    } catch (error) {
      console.error('Error al crear dirección:', error);
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
      console.log('Recibida solicitud para actualizar dirección:', {
        id: req.params.id,
        datos: req.body
      });

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
      if (error) {
        console.log('Error de validación en actualización:', error.details[0].message);
        return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
      }
      
      const { id } = req.params;
      const { calle, numero, ciudad, comuna, codigo_postal, pais, principal } = req.body;
      
      // Verificar que la dirección pertenezca al usuario
      const direccion = await Direccion.findByPk(id);
      if (!direccion || direccion.usuario_id !== req.usuario.id) {
        console.log('Dirección no encontrada o no pertenece al usuario:', {
          direccionId: id,
          usuarioId: req.usuario.id
        });
        return res.status(404).json({ mensaje: 'Dirección no encontrada' });
      }
      
      // Si la dirección será principal, actualizar las otras
      if (principal) {
        console.log('Actualizando dirección como principal, actualizando otras direcciones');
        await Direccion.update(
          { principal: false },
          { where: { usuario_id: req.usuario.id } }
        );
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
      console.log('Dirección actualizada:', direccionActualizada.toJSON());
      
      // Responder exitosamente
      res.json({
        mensaje: 'Dirección actualizada correctamente',
        direccion: direccionActualizada.toJSON()
      });
    } catch (error) {
      console.error('Error al actualizar dirección:', error);
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
      console.log('Recibida solicitud para establecer dirección principal:', id);
      
      // Verificar que la dirección pertenezca al usuario
      const direccion = await Direccion.findByPk(id);
      if (!direccion || direccion.usuario_id !== req.usuario.id) {
        console.log('Dirección no encontrada o no pertenece al usuario:', {
          direccionId: id,
          usuarioId: req.usuario.id
        });
        return res.status(404).json({ mensaje: 'Dirección no encontrada' });
      }
      
      console.log('Quitando principal de todas las direcciones del usuario');
      // Primero quitar principal de todas las direcciones del usuario
      await Direccion.update(
        { principal: false },
        { where: { usuario_id: req.usuario.id } }
      );
      
      console.log('Estableciendo nueva dirección principal');
      // Establecer como principal la seleccionada
      await Direccion.update(
        { principal: true },
        { where: { direccion_id: id } }
      );

      // Obtener todas las direcciones actualizadas
      const direccionesActualizadas = await Direccion.findAll({
        where: { usuario_id: req.usuario.id },
        raw: true
      });

      console.log('Direcciones actualizadas:', direccionesActualizadas);
      
      res.json({
        mensaje: 'Dirección principal actualizada correctamente',
        direcciones: direccionesActualizadas
      });
    } catch (error) {
      console.error('Error al establecer dirección principal:', error);
      next(error);
    }
  }
};

module.exports = direccionesController; 