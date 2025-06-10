const jwt = require('jsonwebtoken');
const { UsuarioService, VendedorService } = require('../services');

// Verificar token de autenticación de usuario
const verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validar el tipo de token (usuario o vendedor)
    if (decoded.tipo !== 'usuario') {
      return res.status(401).json({ mensaje: 'Token inválido para este recurso.' });
    }
    
    // Buscar el usuario en la base de datos
    const usuario = await UsuarioService.findById(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Token inválido: Usuario no encontrado' });
    }
    
    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(401).json({ mensaje: 'Usuario inactivo. Contacte al administrador.' });
    }
    
    // Obtener el rol del usuario
    const rolNombre = usuario.rol_nombre || 'cliente';
    
    // Agregar el usuario al objeto de solicitud
    req.usuario = {
      id: usuario.usuario_id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: rolNombre,
      rol_id: usuario.rol_id
    };
    
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Token expirado' });
    }
    
    res.status(500).json({ mensaje: 'Error en la autenticación' });
  }
};

// Verificar token de autenticación de vendedor
const verificarTokenVendedor = async (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validar el tipo de token (usuario o vendedor)
    if (decoded.tipo !== 'vendedor') {
      return res.status(401).json({ mensaje: 'Token inválido para este recurso.' });
    }
    
    // Buscar el vendedor en la base de datos
    const vendedor = await VendedorService.findById(decoded.id);
    
    if (!vendedor) {
      return res.status(401).json({ mensaje: 'Token inválido: Vendedor no encontrado' });
    }
    
    // Verificar que el vendedor esté activo
    if (!vendedor.activo) {
      return res.status(401).json({ mensaje: 'Vendedor inactivo. Contacte al administrador.' });
    }
    
    // Agregar el vendedor al objeto de solicitud
    req.vendedor = {
      id: vendedor.vendedor_id,
      email: vendedor.email,
      nombre: vendedor.nombre,
      apellido: vendedor.apellido
    };
    
    next();
  } catch (error) {
    console.error('Error en verificación de token de vendedor:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Token expirado' });
    }
    
    res.status(500).json({ mensaje: 'Error en la autenticación' });
  }
};

// Verificar si el usuario es administrador
const esAdmin = async (req, res, next) => {
  try {
    // El middleware verificarToken debe ejecutarse primero
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Acceso denegado. No autenticado.' });
    }
    
    // Verificar si es admin
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    
    next();
  } catch (error) {
    console.error('Error en verificación de rol admin:', error);
    res.status(500).json({ mensaje: 'Error en la verificación de permisos' });
  }
};

module.exports = {
  verificarToken,
  verificarTokenVendedor,
  esAdmin
}; 