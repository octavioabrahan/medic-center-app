const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Obtener lista de exámenes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM examenes');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener exámenes:', err);
    res.status(500).json({ error: 'Error al obtener exámenes' });
  }
});

// Agregar un nuevo examen
router.post('/', async (req, res) => {
  const { nombre, precioUSD } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO examenes (nombre, preciousd) VALUES ($1, $2) RETURNING *',
      [nombre, precioUSD]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al agregar examen:', err);
    res.status(500).json({ error: 'Error al agregar examen' });
  }
});

module.exports = router;

