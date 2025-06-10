const ImagenProductoService = require('../services/imagen_producto.service');

const imagenesProductoController = {
  async getByProductoId(req, res) {
    const imagenes = await ImagenProductoService.findByProductoId(req.params.producto_id);
    res.json(imagenes);
  },
  async create(req, res) {
    const imagen = await ImagenProductoService.create(req.body);
    res.status(201).json(imagen);
  }
};

module.exports = imagenesProductoController; 