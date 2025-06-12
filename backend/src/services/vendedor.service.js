const { Vendedor, Producto } = require('../models/orm');
const bcrypt = require('bcryptjs');

class VendedorService {
  /**
   * Obtiene todos los vendedores
   * @returns {Promise<Array>} - Lista de vendedores
   */
  static async findAll() {
    try {
      const vendedores = await Vendedor.findAll({
        order: [['nombre', 'ASC']]
      });
      return vendedores.map(vendedor => vendedor.toJSON());
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      throw error;
    }
  }

  /**
   * Obtiene un vendedor por su ID
   * @param {number} id - ID del vendedor
   * @returns {Promise<Object>} - Vendedor encontrado
   */
  static async findById(id) {
    try {
      const vendedor = await Vendedor.findByPk(id);
      return vendedor ? vendedor.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar vendedor por ID:', error);
      throw error;
    }
  }

  /**
   * Obtiene un vendedor por su email
   * @param {string} email - Email del vendedor
   * @returns {Promise<Object>} - Vendedor encontrado
   */
  static async findByEmail(email) {
    try {
      const vendedor = await Vendedor.findOne({
        where: { email }
      });
      return vendedor ? vendedor.toJSON() : null;
    } catch (error) {
      console.error('Error al buscar vendedor por email:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo vendedor
   * @param {Object} data - Datos del vendedor
   * @returns {Promise<Object>} - Vendedor creado
   */
  static async create(data) {
    try {
      console.log('VendedorService.create - Datos recibidos:', data);
      
      const { nombre, apellido, email, password, telefono } = data;
      
      console.log('VendedorService.create - Encriptando contraseña...');
      
      // Encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      
      console.log('VendedorService.create - Contraseña encriptada, creando en BD...');
      console.log('VendedorService.create - Datos a insertar:', {
        usuario_id: 1, // Usar ID por defecto
        nombre,
        apellido,
        email,
        password_hash: '[HASH_PRESENTE]',
        telefono,
        activo: true
      });
      
      const vendedor = await Vendedor.create({
        usuario_id: 1, // Agregar usuario_id por defecto (admin que crea el vendedor)
        nombre,
        apellido,
        email,
        password_hash,
        telefono,
        activo: true
      });
      
      console.log('VendedorService.create - Vendedor creado en BD:', vendedor.toJSON());
      
      return vendedor.toJSON();
    } catch (error) {
      console.error('VendedorService.create - Error detallado:', error);
      console.error('VendedorService.create - Error name:', error.name);
      console.error('VendedorService.create - Error message:', error.message);
      if (error.errors) {
        console.error('VendedorService.create - Validation errors:', error.errors);
      }
      throw error;
    }
  }

  /**
   * Actualiza un vendedor
   * @param {number} id - ID del vendedor
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} - Vendedor actualizado
   */
  static async update(id, data) {
    try {
      const vendedor = await Vendedor.findByPk(id);
      
      if (!vendedor) {
        throw new Error('Vendedor no encontrado');
      }
      
      if (data.nombre !== undefined) vendedor.nombre = data.nombre;
      if (data.apellido !== undefined) vendedor.apellido = data.apellido;
      if (data.email !== undefined) vendedor.email = data.email;
      if (data.telefono !== undefined) vendedor.telefono = data.telefono;
      if (data.activo !== undefined) vendedor.activo = data.activo;
      
      await vendedor.save();
      
      return vendedor.toJSON();
    } catch (error) {
      console.error('Error al actualizar vendedor:', error);
      throw error;
    }
  }

  /**
   * Actualiza la contraseña de un vendedor
   * @param {number} id - ID del vendedor
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async updatePassword(id, newPassword) {
    try {
      const vendedor = await Vendedor.findByPk(id);
      
      if (!vendedor) {
        throw new Error('Vendedor no encontrado');
      }
      
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      
      vendedor.password_hash = password_hash;
      await vendedor.save();
      
      return true;
    } catch (error) {
      console.error('Error al actualizar contraseña del vendedor:', error);
      throw error;
    }
  }

  /**
   * Elimina un vendedor
   * @param {number} id - ID del vendedor
   * @returns {Promise<boolean>} - Resultado de la operación
   */
  static async delete(id) {
    try {
      const vendedor = await Vendedor.findByPk(id);
      
      if (!vendedor) {
        throw new Error('Vendedor no encontrado');
      }
      
      // Verificar si tiene productos asociados
      const productosCount = await Producto.count({
        where: { vendedor_id: id }
      });
      
      if (productosCount > 0) {
        throw new Error('No se puede eliminar el vendedor porque tiene productos asociados');
      }
      
      await vendedor.destroy();
      return true;
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
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

module.exports = VendedorService; 