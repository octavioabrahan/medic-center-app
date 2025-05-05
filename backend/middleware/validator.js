const logger = require('../utils/logger');

/**
 * Validador genérico para campos requeridos
 * @param {Array} requiredFields - Lista de campos requeridos
 * @returns {Function} Middleware
 */
const validateRequired = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      logger.logWarning('Validación fallida: campos requeridos faltantes', {
        path: req.path,
        method: req.method,
        missingFields
      });
      
      return res.status(400).json({
        error: 'Datos incompletos',
        missingFields,
        message: `Los siguientes campos son requeridos: ${missingFields.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Validación de formato de correo electrónico
 * @param {String} field - Nombre del campo que contiene el correo
 * @returns {Function} Middleware
 */
const validateEmail = (field) => {
  return (req, res, next) => {
    const email = req.body[field];
    
    // Si el campo no existe o está vacío, permitimos pasar (no validamos campos opcionales)
    if (email === undefined || email === null || email === '') {
      return next();
    }
    
    // Expresión regular para validar correos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      logger.logWarning('Validación fallida: formato de correo incorrecto', {
        path: req.path,
        method: req.method,
        field,
        value: email
      });
      
      return res.status(400).json({
        error: 'Formato inválido',
        field,
        message: `El formato del correo electrónico es incorrecto`
      });
    }
    
    next();
  };
};

/**
 * Validación de formato de cédula/RUT
 * @param {String} field - Nombre del campo que contiene la cédula
 * @returns {Function} Middleware
 */
const validateRut = (field) => {
  return (req, res, next) => {
    const rut = req.body[field];
    
    // Si el campo no existe o está vacío, permitimos pasar
    if (rut === undefined || rut === null || rut === '') {
      return next();
    }
    
    // Expresión regular para validar formato de RUT chileno (asumiendo que es el formato usado)
    const rutRegex = /^[0-9]{7,8}-[0-9kK]{1}$/;
    
    if (!rutRegex.test(rut)) {
      logger.logWarning('Validación fallida: formato de cédula/RUT incorrecto', {
        path: req.path,
        method: req.method,
        field,
        value: rut
      });
      
      return res.status(400).json({
        error: 'Formato inválido',
        field,
        message: `El formato de la cédula/RUT es incorrecto. Debe ser XXXXXXXX-Y`
      });
    }
    
    next();
  };
};

/**
 * Validación de longitud de campo
 * @param {String} field - Nombre del campo a validar
 * @param {Number} min - Longitud mínima
 * @param {Number} max - Longitud máxima
 * @returns {Function} Middleware
 */
const validateLength = (field, min, max) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    // Si el campo no existe o está vacío, permitimos pasar
    if (value === undefined || value === null || value === '') {
      return next();
    }
    
    const length = String(value).length;
    
    if (length < min || length > max) {
      logger.logWarning(`Validación fallida: longitud de ${field} incorrecta`, {
        path: req.path,
        method: req.method,
        field,
        value,
        min,
        max,
        actual: length
      });
      
      return res.status(400).json({
        error: 'Longitud inválida',
        field,
        message: `El campo ${field} debe tener entre ${min} y ${max} caracteres`
      });
    }
    
    next();
  };
};

/**
 * Validación de tipo de dato
 * @param {String} field - Nombre del campo a validar
 * @param {String} type - Tipo esperado ('string', 'number', 'boolean', 'date')
 * @returns {Function} Middleware
 */
const validateType = (field, type) => {
  return (req, res, next) => {
    const value = req.body[field];
    
    // Si el campo no existe o está vacío, permitimos pasar
    if (value === undefined || value === null || value === '') {
      return next();
    }
    
    let isValid = false;
    
    switch (type) {
      case 'string':
        isValid = typeof value === 'string';
        break;
      case 'number':
        isValid = typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)));
        break;
      case 'boolean':
        isValid = typeof value === 'boolean' || value === 'true' || value === 'false';
        break;
      case 'date':
        isValid = !isNaN(Date.parse(value));
        break;
      default:
        isValid = true;
    }
    
    if (!isValid) {
      logger.logWarning(`Validación fallida: tipo de dato incorrecto para ${field}`, {
        path: req.path,
        method: req.method,
        field,
        expectedType: type,
        actualType: typeof value,
        value
      });
      
      return res.status(400).json({
        error: 'Tipo de dato inválido',
        field,
        message: `El campo ${field} debe ser de tipo ${type}`
      });
    }
    
    // Convertir automáticamente al tipo adecuado si es necesario
    if (type === 'number' && typeof value === 'string') {
      req.body[field] = Number(value);
    } else if (type === 'boolean' && typeof value === 'string') {
      req.body[field] = value === 'true';
    }
    
    next();
  };
};

/**
 * Validador personalizado para fechas
 * Verifica que una fecha sea válida y esté en el formato esperado
 * @param {String} field - Campo que contiene la fecha
 * @param {Boolean} futureOnly - Si es true, solo permite fechas futuras
 * @returns {Function} Middleware
 */
const validateDate = (field, futureOnly = false) => {
  return (req, res, next) => {
    const dateStr = req.body[field];
    
    // Si el campo no existe o está vacío, permitimos pasar
    if (dateStr === undefined || dateStr === null || dateStr === '') {
      return next();
    }
    
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      logger.logWarning('Validación fallida: fecha inválida', {
        path: req.path,
        method: req.method,
        field,
        value: dateStr
      });
      
      return res.status(400).json({
        error: 'Formato de fecha inválido',
        field,
        message: `El campo ${field} debe ser una fecha válida en formato YYYY-MM-DD`
      });
    }
    
    if (futureOnly && date <= new Date()) {
      logger.logWarning('Validación fallida: la fecha debe ser futura', {
        path: req.path,
        method: req.method,
        field,
        value: dateStr
      });
      
      return res.status(400).json({
        error: 'Fecha inválida',
        field,
        message: `El campo ${field} debe ser una fecha futura`
      });
    }
    
    next();
  };
};

module.exports = {
  validateRequired,
  validateEmail,
  validateRut,
  validateLength,
  validateType,
  validateDate
};