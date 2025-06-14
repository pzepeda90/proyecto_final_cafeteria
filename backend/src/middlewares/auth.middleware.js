const jwt = require('jsonwebtoken');
const { UsuarioService, VendedorService } = require('../services');

// Cache en memoria para usuarios verificados (TTL: 5 minutos)
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Limpiar cache periódicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      userCache.delete(key);
    }
  }
}, 60000); // Limpiar cada minuto

// Verificar token de autenticación de usuario
const verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        mensaje: 'Acceso denegado. Token no proporcionado.',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validar el tipo de token (usuario o vendedor)
    if (decoded.tipo !== 'usuario') {
      return res.status(401).json({ 
        mensaje: 'Token inválido para este recurso.',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Verificar cache primero
    const cacheKey = `user_${decoded.id}`;
    const cachedUser = userCache.get(cacheKey);
    
    if (cachedUser && (Date.now() - cachedUser.timestamp < CACHE_TTL)) {
      req.usuario = cachedUser.data;
      return next();
    }
    
    // Buscar el usuario en la base de datos
    const usuario = await UsuarioService.findById(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ 
        mensaje: 'Token inválido: Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Verificar que el usuario esté activo
    if (!usuario.activo) {
      return res.status(401).json({ 
        mensaje: 'Usuario inactivo. Contacte al administrador.',
        code: 'USER_INACTIVE'
      });
    }
    
    // Obtener el rol del usuario
    const rolNombre = usuario.rol_nombre || 'cliente';
    
    // Preparar datos del usuario
    const userData = {
      usuario_id: usuario.usuario_id,  // Cambiar id por usuario_id para consistencia
      id: usuario.usuario_id,          // Mantener id para compatibilidad
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: rolNombre,
      rol_id: usuario.rol_id
    };
    
    // Cachear usuario
    userCache.set(cacheKey, {
      data: userData,
      timestamp: Date.now()
    });
    
    // Agregar el usuario al objeto de solicitud
    req.usuario = userData;
    
    next();
  } catch (error) {
    console.error('Error en verificación de token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        mensaje: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        mensaje: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(500).json({ 
      mensaje: 'Error en la autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Verificar token de autenticación de vendedor (optimizado)
const verificarTokenVendedor = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        mensaje: 'Acceso denegado. Token no proporcionado.',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validar el tipo de token (usuario o vendedor)
    if (decoded.tipo !== 'vendedor') {
      return res.status(401).json({ 
        mensaje: 'Token inválido para este recurso.',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Verificar cache primero
    const cacheKey = `vendor_${decoded.id}`;
    const cachedVendor = userCache.get(cacheKey);
    
    if (cachedVendor && (Date.now() - cachedVendor.timestamp < CACHE_TTL)) {
      req.vendedor = cachedVendor.data;
      return next();
    }
    
    // Buscar el vendedor en la base de datos
    const vendedor = await VendedorService.findById(decoded.id);
    
    if (!vendedor) {
      return res.status(401).json({ 
        mensaje: 'Token inválido: Vendedor no encontrado',
        code: 'VENDOR_NOT_FOUND'
      });
    }
    
    // Verificar que el vendedor esté activo
    if (!vendedor.activo) {
      return res.status(401).json({ 
        mensaje: 'Vendedor inactivo. Contacte al administrador.',
        code: 'VENDOR_INACTIVE'
      });
    }
    
    // Preparar datos del vendedor
    const vendorData = {
      id: vendedor.vendedor_id,
      email: vendedor.email,
      nombre: vendedor.nombre,
      apellido: vendedor.apellido
    };
    
    // Cachear vendedor
    userCache.set(cacheKey, {
      data: vendorData,
      timestamp: Date.now()
    });
    
    // Agregar el vendedor al objeto de solicitud
    req.vendedor = vendorData;
    
    next();
  } catch (error) {
    console.error('Error en verificación de token de vendedor:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        mensaje: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        mensaje: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    res.status(500).json({ 
      mensaje: 'Error en la autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Verificar si el usuario es administrador (optimizado)
const esAdmin = async (req, res, next) => {
  try {
    // El middleware verificarToken debe ejecutarse primero
    if (!req.usuario) {
      return res.status(401).json({ 
        mensaje: 'Acceso denegado. No autenticado.',
        code: 'NOT_AUTHENTICATED'
      });
    }
    
    // Verificar si es admin
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ 
        mensaje: 'Acceso denegado. Se requieren permisos de administrador.',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en verificación de rol admin:', error);
    res.status(500).json({ 
      mensaje: 'Error en la verificación de permisos',
      code: 'PERMISSION_ERROR'
    });
  }
};

// Middleware para tests - versión simplificada
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test_secret');
    
    // Para tests simplificados
    const { Usuario } = require('../models');
    const user = await Usuario.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user && !req.usuario) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    const userRole = req.user?.role || req.usuario?.rol;

    // Los administradores tienen acceso a todo
    if (userRole === 'admin' || userRole === 'administrador') {
      return next();
    }

    if (roles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Acceso denegado. Rol insuficiente',
      code: 'INSUFFICIENT_ROLE',
      required: roles,
      current: userRole
    });
  };
};

// Middleware para verificar múltiples condiciones
const requirePermissions = (conditions) => {
  return async (req, res, next) => {
    try {
      const user = req.usuario || req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'Usuario no autenticado',
          code: 'NOT_AUTHENTICATED'
        });
      }

      // Verificar cada condición
      for (const condition of conditions) {
        if (typeof condition === 'function') {
          const result = await condition(user, req);
          if (!result) {
            return res.status(403).json({
              error: 'Permisos insuficientes',
              code: 'INSUFFICIENT_PERMISSIONS'
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Error verificando permisos:', error);
      res.status(500).json({
        error: 'Error verificando permisos',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  };
};

// Función para limpiar cache manualmente
const clearUserCache = (userId, type = 'user') => {
  const cacheKey = `${type}_${userId}`;
  userCache.delete(cacheKey);
};

// Función para obtener estadísticas del cache
const getCacheStats = () => {
  return {
    size: userCache.size,
    keys: Array.from(userCache.keys()),
    ttl: CACHE_TTL
  };
};

module.exports = {
  verificarToken,
  verificarTokenVendedor,
  esAdmin,
  authMiddleware,
  requireRole,
  requirePermissions,
  clearUserCache,
  getCacheStats
}; 