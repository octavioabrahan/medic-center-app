const express = require('express');
const router = express.Router();
const AgendamientoController = require('../controllers/agendamientoController');

router.post('/', AgendamientoController.crear);
router.get('/profesional/:id/:fecha', AgendamientoController.getByProfesionalYFecha);
// más endpoints si es necesario...

module.exports = router;
