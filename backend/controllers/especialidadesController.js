const pool = require('../db');

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

// Crear una nueva especialidad
exports.createEspecialidad = async (req, res) => {
  const { nombre, descripcion } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO especialidades (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear especialidad:', error);
    res.status(500).json({ error: 'Error al crear especialidad' });
  }
};
