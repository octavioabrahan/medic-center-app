const fs = require('fs');
const path = require('path');
const { createGzip } = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');
const logger = require('./logger');

const pipe = promisify(pipeline);
const logPath = path.join(__dirname, '../logs');
const backupPath = path.join(__dirname, '../backups/logs');

/**
 * Crea una copia de seguridad comprimida de los archivos de log
 * @param {string} fileName - Nombre del archivo de log
 * @returns {Promise<void>}
 */
async function backupLog(fileName) {
  try {
    // Asegurar que existe el directorio de backups
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const sourcePath = path.join(logPath, fileName);
    if (!fs.existsSync(sourcePath)) {
      logger.logWarning(`Archivo de log no encontrado: ${fileName}`);
      return;
    }

    // Crear nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `${path.parse(fileName).name}-${timestamp}.gz`;
    const destPath = path.join(backupPath, backupFileName);

    // Crear streams para compresión
    const source = fs.createReadStream(sourcePath);
    const destination = fs.createWriteStream(destPath);
    const gzip = createGzip();

    // Comprimir y guardar
    await pipe(source, gzip, destination);

    logger.logGeneral(`Backup creado exitosamente: ${backupFileName}`);

    // Opcional: limpiar archivos de log antiguos
    // fs.truncateSync(sourcePath, 0);
    // logger.logGeneral(`Archivo de log limpiado: ${fileName}`);
  } catch (error) {
    logger.logError(`Error al crear backup del archivo ${fileName}`, error);
  }
}

/**
 * Respalda todos los archivos de log
 */
async function backupAllLogs() {
  try {
    // Verificar que el directorio de logs existe
    if (!fs.existsSync(logPath)) {
      logger.logError('Directorio de logs no encontrado');
      return;
    }

    // Leer archivos en el directorio de logs
    const files = fs.readdirSync(logPath);
    const logFiles = files.filter(file => file.endsWith('.log'));

    if (logFiles.length === 0) {
      logger.logGeneral('No se encontraron archivos de log para respaldar');
      return;
    }

    // Crear backups de cada archivo
    for (const file of logFiles) {
      await backupLog(file);
    }

    logger.logGeneral(`Respaldo de logs completado. ${logFiles.length} archivos respaldados.`);

    // Opcional: Eliminar backups antiguos (más de 30 días)
    cleanOldBackups(30);
  } catch (error) {
    logger.logError('Error durante el respaldo de logs', error);
  }
}

/**
 * Limpia los backups antiguos basándose en días
 * @param {number} days - Días a mantener
 */
function cleanOldBackups(days) {
  try {
    if (!fs.existsSync(backupPath)) return;

    const files = fs.readdirSync(backupPath);
    const now = new Date().getTime();
    const daysMs = days * 24 * 60 * 60 * 1000;

    let count = 0;
    files.forEach(file => {
      const filePath = path.join(backupPath, file);
      const stats = fs.statSync(filePath);

      if ((now - stats.mtime.getTime()) > daysMs) {
        fs.unlinkSync(filePath);
        count++;
      }
    });

    if (count > 0) {
      logger.logGeneral(`Limpieza de backups: ${count} archivos antiguos eliminados`);
    }
  } catch (error) {
    logger.logError('Error durante la limpieza de backups antiguos', error);
  }
}

module.exports = {
  backupLog,
  backupAllLogs,
  cleanOldBackups
};