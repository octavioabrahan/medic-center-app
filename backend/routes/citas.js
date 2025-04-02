const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citasController');

router.post('/', citasController.createCita);
router.get('/medico/:id_medico', citasController.getCitasByMedico);

module.exports = router;
