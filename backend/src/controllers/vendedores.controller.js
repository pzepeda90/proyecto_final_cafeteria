const { VendedorService } = require('../services');
const jwt = require('jsonwebtoken');

const vendedoresController = {
  /**
   * Obtener todos los vendedores
   */
  async getAll(req, res) {
    try {
      const vendedores = await VendedorService.findAll();
      res.json(vendedores);
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      res.status(500).json({ mensaje: 'Error al obtener vendedores' });
    }
  },
  
  /**
   * Obtener un vendedor por ID
   */
  async getById(req, res) {
    try {
      const vendedor = await VendedorService.findById(req.params.id);
      if (!vendedor) return res.status(404).json({ mensaje: 'Vendedor no encontrado' });
      res.json(vendedor);
    } catch (error) {
      console.error('Error al obtener vendedor:', error);
      res.status(500).json({ mensaje: 'Error al obtener vendedor' });
    }
  },
  
  /**
   * Login de vendedor
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Verificar email
      const vendedor = await VendedorService.findByEmail(email);
      if (!vendedor) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      }
      
      // Verificar contraseña
      const passwordValida = await VendedorService.comparePassword(password, vendedor.password_hash);
      if (!passwordValida) {
        return res.status(401).json({ mensaje: 'Credenciales inválidas' });
      }
      
      // Verificar si está activo
      if (!vendedor.activo) {
        return res.status(401).json({ mensaje: 'Cuenta de vendedor inactiva. Contacte al administrador.' });
      }
      
      // Generar token
      const token = generarToken(vendedor);
      
      res.json({
        mensaje: 'Login exitoso',
        vendedor: {
          vendedor_id: vendedor.vendedor_id,
          nombre: vendedor.nombre,
          apellido: vendedor.apellido,
          email: vendedor.email,
          telefono: vendedor.telefono,
          activo: vendedor.activo
        },
        token
      });
    } catch (error) {
      console.error('Error en login de vendedor:', error);
      res.status(500).json({ mensaje: 'Error al iniciar sesión' });
    }
  },
  
  /**
   * Crear un nuevo vendedor
   */
  async create(req, res) {
    try {
      console.log('=== INICIANDO CREACIÓN DE VENDEDOR ===');
      console.log('Body recibido:', req.body);
      console.log('Usuario que hace la request:', req.usuario);
      
      // Validar datos de entrada
      const { nombre, apellido, email, password, telefono } = req.body;
      
      console.log('Datos extraídos:', { nombre, apellido, email, password: password ? '[PRESENTE]' : '[AUSENTE]', telefono });
      
      if (!nombre || !apellido || !email || !password) {
        console.log('Error: Campos obligatorios faltantes');
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
      }
      
      console.log('Validación básica pasada, verificando email existente...');
      
      // Verificar si el email ya existe
      const vendedorExistente = await VendedorService.findByEmail(email);
      if (vendedorExistente) {
        console.log('Error: Email ya registrado');
        return res.status(400).json({ mensaje: 'El email ya está registrado' });
      }
      
      console.log('Email disponible, creando vendedor...');
      
      // Crear vendedor
      const vendedor = await VendedorService.create({
        nombre,
        apellido,
        email,
        password,
        telefono
      });
      
      console.log('Vendedor creado exitosamente:', vendedor);
      
      res.status(201).json({
        mensaje: 'Vendedor creado exitosamente',
        vendedor: {
          vendedor_id: vendedor.vendedor_id,
          nombre: vendedor.nombre,
          apellido: vendedor.apellido,
          email: vendedor.email,
          telefono: vendedor.telefono
        }
      });
    } catch (error) {
      console.error('=== ERROR EN CREACIÓN DE VENDEDOR ===');
      console.error('Error completo:', error);
      console.error('Stack trace:', error.stack);
      console.error('Mensaje:', error.message);
      
      if (error.message === 'El email ya está registrado') {
        return res.status(400).json({ mensaje: error.message });
      }
      
      if (error.message === 'Formato de email inválido') {
        return res.status(400).json({ mensaje: error.message });
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.error('Error de constraint único en base de datos');
        return res.status(400).json({ mensaje: 'El email ya está registrado en el sistema' });
      }
      
      if (error.name === 'SequelizeValidationError') {
        console.error('Error de validación de Sequelize:', error.errors);
        return res.status(400).json({ 
          mensaje: 'Datos inválidos', 
          detalles: error.errors.map(e => e.message) 
        });
      }
      
      if (error.name === 'SequelizeConnectionError') {
        console.error('Error de conexión a la base de datos');
        return res.status(500).json({ mensaje: 'Error de conexión a la base de datos' });
      }
      
      res.status(500).json({ mensaje: 'Error al crear vendedor', detalle: error.message });
    }
  },
  
  /**
   * Actualizar un vendedor
   */
  async update(req, res) {
    try {
      const vendedor = await VendedorService.update(req.params.id, req.body);
      if (!vendedor) return res.status(404).json({ mensaje: 'Vendedor no encontrado' });
      res.json({
        mensaje: 'Vendedor actualizado correctamente',
        vendedor
      });
    } catch (error) {
      console.error('Error al actualizar vendedor:', error);
      res.status(500).json({ mensaje: 'Error al actualizar vendedor' });
    }
  },
  
  /**
   * Eliminar un vendedor
   */
  async delete(req, res) {
    try {
      await VendedorService.delete(req.params.id);
      res.json({
        mensaje: 'Vendedor eliminado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({ mensaje: 'Vendedor no encontrado' });
      }
      
      if (error.message.includes('tiene productos asociados')) {
        return res.status(400).json({ 
          mensaje: 'No se puede eliminar este vendedor porque tiene productos asociados' 
        });
      }
      
      res.status(500).json({ mensaje: 'Error al eliminar vendedor' });
    }
  },
  
  /**
   * Cambiar contraseña de vendedor
   */
  async cambiarPassword(req, res) {
    try {
      const { id } = req.params;
      const { password_actual, password_nueva } = req.body;
      
      // Verificar que el vendedor exista
      const vendedor = await VendedorService.findById(id);
      if (!vendedor) {
        return res.status(404).json({ mensaje: 'Vendedor no encontrado' });
      }
      
      // Verificar contraseña actual
      const passwordValida = await VendedorService.comparePassword(password_actual, vendedor.password_hash);
      if (!passwordValida) {
        return res.status(400).json({ mensaje: 'Contraseña actual incorrecta' });
      }
      
      // Actualizar contraseña
      await VendedorService.updatePassword(id, password_nueva);
      
      res.json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña de vendedor:', error);
      res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
    }
  }
};

/**
 * Genera un token JWT para un vendedor
 * @param {Object} vendedor - Datos del vendedor
 * @returns {string} - Token JWT
 */
const generarToken = (vendedor) => {
  return jwt.sign(
    { 
      id: vendedor.vendedor_id,
      tipo: 'vendedor' 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = vendedoresController; 