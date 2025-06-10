const { obtenerRolesUsuario } = require('../utils/auth');

function requiereRol(rolesPermitidos) {
  return async (req, res, next) => {
    const usuario_id = req.usuario.id;
    const roles = await obtenerRolesUsuario(usuario_id);
    const tienePermiso = roles.some(rol => rolesPermitidos.includes(rol));
    if (!tienePermiso) {
      return res.status(403).json({ mensaje: 'Acceso denegado. Rol insuficiente.' });
    }
    next();
  };
}

module.exports = { requiereRol }; 