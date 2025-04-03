const pool = require('../models/db');

// Buscar o registrar cliente agendado (por rut o email)
exports.registerOrFindCliente = async (req, res) => {
  const { nombre, rut, email, telefono } = req.body;

  try {
    const search = await pool.query(
      'SELECT * FROM clientes_agendados WHERE rut = $1 OR email = $2 LIMIT 1',
      [rut, email]
    );

    if (search.rows.length > 0) {
      return res.json(search.rows[0]);
    }

    const insert = await pool.query(
      'INSERT INTO clientes_agendados (nombre, rut, email, telefono) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, rut, email, telefono]
    );

    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('Error en búsqueda/registro de cliente agendado', err);
    res.status(500).json({ error: 'Error al registrar cliente agendado' });
  }
};
