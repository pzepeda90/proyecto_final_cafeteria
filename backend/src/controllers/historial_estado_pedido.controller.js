const HistorialEstadoPedidoService = require('../services/historial_estado_pedido.service');
const { HTTP_STATUS } = require('../utils/constants');

const historialEstadoPedidoController = {
  /**
   * Obtener historial de un pedido
   */
  async getByPedidoId(req, res) {
    try {
      const historial = await HistorialEstadoPedidoService.findByPedidoId(req.params.pedido_id);
      res.json(historial);
    } catch (error) {
      console.error('Error al obtener historial del pedido:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al obtener historial del pedido'
      });
    }
  },

  /**
   * Obtener un registro específico
   */
  async getById(req, res) {
    try {
      const registro = await HistorialEstadoPedidoService.findById(req.params.id);
      if (!registro) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Registro de historial no encontrado'
        });
      }
      res.json(registro);
    } catch (error) {
      console.error('Error al obtener registro de historial:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al obtener registro de historial'
      });
    }
  },

  /**
   * Crear un nuevo registro de historial
   */
  async create(req, res) {
    try {
      const registro = await HistorialEstadoPedidoService.create(req.body);
      res.status(HTTP_STATUS.CREATED).json(registro);
    } catch (error) {
      console.error('Error al crear registro de historial:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al crear registro de historial'
      });
    }
  },

  /**
   * Actualizar un registro de historial
   */
  async update(req, res) {
    try {
      const registro = await HistorialEstadoPedidoService.update(req.params.id, req.body);
      if (!registro) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Registro de historial no encontrado'
        });
      }
      res.json(registro);
    } catch (error) {
      console.error('Error al actualizar registro de historial:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al actualizar registro de historial'
      });
    }
  },

  /**
   * Eliminar un registro de historial
   */
  async delete(req, res) {
    try {
      const resultado = await HistorialEstadoPedidoService.delete(req.params.id);
      if (!resultado) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          status: 'error',
          message: 'Registro de historial no encontrado'
        });
      }
      res.json({
        status: 'success',
        message: 'Registro de historial eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar registro de historial:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error al eliminar registro de historial'
      });
    }
  }
};

module.exports = historialEstadoPedidoController; 