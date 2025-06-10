const ResenaService = require('../services/resena.service');

const resenasController = {
  async getByProductoId(req, res) {
    const resenas = await ResenaService.findByProductoId(req.params.producto_id);
    res.json(resenas);
  },
  async create(req, res) {
    const resena = await ResenaService.create(req.body);
    res.status(201).json(resena);
  },
  async update(req, res) {
    const resena = await ResenaService.update(req.params.id, req.body);
    if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    res.json(resena);
  },
  async delete(req, res) {
    const resena = await ResenaService.delete(req.params.id);
    if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    res.json(resena);
  }
};

module.exports = resenasController; 