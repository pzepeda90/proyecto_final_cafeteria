const RolService = require('../services/rol.service');

const rolesController = {
  async getAll(req, res) {
    const roles = await RolService.findAll();
    res.json(roles);
  },
  async getById(req, res) {
    const rol = await RolService.findById(req.params.id);
    if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado' });
    res.json(rol);
  },
  async create(req, res) {
    const rol = await RolService.create(req.body);
    res.status(201).json(rol);
  },
  async update(req, res) {
    const rol = await RolService.update(req.params.id, req.body);
    if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado' });
    res.json(rol);
  },
  async delete(req, res) {
    const rol = await RolService.delete(req.params.id);
    if (!rol) return res.status(404).json({ mensaje: 'Rol no encontrado' });
    res.json(rol);
  }
};

module.exports = rolesController; 