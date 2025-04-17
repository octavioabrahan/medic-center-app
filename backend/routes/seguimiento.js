const express = require('express');
const router = express.Router();
const seguimientoController = require('../controllers/seguimientoController');

// Obtener todos los seguimientos de una cotización
router.get('/cotizacion/:id', seguimientoController.obtenerPorCotizacion);

// Obtener seguimientos pendientes para hoy
router.get('/pendientes', seguimientoController.obtenerPendientesHoy);

// Crear un nuevo seguimiento
router.post('/', seguimientoController.crear);

// Actualizar un seguimiento
router.put('/:id', seguimientoController.actualizar);

// Eliminar un seguimiento
router.delete('/:id', seguimientoController.eliminar);

module.exports = router;