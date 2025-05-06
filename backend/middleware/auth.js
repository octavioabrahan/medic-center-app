const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const AdminUserRolesModel = require('../models/adminUserRolesModel');
require('dotenv').config();

/**
 * Middleware para validar tokens JWT
 * Verifica que el token sea válido y no haya expirado
 */
const authenticateJWT = async (req, res, next) => {
  // Obtener el token del encabezado de autorización
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    logger.logSecurity('Intento de acceso sin token de autorización', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method
    });
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  // Formato del encabezado: "Bearer [token]"
  const token = authHeader.split(' ')[1];
  if (!token) {
    logger.logSecurity('Token de autorización con formato incorrecto', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method
    });
    return res.status(401).json({ error: 'Formato de token inválido.' });
  }

  try {
    // Verificar el token con la clave secreta
    const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_insegura';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Agregar la información del usuario al objeto de solicitud para uso posterior
    req.user = decoded;
    
    // NUEVO: Verificar que el usuario tenga al menos un rol asignado
    const roles = await AdminUserRolesModel.rolesDeUsuario(decoded.id);
    if (!roles || roles.length === 0) {
      logger.logSecurity('Intento de acceso de usuario sin roles asignados', {
        userId: decoded.id,
        email: decoded.email,
        ip: req.ip,
        path: req.originalUrl
      });
      return res.status(403).json({ error: 'Acceso denegado. El usuario no tiene roles asignados.' });
    }
    
    // Actualizar los roles en el objeto de usuario con los obtenidos de la base de datos
    req.user.roles = roles.map(role => role.nombre_rol);
    
    // Registrar acceso exitoso en modo debug
    if (process.env.NODE_ENV !== 'production') {
      logger.logGeneral('Autenticación exitosa', { 
        userId: decoded.id,
        roles: req.user.roles
      });
    }
    
    next();
  } catch (error) {
    // Manejar errores específicos de JWT
    if (error.name === 'TokenExpiredError') {
      logger.logSecurity('Intento de acceso con token expirado', {
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
        error: error.message
      });
      return res.status(401).json({ error: 'El token ha expirado. Por favor inicie sesión nuevamente.' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      logger.logSecurity('Intento de acceso con token inválido', {
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
        error: error.message
      });
      return res.status(403).json({ error: 'Token inválido.' });
    }
    
    // Otros errores
    logger.logError('Error verificando token JWT', error);
    return res.status(403).json({ error: 'No autorizado' });
  }
};

/**
 * Middleware para verificar roles específicos
 * @param {String|Array} roles - Rol o roles permitidos
 * @returns {Function} Middleware
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    // Verificar que el middleware de autenticación se ejecutó primero
    if (!req.user) {
      logger.logError('authorizeRoles utilizado sin authenticateJWT previo');
      return res.status(500).json({ error: 'Error de configuración: autenticación requerida' });
    }

    const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Verificar si el usuario tiene al menos uno de los roles requeridos o si es superadmin
    const isSuperAdmin = userRoles.includes('superadmin');
    const hasAccess = isSuperAdmin || userRoles.some(role => allowedRoles.includes(role));
    
    if (!hasAccess) {
      logger.logSecurity('Intento de acceso con permisos insuficientes', {
        userId: req.user.id,
        userRoles,
        requiredRoles: allowedRoles,
        path: req.originalUrl,
        method: req.method
      });
      return res.status(403).json({ 
        error: 'Acceso denegado. No cuenta con los permisos necesarios.' 
      });
    }

    next();
  };
};

/**
 * Middleware para verificar si un usuario es superadmin
 */
const requireSuperAdmin = (req, res, next) => {
  // Verificar que el middleware de autenticación se ejecutó primero
  if (!req.user) {
    logger.logError('requireSuperAdmin utilizado sin authenticateJWT previo');
    return res.status(500).json({ error: 'Error de configuración: autenticación requerida' });
  }

  const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
  
  if (!userRoles.includes('superadmin')) {
    logger.logSecurity('Intento de acceso a función de superadmin', {
      userId: req.user.id,
      userRoles,
      path: req.originalUrl,
      method: req.method
    });
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de superadmin.' });
  }

  next();
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
  requireSuperAdmin
};