const DetalleCarritoService = require('../services/detalle_carrito.service');
const { HTTP_STATUS } = require('../utils/constants');

const detallesCarritoController = {
  /**
   * Obtener todos los detalles de un carrito
   */
  async getByCarritoId(req, res) {
    try {
      const detalles = await DetalleCarritoService.findByCarritoId(req.params.carrito_id);
      res.json(detalles);
    } catch (error) {
      console.error('Error al obtener detalles del carrito:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al obtener detalles del carrito'
      });
    }
  },

  /**
   * Obtener un detalle específico
   */
  async getById(req, res) {
    try {
      const detalle = await DetalleCarritoService.findById(req.params.id);
      if (!detalle) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Detalle de carrito no encontrado'
        });
      }
      res.json(detalle);
    } catch (error) {
      console.error('Error al obtener detalle del carrito:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al obtener detalle del carrito'
      });
    }
  },

  /**
   * Crear un nuevo detalle de carrito
   */
  async create(req, res) {
    try {
      const detalle = await DetalleCarritoService.create(req.body);
      res.status(HTTP_STATUS.CREATED).json(detalle);
    } catch (error) {
      console.error('Error al crear detalle del carrito:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al crear detalle del carrito'
      });
    }
  },

  /**
   * Actualizar un detalle de carrito
   */
  async update(req, res) {
    try {
      const detalle = await DetalleCarritoService.update(req.params.id, req.body);
      if (!detalle) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Detalle de carrito no encontrado'
        });
      }
      res.json(detalle);
    } catch (error) {
      console.error('Error al actualizar detalle del carrito:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al actualizar detalle del carrito'
      });
    }
  },

  /**
   * Eliminar un detalle de carrito
   */
  async delete(req, res) {
    try {
      const resultado = await DetalleCarritoService.delete(req.params.id);
      if (!resultado) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Detalle de carrito no encontrado'
        });
      }
      res.json({
        status: 'success',
        message: 'Detalle de carrito eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar detalle del carrito:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al eliminar detalle del carrito'
      });
    }
  }
};

module.exports = detallesCarritoController; 