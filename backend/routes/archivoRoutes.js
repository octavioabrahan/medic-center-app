const express = require('express');
const router = express.Router();
const archivoController = require('../controllers/archivoController');

// Ruta para subir archivo
router.post('/upload', archivoController.upload.single('archivo'), archivoController.subirArchivo);

// Ruta para obtener información de un archivo sin descargarlo
router.get('/:id/info', archivoController.obtenerInfoArchivo);

// Ruta para obtener/visualizar archivo por ID
router.get('/:id', archivoController.obtenerArchivo);

// Ruta para eliminar archivo por ID
router.delete('/:id', archivoController.eliminarArchivo);

// Ruta para ejecutar limpieza manual de archivos expirados (para admin o cron)
router.post('/limpiar-expirados', archivoController.limpiarArchivosExpirados);

module.exports = router;