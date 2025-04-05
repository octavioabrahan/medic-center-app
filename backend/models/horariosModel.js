const db = require('./db');
const moment = require("moment");

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
    if (hora_inicio >= hora_termino) {
      throw new Error("La hora de inicio debe ser menor a la hora de término.");
    }

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
  },

  listarFechasPorProfesional: async (profesional_id) => {
    const result = await db.query(
      `SELECT * FROM horario_medico WHERE profesional_id = $1`,
      [profesional_id]
    );
    let fechas = [];
    result.rows.forEach((row) => {
      let fecha = moment(row.valido_desde);
      const hasta = moment(row.valido_hasta);
      while (fecha.isSameOrBefore(hasta)) {
        if (fecha.isoWeekday() === row.dia_semana) {
          fechas.push({
            fecha: fecha.format("YYYY-MM-DD"),
            hora_inicio: row.hora_inicio,
            hora_termino: row.hora_termino,
            tipo_atencion_id: row.tipo_atencion_id
          });
        }
        fecha.add(1, 'day');
      }
    });
    return fechas;
  }
};

module.exports = HorariosModel;