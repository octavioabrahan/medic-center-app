const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');

// Obtener todas las cotizaciones
router.get('/', cotizacionController.obtenerTodas);

// Obtener una cotización por ID o folio
router.get('/:id', cotizacionController.obtenerPorIdOFolio);

// Crear una nueva cotización
router.post('/', cotizacionController.crear);

// Actualizar estado de una cotización
router.patch('/:id', cotizacionController.actualizarEstado);

module.exports = router;