const pool = require('../models/db');

// Obtener horarios semanales por médico
exports.getHorariosByMedico = async (req, res) => {
  const { id_medico } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM horarios_semanales_medicos WHERE id_medico = $1 ORDER BY semana_inicio, dia_semana`,
      [id_medico]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener horarios del médico' });
  }
};

// Crear horario semanal
exports.createHorario = async (req, res) => {
  const {
    id_medico,
    semana_inicio,
    dia_semana,
    modalidad,
    hora_inicio,
    hora_fin,
    consultorio,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO horarios_semanales_medicos (
        id_medico, semana_inicio, dia_semana, modalidad, hora_inicio, hora_fin, consultorio
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [id_medico, semana_inicio, dia_semana, modalidad, hora_inicio, hora_fin, consultorio]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ error: 'Error al crear horario semanal' });
  }
};
