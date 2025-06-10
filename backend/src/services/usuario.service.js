const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models/orm');

class UsuarioService {
  /**
   * Encuentra un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} - Usuario encontrado
   */
  static async findById(id) {
    try {
      const usuario = await Usuario.findOne({
        where: { usuario_id: id, activo: true },
        include: [{
          model: Rol,
          through: { attributes: [] }, // Excluir atributos de la tabla intermedia
          attributes: ['rol_id', 'nombre']
        }]
      });
      
      if (!usuario) return null;
      
      const usuarioData = usuario.toJSON();
      
      // Obtener el primer rol (o rol principal)
      if (usuarioData.Rols && usuarioData.Rols.length > 0) {
        usuarioData.rol_nombre = usuarioData.Rols[0].nombre.toLowerCase();
        usuarioData.rol_id = usuarioData.Rols[0].rol_id;
      }
      
      return usuarioData;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  /**
   * Encuentra un usuario por su email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} - Usuario encontrado
   */
  static async findByEmail(email) {
    try {
      const usuario = await Usuario.findOne({
        where: { email, activo: true },
        include: [{
          model: Rol,
          through: { attributes: [] }, // Excluir atributos de la tabla intermedia
          attributes: ['rol_id', 'nombre']
        }]
      });
      
      if (!usuario) return null;
      
      const usuarioData = usuario.toJSON();
      
      // Obtener el primer rol (o rol principal)
      if (usuarioData.Rols && usuarioData.Rols.length > 0) {
        usuarioData.rol_nombre = usuarioData.Rols[0].nombre.toLowerCase();
        usuarioData.rol_id = usuarioData.Rols[0].rol_id;
      }
      
      return usuarioData;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario en la base de datos
   * @param {Object} userData - Datos del usuario a crear
   * @returns {Promise<Object>} - Usuario creado
   */
  static async create(userData) {
    const { nombre, apellido, email, password, telefono, fecha_nacimiento, rol_id = 3 } = userData; // rol_id 3 = CLIENTE por defecto
    
    try {
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      const nuevoUsuario = await Usuario.create({
        nombre,
        apellido,
        email,
        password_hash,
        telefono,
        fecha_nacimiento,
        activo: true
      });
      
      // Asignar rol al usuario
      const rol = await Rol.findByPk(rol_id);
      if (rol) {
        await nuevoUsuario.addRol(rol);
      }
      
      // Obtener el usuario completo con rol
      return this.findById(nuevoUsuario.usuario_id);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario existente
   * @param {number} id - ID del usuario a actualizar
   * @param {Object} userData - Nuevos datos del usuario
   * @returns {Promise<Object>} - Usuario actualizado
   */
  static async update(id, userData) {
    const { nombre, apellido, email, telefono, fecha_nacimiento } = userData;
    
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      usuario.nombre = nombre;
      usuario.apellido = apellido;
      usuario.email = email;
      usuario.telefono = telefono;
      usuario.fecha_nacimiento = fecha_nacimiento;
      
      await usuario.save();
      
      return usuario.toJSON();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Actualiza la contraseña de un usuario
   * @param {number} id - ID del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async updatePassword(id, newPassword) {
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      
      usuario.password_hash = password_hash;
      await usuario.save();
      
      return true;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }

  /**
   * Verifica si una contraseña coincide con el hash almacenado
   * @param {string} password - Contraseña a verificar
   * @param {string} hash - Hash almacenado
   * @returns {Promise<boolean>} - Resultado de la comparación
   */
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }
}

module.exports = UsuarioService; 