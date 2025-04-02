const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosController');

router.get('/:id_medico', horariosController.getHorariosByMedico);
router.post('/', horariosController.createHorario);

module.exports = router;
