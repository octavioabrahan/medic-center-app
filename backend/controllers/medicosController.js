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
  const { nombre, especialidad, telefono, correo_electronico, horario_atencion } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO medicos (nombre, especialidad, telefono, correo_electronico, horario_atencion) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, especialidad, telefono, correo_electronico, horario_atencion]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear médico:', error);
    res.status(500).json({ error: 'Error al crear médico' });
  }
};
