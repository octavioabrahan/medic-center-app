const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.post('/register-or-find', clientesController.registerOrFindCliente);

module.exports = router;
