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
    tipo_atencion_id,
    nro_consulta
  }) => {
    if (hora_inicio >= hora_termino) {
      throw new Error("La hora de inicio debe ser menor a la hora de término.");
    }

    for (const dia of dia_semana) {
      await db.query(
        `INSERT INTO horario_medico
        (profesional_id, dia_semana, hora_inicio, hora_termino, valido_desde, valido_hasta, tipo_atencion_id, nro_consulta)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          profesional_id,
          dia,
          hora_inicio,
          hora_termino,
          valido_desde,
          valido_hasta,
          tipo_atencion_id,
          nro_consulta
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

  listarTodos: async () => {
    const result = await db.query(`
      SELECT hm.*, 
             p.nombre as profesional_nombre, 
             p.apellido as profesional_apellido,
             ta.nombre as tipo_atencion
      FROM horario_medico hm
      JOIN profesionales p ON hm.profesional_id = p.profesional_id
      JOIN tipo_atencion ta ON hm.tipo_atencion_id = ta.tipo_atencion_id
      ORDER BY p.apellido, p.nombre, hm.dia_semana
    `);
    return result.rows;
  },

  listarFechasPorProfesional: async (profesional_id) => {
    // 1. Obtener horarios base
    const horariosResult = await db.query(
      `SELECT dia_semana, hora_inicio, hora_termino, valido_desde, valido_hasta, tipo_atencion_id, nro_consulta
       FROM horario_medico
       WHERE profesional_id = $1`,
      [profesional_id]
    );

    const horarios = horariosResult.rows;

    // 2. Obtener excepciones
    const excepcionesResult = await db.query(
      `SELECT fecha, estado, hora_inicio, hora_termino, nro_consulta
       FROM horario_excepciones
       WHERE profesional_id = $1`,
      [profesional_id]
    );

    const excepciones = excepcionesResult.rows;

    const fechasCanceladas = new Set(
      excepciones
        .filter(e => e.estado === 'cancelado')
        .map(e => moment(e.fecha).format("YYYY-MM-DD"))
    );

    const fechasManuales = excepciones
      .filter(e => e.estado === 'manual')
      .map(e => ({
        fecha: moment(e.fecha).format("YYYY-MM-DD"),
        hora_inicio: e.hora_inicio,
        hora_termino: e.hora_termino,
        tipo_atencion_id: 1, // puedes ajustarlo si tienes más lógica
        nro_consulta: e.nro_consulta
      }));

    // 3. Generar fechas desde horario base
    let fechasDesdeHorario = [];

    horarios.forEach((row) => {
      let fecha = moment(row.valido_desde);
      const hasta = moment(row.valido_hasta);
      while (fecha.isSameOrBefore(hasta)) {
        if (fecha.isoWeekday() === row.dia_semana) {
          const fechaStr = fecha.format("YYYY-MM-DD");
          if (!fechasCanceladas.has(fechaStr)) {
            fechasDesdeHorario.push({
              fecha: fechaStr,
              hora_inicio: row.hora_inicio,
              hora_termino: row.hora_termino,
              tipo_atencion_id: row.tipo_atencion_id,
              nro_consulta: row.nro_consulta
            });
          }
        }
        fecha.add(1, 'day');
      }
    });

    // 4. Unificar fechas (evitar duplicados por fecha)
    const todas = [...fechasDesdeHorario, ...fechasManuales];
    const fechasUnicasMap = new Map();
    for (const f of todas) {
      fechasUnicasMap.set(f.fecha, f);
    }

    return Array.from(fechasUnicasMap.values()).sort((a, b) => a.fecha.localeCompare(b.fecha));
  }
};

module.exports = HorariosModel;