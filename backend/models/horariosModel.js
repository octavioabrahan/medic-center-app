const db = require('./db');

const HorariosModel = {
  crear: async ({
    profesional_id,
    dia_semana,
    hora_inicio,
    hora_termino,
    valido_desde,
    valido_hasta
  }) => {
    const query = `
      INSERT INTO horario_medico
      (profesional_id, dia_semana, hora_inicio, hora_termino, valido_desde, valido_hasta)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await db.query(query, [
      profesional_id,
      dia_semana,
      hora_inicio,
      hora_termino,
      valido_desde,
      valido_hasta
    ]);
  },

  listarPorProfesional: async (id) => {
    const result = await db.query(
      "SELECT * FROM horario_medico WHERE profesional_id = $1 ORDER BY dia_semana",
      [id]
    );
    return result.rows;
  }
};

module.exports = HorariosModel;
