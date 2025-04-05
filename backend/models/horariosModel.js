const db = require('./db');

const HorariosModel = {
  crear: async ({
    profesional_id,
    dia_semana,
    hora_inicio,
    hora_termino,
    valido_desde,
    valido_hasta,
    tipo_atencion_id
  }) => {
    for (const dia of dia_semana) {
      await db.query(
        `INSERT INTO horario_medico
        (profesional_id, dia_semana, hora_inicio, hora_termino, valido_desde, valido_hasta, tipo_atencion_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          profesional_id,
          dia,
          hora_inicio,
          hora_termino,
          valido_desde,
          valido_hasta,
          tipo_atencion_id
        ]
      );
    }
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
