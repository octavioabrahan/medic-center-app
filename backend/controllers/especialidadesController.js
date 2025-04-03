const pool = require('../models/db');

// Obtener todas las especialidades
exports.getAllEspecialidades = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM especialidades');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    res.status(500).json({ error: 'Error al obtener especialidades' });
  }
};

// POST /api/especialidades
exports.crearEspecialidad = async (req, res) => {
  const { nombre, descripcion, tipo } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO especialidades (nombre, descripcion, tipo)
      VALUES ($1, $2, $3) RETURNING *
    `, [nombre, descripcion, tipo]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creando especialidad', err);
    res.status(500).json({ error: 'No se pudo crear la especialidad' });
  }
};
