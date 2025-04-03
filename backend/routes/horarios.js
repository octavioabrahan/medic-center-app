const express = require('express');
const router = express.Router();
const controller = require('../controllers/horariosController');


// GET /api/horarios/medico/:id_medico -> listado completo
router.get('/medico/:id_medico', controller.getHorariosPorMedico);

// GET /api/horarios/disponibles/:id_medico -> solo fechas disponibles
router.get('/disponibles/:id_medico', controller.getFechasDisponibles);

// POST para horarios
router.post('/', controller.crearHorario);

module.exports = router;
