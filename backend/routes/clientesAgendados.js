const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientesAgendadosController');

router.post('/register-or-find', controller.registerOrFindCliente);

module.exports = router;
