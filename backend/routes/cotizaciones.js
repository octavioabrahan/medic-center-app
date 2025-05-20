const express = require('express');
const router = express.Router();
const controller = require('../controllers/cotizacionesControllerRelacional');

// Ruta para crear una nueva cotización (desde el formulario público)
router.post('/', controller.crear);

// Ruta para obtener una cotización específica por ID
router.get('/:id', controller.obtenerPorId);

module.exports = router;