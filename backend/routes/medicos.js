const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');

router.get('/', medicosController.getAllMedicos);
router.post('/', medicosController.createMedico);

// Otras rutas para actualizar y eliminar médicos según sea necesario

module.exports = router;
