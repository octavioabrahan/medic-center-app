const bcrypt = require('bcrypt');
const logger = require('./logger');

/**
 * Utilidades para el manejo seguro de contraseñas
 */
const passwordUtils = {
  /**
   * Genera un hash seguro de una contraseña
   * @param {string} password - Contraseña en texto plano
   * @returns {Promise<string>} Hash de la contraseña
   */
  hash: async (password) => {
    try {
      // Usar un factor de costo alto (10-12 para producción)
      const saltRounds = process.env.NODE_ENV === 'production' ? 12 : 10;
      const hashed = await bcrypt.hash(password, saltRounds);
      return hashed;
    } catch (error) {
      logger.logError('Error al generar hash de contraseña', error);
      throw new Error('Error al procesar la contraseña');
    }
  },

  /**
   * Verifica si una contraseña coincide con un hash
   * @param {string} password - Contraseña en texto plano
   * @param {string} hashedPassword - Hash almacenado de la contraseña
   * @returns {Promise<boolean>} Verdadero si coinciden
   */
  verify: async (password, hashedPassword) => {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.logError('Error al verificar contraseña', error);
      throw new Error('Error al verificar la contraseña');
    }
  },

  /**
   * Valida la fortaleza de una contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} Resultado de la validación con errores si existen
   */
  validateStrength: (password) => {
    const result = {
      valid: true,
      errors: []
    };

    // Longitud mínima
    if (password.length < 8) {
      result.valid = false;
      result.errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    // Debe contener al menos un número
    if (!/\d/.test(password)) {
      result.valid = false;
      result.errors.push('La contraseña debe contener al menos un número');
    }

    // Debe contener al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
      result.valid = false;
      result.errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    // Debe contener al menos una letra minúscula
    if (!/[a-z]/.test(password)) {
      result.valid = false;
      result.errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    // Debe contener al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      result.valid = false;
      result.errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)');
    }

    return result;
  },

  /**
   * Genera una contraseña temporal segura
   * @param {number} length - Longitud de la contraseña (default: 10)
   * @returns {string} Contraseña temporal generada
   */
  generateTemporaryPassword: (length = 10) => {
    const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';  // Sin I, O
    const lowerChars = 'abcdefghijkmnpqrstuvwxyz';  // Sin l, o
    const numbers = '23456789';                     // Sin 0, 1
    const special = '!@#$%^&*';
    
    const allChars = upperChars + lowerChars + numbers + special;
    let password = '';
    
    // Asegurar que tenga al menos un carácter de cada tipo
    password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
    password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += special.charAt(Math.floor(Math.random() * special.length));
    
    // Completar el resto de la contraseña
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Mezclar los caracteres para que no siempre tenga el mismo patrón
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    return password;
  }
};

module.exports = passwordUtils;