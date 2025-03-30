const rfs = require('rotating-file-stream');
const path = require('path');

const logPath = path.join(__dirname, '../logs');

// Crea logger con rotación cada 1MB
function createLogger(file) {
  return rfs.createStream(file, {
    size: '1M',
    interval: '1d',
    path: logPath,
    compress: 'gzip',
  });
}

// Logger genérico por tipo
const loggers = {
  general: createLogger('general.log'),
  email: createLogger('emails.log'),
  pdf: createLogger('pdfs.log'),
};

function writeLog(stream, msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  stream.write(line);
}

module.exports = {
  logGeneral: (msg) => writeLog(loggers.general, msg),
  logPDF: (msg) => writeLog(loggers.pdf, msg),
  logEmail: (msg) => writeLog(loggers.email, msg),
};

