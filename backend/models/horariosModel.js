const db = require('../database/db');

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
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.run(query, [
      profesional_id,
      dia_semana,
      hora_inicio,
      hora_termino,
      valido_desde,
      valido_hasta
    ]);
  }
};

module.exports = HorariosModel;
