const express = require('express');
const router = express.Router();
const pool = require('../models/db');

router.post('/', async (req, res) => {
  const { name, doctor, date } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO appointments (name, doctor, date) VALUES ($1, $2, $3) RETURNING *',
      [name, doctor, date]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving appointment:', err);
    res.status(500).json({ error: 'Error saving appointment' });
  }
});

module.exports = router;

