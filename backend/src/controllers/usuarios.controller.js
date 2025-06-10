const jwt = require('jsonwebtoken');
const { UsuarioService, DireccionService } = require('../services');
const Joi = require('joi');
const errorHandler = require('../middlewares/errorHandler');

// Registrar un nuevo usuario
const registro = async (req, res, next) => {
  try {
    const schema = Joi.object({
      nombre: Joi.string().min(2).max(100).required(),
      apellido: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      telefono: Joi.string().allow('', null),
      fecha_nacimiento: Joi.date().iso().allow('', null)
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { nombre, apellido, email, password, telefono, fecha_nacimiento } = req.body;
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await UsuarioService.findByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }
    
    // Crear el usuario
    const usuario = await UsuarioService.create({
      nombre,
      apellido,
      email,
      password,
      telefono,
      fecha_nacimiento
    });
    
    // Generar token JWT con rol
    const token = jwt.sign(
      { 
        id: usuario.usuario_id, 
        email: usuario.email, 
        tipo: 'usuario',
        role: usuario.rol_nombre || 'cliente'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Responder exitosamente
    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      user: {
        id: usuario.usuario_id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        role: usuario.rol_nombre || 'cliente'
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Login de usuario
const login = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { email, password } = req.body;
    
    // Buscar el usuario por email
    const usuario = await UsuarioService.findByEmail(email);
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(401).json({ mensaje: 'Usuario inactivo. Contacte al administrador.' });
    }
    
    // Verificar la contraseña
    const isMatch = await UsuarioService.comparePassword(password, usuario.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    // Generar token JWT con rol
    const token = jwt.sign(
      { 
        id: usuario.usuario_id, 
        email: usuario.email, 
        tipo: 'usuario',
        role: usuario.rol_nombre || 'cliente'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Responder exitosamente
    res.json({
      mensaje: 'Login exitoso',
      user: {
        id: usuario.usuario_id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        role: usuario.rol_nombre || 'cliente'
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

// Verificar token de usuario
const verificarToken = async (req, res) => {
  try {
    // Si llegamos aquí, el token es válido (verificado por el middleware)
    res.json({
      valid: true,
      user: {
        id: req.usuario.id,
        email: req.usuario.email,
        nombre: req.usuario.nombre,
        apellido: req.usuario.apellido,
        role: req.usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({ mensaje: 'Error al verificar token' });
  }
};

// Obtener perfil del usuario
const getPerfil = async (req, res) => {
  try {
    const usuario = await UsuarioService.findById(req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Obtener direcciones del usuario
    const direcciones = await DireccionService.findByUsuarioId(usuario.usuario_id);
    
    // Responder con los datos del usuario
    res.json({
      id: usuario.usuario_id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      fecha_nacimiento: usuario.fecha_nacimiento,
      fecha_registro: usuario.fecha_registro,
      direcciones
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil del usuario' });
  }
};

// Actualizar perfil del usuario
const updatePerfil = async (req, res, next) => {
  try {
    const schema = Joi.object({
      nombre: Joi.string().min(2).max(100).required(),
      apellido: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      telefono: Joi.string().allow('', null),
      fecha_nacimiento: Joi.date().iso().allow('', null)
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { nombre, apellido, email, telefono, fecha_nacimiento } = req.body;
    
    // Verificar si el email ya está en uso por otro usuario
    if (email !== req.usuario.email) {
      const usuarioExistente = await UsuarioService.findByEmail(email);
      if (usuarioExistente && usuarioExistente.usuario_id !== req.usuario.id) {
        return res.status(400).json({ mensaje: 'El email ya está registrado por otro usuario' });
      }
    }
    
    // Actualizar el usuario
    const usuario = await UsuarioService.update(req.usuario.id, {
      nombre,
      apellido,
      email,
      telefono,
      fecha_nacimiento
    });
    
    // Responder exitosamente
    res.json({
      mensaje: 'Perfil actualizado correctamente',
      usuario: {
        id: usuario.usuario_id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        fecha_nacimiento: usuario.fecha_nacimiento
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña
const cambiarPassword = async (req, res, next) => {
  try {
    const schema = Joi.object({
      password_actual: Joi.string().min(8).required(),
      password_nueva: Joi.string().min(8).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { password_actual, password_nueva } = req.body;
    
    // Obtener el usuario
    const usuario = await UsuarioService.findById(req.usuario.id);
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Verificar la contraseña actual
    const isMatch = await UsuarioService.comparePassword(password_actual, usuario.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Contraseña actual incorrecta' });
    }
    
    // Actualizar la contraseña
    await UsuarioService.updatePassword(req.usuario.id, password_nueva);
    
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

// Obtener direcciones del usuario
const getDirecciones = async (req, res) => {
  try {
    const direcciones = await DireccionService.findByUsuarioId(req.usuario.id);
    res.json(direcciones);
  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    res.status(500).json({ mensaje: 'Error al obtener direcciones del usuario' });
  }
};

// Añadir dirección
const addDireccion = async (req, res, next) => {
  try {
    const schema = Joi.object({
      calle: Joi.string().min(2).max(255).required(),
      ciudad: Joi.string().min(2).max(100).required(),
      comuna: Joi.string().min(2).max(100).required(),
      codigo_postal: Joi.string().min(2).max(20).required(),
      principal: Joi.boolean().optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { calle, ciudad, comuna, codigo_postal, principal } = req.body;
    
    // Crear la dirección
    const direccion = await DireccionService.create({
      usuario_id: req.usuario.id,
      calle,
      ciudad,
      comuna,
      codigo_postal,
      principal: principal || false
    });
    
    // Responder exitosamente
    res.status(201).json({
      mensaje: 'Dirección añadida correctamente',
      direccion
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar dirección
const updateDireccion = async (req, res, next) => {
  try {
    const schema = Joi.object({
      calle: Joi.string().min(2).max(255).required(),
      ciudad: Joi.string().min(2).max(100).required(),
      comuna: Joi.string().min(2).max(100).required(),
      codigo_postal: Joi.string().min(2).max(20).required(),
      principal: Joi.boolean().optional()
    });
    const { error } = schema.validate(req.body);
    if (error) return next({ status: 400, message: error.details[0].message, code: 'VALIDACION' });
    
    const { id } = req.params;
    
    // Verificar que la dirección pertenezca al usuario
    const direccion = await DireccionService.findById(id);
    if (!direccion || direccion.usuario_id !== req.usuario.id) {
      return res.status(404).json({ mensaje: 'Dirección no encontrada' });
    }
    
    // Actualizar la dirección
    const direccionActualizada = await DireccionService.update(id, req.body);
    
    // Responder exitosamente
    res.json({
      mensaje: 'Dirección actualizada correctamente',
      direccion: direccionActualizada
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar dirección
const deleteDireccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que la dirección pertenezca al usuario
    const direccion = await DireccionService.findById(id);
    if (!direccion || direccion.usuario_id !== req.usuario.id) {
      return res.status(404).json({ mensaje: 'Dirección no encontrada' });
    }
    
    // Eliminar la dirección
    await DireccionService.delete(id);
    
    // Responder exitosamente
    res.json({
      mensaje: 'Dirección eliminada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

// Establecer dirección como principal
const setDireccionPrincipal = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que la dirección pertenezca al usuario
    const direccion = await DireccionService.findById(id);
    if (!direccion || direccion.usuario_id !== req.usuario.id) {
      return res.status(404).json({ mensaje: 'Dirección no encontrada' });
    }
    
    // Establecer como principal
    const direccionActualizada = await DireccionService.setPrincipal(id);
    
    // Responder exitosamente
    res.json({
      mensaje: 'Dirección establecida como principal',
      direccion: direccionActualizada
    });
  } catch (error) {
    next(error);
  }
};

// Generar JWT para un usuario
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.usuario_id,
      tipo: 'usuario'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  registro,
  login,
  verificarToken,
  getPerfil,
  updatePerfil,
  cambiarPassword,
  getDirecciones,
  addDireccion,
  updateDireccion,
  deleteDireccion,
  setDireccionPrincipal
}; 