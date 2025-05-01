const db = require("./db");

const ExcepcionesModel = {
  crear: async ({ profesional_id, fecha, estado, hora_inicio, hora_termino, motivo, nro_consulta }) => {
    await db.query(
      `INSERT INTO horario_excepciones 
        (profesional_id, fecha, estado, hora_inicio, hora_termino, motivo, nro_consulta)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [profesional_id, fecha, estado, hora_inicio, hora_termino, motivo, nro_consulta]
    );
  },

  listarPorProfesional: async (id) => {
    const result = await db.query(
      `SELECT * FROM horario_excepciones WHERE profesional_id = $1 ORDER BY fecha`,
      [id]
    );
    return result.rows;
  },

  listarTodos: async () => {
    const result = await db.query(
      `SELECT he.*, p.nombre as profesional_nombre, p.apellido as profesional_apellido 
       FROM horario_excepciones he
       JOIN profesionales p ON he.profesional_id = p.profesional_id
       ORDER BY he.fecha DESC`
    );
    return result.rows;
  }
};

module.exports = ExcepcionesModel;