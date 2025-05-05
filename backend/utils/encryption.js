const crypto = require('crypto');
const logger = require('./logger');
require('dotenv').config();

/**
 * Utilidades para encriptar y desencriptar datos sensibles
 */
const encryption = {
  /**
   * Genera una clave de encriptación aleatoria
   * @returns {string} Clave hexadecimal
   */
  generateKey: () => {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Genera un vector de inicialización aleatorio
   * @returns {string} Vector de inicialización hexadecimal
   */
  generateIv: () => {
    return crypto.randomBytes(16).toString('hex');
  },

  /**
   * Encripta datos sensibles
   * @param {string} text - Texto a encriptar
   * @param {string} [keyOverride] - Clave opcional (por defecto usa ENV)
   * @returns {Object} Objeto con texto encriptado y IV
   */
  encrypt: (text) => {
    try {
      if (!text) return { encryptedData: '', iv: '' };

      // Usar la clave de .env o una predeterminada para desarrollo (no recomendada para prod)
      const key = process.env.ENCRYPTION_KEY;
      
      if (!key) {
        logger.logCritical('ENCRYPTION_KEY no está definida en .env');
        throw new Error('Configuración de encriptación incompleta');
      }
      
      // Convertir la clave hexadecimal a Buffer
      const keyBuffer = Buffer.from(key, 'hex');
      
      // Generar IV aleatorio
      const iv = crypto.randomBytes(16);
      
      // Crear cipher usando AES-256-CBC
      const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
      
      // Encriptar los datos
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encryptedData: encrypted,
        iv: iv.toString('hex')
      };
    } catch (error) {
      logger.logError('Error al encriptar datos', error);
      throw new Error('Error en el proceso de encriptación');
    }
  },

  /**
   * Desencripta datos encriptados
   * @param {string} encryptedData - Datos encriptados
   * @param {string} iv - Vector de inicialización
   * @param {string} [keyOverride] - Clave opcional (por defecto usa ENV)
   * @returns {string} Texto desencriptado
   */
  decrypt: (encryptedData, iv) => {
    try {
      if (!encryptedData || !iv) return '';
      
      // Usar la clave de .env o una predeterminada para desarrollo
      const key = process.env.ENCRYPTION_KEY;
      
      if (!key) {
        logger.logCritical('ENCRYPTION_KEY no está definida en .env');
        throw new Error('Configuración de encriptación incompleta');
      }
      
      // Convertir la clave y IV de formato hexadecimal a Buffer
      const keyBuffer = Buffer.from(key, 'hex');
      const ivBuffer = Buffer.from(iv, 'hex');
      
      // Crear decipher
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
      
      // Desencriptar los datos
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.logError('Error al desencriptar datos', error);
      throw new Error('Error en el proceso de desencriptación');
    }
  },

  /**
   * Encripta un objeto JSON completo
   * @param {Object} data - Objeto a encriptar
   * @param {Array<string>} sensitiveFields - Campos sensibles a encriptar
   * @returns {Object} Objeto con campos encriptados
   */
  encryptObject: (data, sensitiveFields) => {
    if (!data || typeof data !== 'object') return data;
    
    const result = { ...data };
    
    sensitiveFields.forEach(field => {
      if (result[field]) {
        const { encryptedData, iv } = encryption.encrypt(result[field].toString());
        result[field] = encryptedData;
        result[`${field}_iv`] = iv;
      }
    });
    
    return result;
  },

  /**
   * Desencripta campos sensibles en un objeto
   * @param {Object} data - Objeto con datos encriptados
   * @param {Array<string>} sensitiveFields - Campos sensibles a desencriptar
   * @returns {Object} Objeto con campos desencriptados
   */
  decryptObject: (data, sensitiveFields) => {
    if (!data || typeof data !== 'object') return data;
    
    const result = { ...data };
    
    sensitiveFields.forEach(field => {
      if (result[field] && result[`${field}_iv`]) {
        result[field] = encryption.decrypt(result[field], result[`${field}_iv`]);
        delete result[`${field}_iv`]; // Eliminar el IV después de desencriptar
      }
    });
    
    return result;
  }
};

module.exports = encryption;