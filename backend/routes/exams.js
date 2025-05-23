const express = require('express');
const router = express.Router();
const examenController = require('../controllers/examenController');

// Obtener todos los exámenes
router.get('/', examenController.obtenerTodos);

// Obtener historial de un examen por su código
router.get('/:codigo/historial', examenController.obtenerHistorial);

// Obtener un examen por su código
router.get('/:codigo', examenController.obtenerPorCodigo);

// Crear un nuevo examen
router.post('/', examenController.crear);

// Actualizar un examen (PUT para reemplazar completamente)
router.put('/:codigo', examenController.actualizar);

// Actualizar parcialmente un examen (PATCH para actualización parcial)
router.patch('/:codigo', examenController.actualizarParcial);

// Eliminar un examen
router.delete('/:codigo', examenController.eliminar);

module.exports = router;