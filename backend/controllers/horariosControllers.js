const pool = require('../models/db');

// Obtener horarios por ID de médico
exports.getHorariosByMedico = async (req, res) => {
  const { id_medico } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM horarios_disponibles WHERE id_medico = $1',
      [id_medico]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ error: 'Error al obtener horarios' });
  }
};

// Crear un nuevo horario
exports.createHorario = async (req, res) => {
  const { id_medico, dia_semana, hora_inicio, hora_fin } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO horarios_disponibles (id_medico, dia_semana, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_medico, dia_semana, hora_inicio, hora_fin]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear horario:', error);
    res.status(500).json({ error: 'Error al crear horario' });
  }
};
