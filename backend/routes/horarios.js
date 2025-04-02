const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosController');

// Obtener todos los horarios disponibles para un médico específico
router.get('/:id_medico', horariosController.getHorariosByMedico);

// Crear un nuevo horario
router.post('/', horariosController.createHorario);

// Opcional: rutas para actualizar y eliminar horarios si se requiere en el futuro

module.exports = router;
