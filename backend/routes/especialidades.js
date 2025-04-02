const express = require('express');
const router = express.Router();
const especialidadesController = require('../controllers/especialidadesController');

router.get('/', especialidadesController.getAllEspecialidades);
router.post('/', especialidadesController.createEspecialidad);

// Otras rutas para actualizar y eliminar especialidades según sea necesario

module.exports = router;
