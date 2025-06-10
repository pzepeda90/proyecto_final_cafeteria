const Vendedor = require('../models/vendedor.model');
const Usuario = require('../models/usuario.model');

/**
 * Verifica si las credenciales corresponden a un vendedor válido
 * @param {string} email - Email del vendedor
 * @param {string} password - Contraseña del vendedor
 * @returns {Promise<Object|null>} - Datos del vendedor o null si no existe
 */
async function verificarVendedor(email, password) {
  try {
    const vendedor = await Vendedor.findByEmail(email);
    if (!vendedor) return null;
    
    const passwordValida = await Vendedor.comparePassword(password, vendedor.password_hash);
    if (!passwordValida) return null;
    
    if (!vendedor.activo) return null;
    
    return vendedor;
  } catch (error) {
    console.error('Error al verificar vendedor:', error);
    return null;
  }
}

/**
 * Obtiene los roles de un usuario
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} - Array con los nombres de roles del usuario
 */
async function obtenerRolesUsuario(usuarioId) {
  try {
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) return [];
    
    const roles = [];
    
    // Añadir rol base de la tabla roles
    if (usuario.rol_nombre) {
      roles.push(usuario.rol_nombre);
    } else {
      roles.push('cliente'); // Rol por defecto
    }
    
    return roles;
  } catch (error) {
    console.error('Error al obtener roles de usuario:', error);
    return ['cliente']; // Valor por defecto en caso de error
  }
}

module.exports = {
  verificarVendedor,
  obtenerRolesUsuario
}; 