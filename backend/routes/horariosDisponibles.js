const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// GET /api/horarios/disponibles/:id_medico
router.get('/disponibles/:id_medico', async (req, res) => {
  const { id_medico } = req.params;

  try {
    // 1. Obtener todos los horarios semanales del médico
    const horarios = await pool.query(`
      SELECT dia_semana FROM horarios_semanales_medicos
      WHERE id_medico = $1
    `, [id_medico]);

    if (horarios.rows.length === 0) {
      return res.status(200).json([]); // No tiene horarios cargados
    }

    const diasDisponibles = horarios.rows.map(h => h.dia_semana); // ej: ['lunes', 'miércoles']

    // 2. Armar las fechas de los próximos 30 días que coinciden con esos días
    const hoy = new Date();
    const fechasPosibles = [];

    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      const nombreDia = fecha.toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();

      if (diasDisponibles.includes(nombreDia)) {
        fechasPosibles.push(fecha.toISOString().split('T')[0]); // formato YYYY-MM-DD
      }
    }

    // 3. Filtrar fechas donde ya hay citas
    const fechasConsulta = fechasPosibles.map(f => `'${f}'`).join(','); // para IN (...)
    const citas = await pool.query(`
      SELECT DISTINCT DATE(fecha_hora) as fecha
      FROM citas
      WHERE id_medico = $1
      AND DATE(fecha_hora) IN (${fechasConsulta})
    `, [id_medico]);

    const fechasConCitas = citas.rows.map(r => r.fecha.toISOString().split('T')[0]);

    const fechasDisponibles = fechasPosibles.filter(f => !fechasConCitas.includes(f));

    res.json(fechasDisponibles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calcular disponibilidad' });
  }
});

module.exports = router;
