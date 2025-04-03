const pool = require('../models/db');

// Crear una cita
exports.createCita = async (req, res) => {
  const { id_cliente, id_medico, fecha_hora, estado, notas } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO citas (id_cliente, id_medico, fecha_hora, estado, notas)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id_cliente, id_medico, fecha_hora, estado || 'programada', notas]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ error: 'Error al agendar cita' });
  }
};

// Listar citas por cliente o médico
exports.getCitasByMedico = async (req, res) => {
  const { id_medico } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM citas WHERE id_medico = $1 ORDER BY fecha_hora`,
      [id_medico]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};

exports.getAllCitas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM citas ORDER BY fecha_hora DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
};
