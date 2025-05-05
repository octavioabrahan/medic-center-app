const rfs = require('rotating-file-stream');
const path = require('path');
const fs = require('fs');

const logPath = path.join(__dirname, '../logs');

// Asegurarse de que el directorio de logs exista
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true });
}

// Crea logger con rotación cada 1MB
function createLogger(file) {
  return rfs.createStream(file, {
    size: '1M',
    interval: '1d',
    path: logPath,
    compress: 'gzip',
  });
}

// Niveles de log
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SECURITY: 'SECURITY',
  CRITICAL: 'CRITICAL'
};

// Logger genérico por tipo
const loggers = {
  general: createLogger('general.log'),
  email: createLogger('emails.log'),
  pdf: createLogger('pdfs.log'),
  security: createLogger('security.log'), // Nuevo logger para eventos de seguridad
  error: createLogger('error.log')        // Logger específico para errores
};

function writeLog(stream, level, msg, metadata = {}) {
  const timestamp = new Date().toISOString();
  const metadataStr = Object.keys(metadata).length 
    ? ` | ${JSON.stringify(metadata)}` 
    : '';
  
  const line = `[${timestamp}] [${level}] ${msg}${metadataStr}\n`;
  stream.write(line);
  
  // Si es un error crítico o de seguridad, también lo escribimos en el log general
  if (level === LOG_LEVELS.CRITICAL || level === LOG_LEVELS.SECURITY) {
    loggers.general.write(line);
  }
}

function sanitizeData(data) {
  // Asegurar que no se registren datos sensibles como contraseñas, tokens, etc.
  if (typeof data !== 'object' || data === null) return data;
  
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'secret', 'authorization', 'contraseña'];
  
  sensitiveFields.forEach(field => {
    if (field in sanitized) sanitized[field] = '[REDACTADO]';
  });
  
  return sanitized;
}

module.exports = {
  logGeneral: (msg, metadata = {}) => writeLog(loggers.general, LOG_LEVELS.INFO, msg, sanitizeData(metadata)),
  logPDF: (msg, metadata = {}) => writeLog(loggers.pdf, LOG_LEVELS.INFO, msg, sanitizeData(metadata)),
  logEmail: (msg, metadata = {}) => writeLog(loggers.email, LOG_LEVELS.INFO, msg, sanitizeData(metadata)),
  
  // Nuevos métodos para loguear eventos de seguridad
  logSecurity: (msg, metadata = {}) => writeLog(loggers.security, LOG_LEVELS.SECURITY, msg, sanitizeData(metadata)),
  logError: (msg, error) => {
    const metadata = error ? { 
      message: error.message, 
      stack: error.stack,
      name: error.name 
    } : {};
    writeLog(loggers.error, LOG_LEVELS.ERROR, msg, sanitizeData(metadata));
  },
  logWarning: (msg, metadata = {}) => writeLog(loggers.general, LOG_LEVELS.WARN, msg, sanitizeData(metadata)),
  logCritical: (msg, error) => {
    const metadata = error ? { 
      message: error.message, 
      stack: error.stack,
      name: error.name 
    } : {};
    writeLog(loggers.error, LOG_LEVELS.CRITICAL, msg, sanitizeData(metadata));
  },
  
  // Constantes para facilitar el uso
  LOG_LEVELS
};

