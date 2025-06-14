const bcrypt = require('bcryptjs');
const { Usuario } = require('../models/orm');

class UsuarioService {
  /**
   * Encuentra un usuario por su ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} - Usuario encontrado
   */
  static async findById(id) {
    try {
      const usuario = await Usuario.findOne({
        where: { usuario_id: id, activo: true }
      });
      
      if (!usuario) return null;
      
      const usuarioData = usuario.toJSON();
      
      // El rol ya está incluido directamente en el usuario
      usuarioData.rol_nombre = usuarioData.rol;
      
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
        where: { email, activo: true }
      });
      
      if (!usuario) return null;
      
      const usuarioData = usuario.toJSON();
      
      // El rol ya está incluido directamente en el usuario
      usuarioData.rol_nombre = usuarioData.rol;
      
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
    const { nombre, apellido, email, password, telefono, username, rol = 'cliente' } = userData;
    
    try {
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      // Generar username si no se proporciona
      const finalUsername = username || email.split('@')[0];
      
      const nuevoUsuario = await Usuario.create({
        username: finalUsername,
        nombre,
        apellido,
        email,
        password_hash,
        telefono,
        rol,
        activo: true
      });
      
      // Obtener el usuario completo
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
    const { nombre, apellido, email, telefono, username, direccion } = userData;
    
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      
      if (nombre) usuario.nombre = nombre;
      if (apellido) usuario.apellido = apellido;
      if (email) usuario.email = email;
      if (telefono) usuario.telefono = telefono;
      if (username) usuario.username = username;
      if (direccion) usuario.direccion = direccion;
      
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
   * Compara una contraseña con su hash
   * @param {string} password - Contraseña en texto plano
   * @param {string} hash - Hash de la contraseña
   * @returns {Promise<boolean>} - Resultado de la comparación
   */
  static async comparePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Error al comparar contraseña:', error);
      throw error;
    }
  }

  /**
   * Busca clientes por nombre o teléfono
   * @param {string} searchTerm - Término de búsqueda
   * @returns {Promise<Array>} - Lista de clientes encontrados
   */
  static async searchClientes(searchTerm) {
    try {
      const { Op } = require('sequelize');
      
      const clientes = await Usuario.findAll({
        where: {
          activo: true,
          [Op.or]: [
            {
              nombre: {
                [Op.iLike]: `%${searchTerm}%`
              }
            },
            {
              apellido: {
                [Op.iLike]: `%${searchTerm}%`
              }
            },
            {
              telefono: {
                [Op.iLike]: `%${searchTerm}%`
              }
            },
            {
              email: {
                [Op.iLike]: `%${searchTerm}%`
              }
            }
          ]
        },
        attributes: ['usuario_id', 'nombre', 'apellido', 'email', 'telefono'],
        limit: 20,
        order: [['nombre', 'ASC'], ['apellido', 'ASC']]
      });
      
      return clientes.map(cliente => ({
        id: cliente.usuario_id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        telefono: cliente.telefono,
        nombreCompleto: `${cliente.nombre} ${cliente.apellido}`
      }));
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      throw error;
    }
  }
}

module.exports = UsuarioService; 