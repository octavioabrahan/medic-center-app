const express = require('express');
const router = express.Router();
const examenController = require('../controllers/examenController');

// Obtener todos los exámenes
router.get('/', examenController.obtenerTodos);

// Obtener un examen por su código
router.get('/:codigo', examenController.obtenerPorCodigo);

// Crear un nuevo examen
router.post('/', examenController.crear);

// Actualizar un examen
router.put('/:codigo', examenController.actualizar);

// Eliminar un examen
router.delete('/:codigo', examenController.eliminar);

module.exports = router;