const EstadoPedidoService = require('../services/estado_pedido.service');

const estadosPedidoController = {
  async getAll(req, res) {
    const estados = await EstadoPedidoService.findAll();
    res.json(estados);
  },
  async getById(req, res) {
    const estado = await EstadoPedidoService.findById(req.params.id);
    if (!estado) return res.status(404).json({ mensaje: 'Estado de pedido no encontrado' });
    res.json(estado);
  },
  async create(req, res) {
    const estado = await EstadoPedidoService.create(req.body);
    res.status(201).json(estado);
  },
  async update(req, res) {
    const estado = await EstadoPedidoService.update(req.params.id, req.body);
    if (!estado) return res.status(404).json({ mensaje: 'Estado de pedido no encontrado' });
    res.json(estado);
  },
  async delete(req, res) {
    const estado = await EstadoPedidoService.delete(req.params.id);
    if (!estado) return res.status(404).json({ mensaje: 'Estado de pedido no encontrado' });
    res.json(estado);
  }
};

module.exports = estadosPedidoController; 