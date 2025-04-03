const express = require('express');
const router = express.Router();
const {
  getAllEspecialidades,
  crearEspecialidad
} = require('../controllers/especialidadesController');

// GET /api/especialidades
router.get('/', getAllEspecialidades);

// POST /api/especialidades
router.post('/', crearEspecialidad);

module.exports = router;
