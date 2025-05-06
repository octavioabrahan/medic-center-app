const RoleScreenPermissionsModel = require('../models/roleScreenPermissionsModel');
const logger = require('../utils/logger');

/**
 * Middleware para verificar permisos de pantalla
 * @param {String} screenPath - Ruta de la pantalla a verificar
 */
const checkScreenPermission = (screenPath) => {
  return async (req, res, next) => {
    try {
      // Verificar que el middleware de autenticación se ejecutó primero
      if (!req.user || !req.user.id) {
        logger.logError('checkScreenPermission utilizado sin authenticateJWT previo');
        return res.status(500).json({ error: 'Error de configuración: autenticación requerida' });
      }

      // Si es superadmin, siempre darle acceso
      const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [];
      if (userRoles.includes('superadmin') || userRoles.includes('admin')) {
        return next();
      }

      // Obtener todas las pantallas permitidas para este usuario
      const allowedScreens = await RoleScreenPermissionsModel.pantallasPorUsuario(req.user.id);
      
      // Verificar si el usuario tiene acceso a esta pantalla específica
      const hasAccess = allowedScreens.some(screen => screen.path === screenPath);
      
      if (!hasAccess) {
        logger.logSecurity('Intento de acceso a pantalla no autorizada', {
          userId: req.user.id,
          userRoles,
          screenRequested: screenPath,
          path: req.originalUrl,
          method: req.method
        });
        return res.status(403).json({ 
          error: 'Acceso denegado. No tiene permisos para acceder a esta pantalla.' 
        });
      }

      // Si tiene acceso, continuar
      next();
    } catch (error) {
      logger.logError('Error verificando permisos de pantalla', error);
      return res.status(500).json({ error: 'Error al verificar permisos de acceso' });
    }
  };
};

module.exports = {
  checkScreenPermission
};