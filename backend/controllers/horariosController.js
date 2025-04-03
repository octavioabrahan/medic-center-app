const pool = require('../models/db');

// Listar horarios cargados por médico (fecha exacta)
exports.getHorariosPorMedico = async (req, res) => {
  const { id_medico } = req.params;

  try {
    const result = await pool.query(`
      SELECT fecha, modalidad, hora_inicio, hora_fin, consultorio
      FROM horarios_medicos
      WHERE id_medico = $1
      ORDER BY fecha ASC, hora_inicio ASC
    `, [id_medico]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener horarios del médico:', error);
    res.status(500).json({ error: 'Error interno al obtener horarios' });
  }
};

// Listar fechas con disponibilidad para calendario (solo días con horarios)
exports.getFechasDisponibles = async (req, res) => {
  const { id_medico } = req.params;

  try {
    const result = await pool.query(`
      SELECT DISTINCT fecha
      FROM horarios_medicos
      WHERE id_medico = $1
      AND fecha >= CURRENT_DATE
      ORDER BY fecha ASC
    `, [id_medico]);

    const fechas = result.rows.map(r => r.fecha.toISOString().split('T')[0]);
    res.json(fechas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener fechas disponibles' });
  }
};
