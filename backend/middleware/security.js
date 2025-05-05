const logger = require('../utils/logger');

/**
 * Middleware para prevenir inyección SQL y NoSQL
 * Válida la presencia de patrones sospechosos en los datos de entrada
 */
const preventInjection = (req, res, next) => {
  // Patrones de inyección SQL comunes
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(:))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i
  ];

  // Función para verificar patrones en un objeto
  const checkPatterns = (obj) => {
    if (!obj) return false;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Verificar cada patrón contra el valor
        for (const pattern of sqlPatterns) {
          if (pattern.test(obj[key])) {
            return { key, value: obj[key] };
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Verificar objetos anidados recursivamente
        const result = checkPatterns(obj[key]);
        if (result) return result;
      }
    }
    
    return false;
  };

  // Verificar en body, query y params
  const suspiciousParam = 
    checkPatterns(req.body) || 
    checkPatterns(req.query) || 
    checkPatterns(req.params);

  if (suspiciousParam) {
    logger.logSecurity('Posible intento de inyección detectado', {
      ip: req.ip,
      path: req.originalUrl,
      method: req.method,
      param: suspiciousParam.key,
      value: suspiciousParam.value
    });
    return res.status(403).json({ error: 'Solicitud inválida: datos con formato incorrecto detectados.' });
  }

  next();
};

/**
 * Middleware para proteger contra XSS (Cross Site Scripting)
 * Sanitiza datos de entrada que podrían contener scripts maliciosos
 */
const preventXSS = (req, res, next) => {
  // Patrones típicos de XSS
  const xssPatterns = [
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi
  ];

  const sanitizeValue = (value) => {
    if (typeof value !== 'string') return value;
    
    // Reemplazar caracteres potencialmente peligrosos
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Verificar si contiene patrones XSS
        let containsXSS = false;
        for (const pattern of xssPatterns) {
          if (pattern.test(obj[key])) {
            containsXSS = true;
            logger.logSecurity('Posible ataque XSS detectado', {
              ip: req.ip,
              path: req.originalUrl,
              parameter: key,
              value: obj[key].substring(0, 100) // Logueamos solo una parte para evitar logs muy grandes
            });
            break;
          }
        }
        
        // Sanitizar el valor
        obj[key] = sanitizeValue(obj[key]);
      } else if (obj[key] && typeof obj[key] === 'object') {
        // Sanitizar objetos anidados
        sanitizeObject(obj[key]);
      }
    }
  };

  // Sanitizar body, query y params
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);

  next();
};

/**
 * Middleware para establecer cabeceras de seguridad adicionales
 * Complementa la protección proporcionada por helmet
 */
const securityHeaders = (req, res, next) => {
  // Prevenir que los navegadores "adivinen" el tipo MIME
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Protección contra clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Habilitar protección XSS en navegadores antiguos
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Controlar desde dónde se pueden cargar recursos externos
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; object-src 'none'");
  
  // Política de referencia estricta
  res.setHeader('Referrer-Policy', 'same-origin');
  
  // No exponer información sensible en los encabezados
  res.removeHeader('X-Powered-By');
  
  next();
};

module.exports = {
  preventInjection,
  preventXSS,
  securityHeaders
};