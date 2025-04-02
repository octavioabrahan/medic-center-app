const pool = require('../models/db');

// Obtener todos los médicos
exports.getAllMedicos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medicos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    res.status(500).json({ error: 'Error al obtener médicos' });
  }
};

// Crear un nuevo médico
exports.createMedico = async (req, res) => {
  const { nombre, id_especialidad, telefono, correo_electronico } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO medicos (nombre, id_especialidad, telefono, correo_electronico) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, id_especialidad, telefono, correo_electronico]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear médico:', error);
    res.status(500).json({ error: 'Error al crear médico' });
  }
};

exports.getMedicosConEspecialidad = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, e.nombre AS especialidad
      FROM medicos m
      JOIN especialidades e ON m.id_especialidad = e.id_especialidad
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener médicos con especialidad' });
  }
};

