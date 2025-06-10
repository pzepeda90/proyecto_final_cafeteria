const DetallePedidoService = require('../services/detalle_pedido.service');
const { HTTP_STATUS } = require('../utils/constants');

const detallesPedidoController = {
  /**
   * Obtener todos los detalles de un pedido
   */
  async getByPedidoId(req, res) {
    try {
      const detalles = await DetallePedidoService.findByPedidoId(req.params.pedido_id);
      res.json(detalles);
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al obtener detalles del pedido'
      });
    }
  },

  /**
   * Obtener un detalle específico
   */
  async getById(req, res) {
    try {
      const detalle = await DetallePedidoService.findById(req.params.id);
      if (!detalle) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Detalle de pedido no encontrado'
        });
      }
      res.json(detalle);
    } catch (error) {
      console.error('Error al obtener detalle del pedido:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al obtener detalle del pedido'
      });
    }
  },

  /**
   * Crear un nuevo detalle de pedido
   */
  async create(req, res) {
    try {
      const detalle = await DetallePedidoService.create(req.body);
      res.status(HTTP_STATUS.CREATED).json(detalle);
    } catch (error) {
      console.error('Error al crear detalle del pedido:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al crear detalle del pedido'
      });
    }
  },

  /**
   * Actualizar un detalle de pedido
   */
  async update(req, res) {
    try {
      const detalle = await DetallePedidoService.update(req.params.id, req.body);
      if (!detalle) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Detalle de pedido no encontrado'
        });
      }
      res.json(detalle);
    } catch (error) {
      console.error('Error al actualizar detalle del pedido:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al actualizar detalle del pedido'
      });
    }
  },

  /**
   * Eliminar un detalle de pedido
   */
  async delete(req, res) {
    try {
      const resultado = await DetallePedidoService.delete(req.params.id);
      if (!resultado) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Detalle de pedido no encontrado'
        });
      }
      res.json({
        status: 'success',
        message: 'Detalle de pedido eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar detalle del pedido:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al eliminar detalle del pedido'
      });
    }
  }
};

module.exports = detallesPedidoController; 