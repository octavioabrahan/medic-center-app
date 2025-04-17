const express = require('express');
const router = express.Router();
const controller = require('../controllers/cotizacionesControllerRelacional');
const authMiddleware = require('../middlewares/auth'); // Middleware para verificar autenticación

// Rutas públicas (sin autenticación)
// Crear una nueva cotización (desde el formulario público)
router.post('/', controller.crear);

// Rutas protegidas (requieren autenticación)
// Obtener listado de cotizaciones para administración
router.get('/admin', authMiddleware, controller.obtenerListado);

// Obtener una cotización específica por ID
router.get('/admin/:id', authMiddleware, controller.obtenerPorId);

// Actualizar el estado de una cotización
router.put('/admin/:id/estado', authMiddleware, controller.actualizarEstado);

// Agregar seguimiento a una cotización
router.post('/admin/:id/seguimiento', authMiddleware, controller.agregarSeguimiento);

// Obtener estadísticas para el dashboard
router.get('/admin/estadisticas', authMiddleware, controller.obtenerEstadisticas);

module.exports = router;