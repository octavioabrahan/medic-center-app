const db = require("./db");

const ExcepcionesModel = {
  crear: async ({ profesional_id, fecha, estado, hora_inicio, hora_termino, motivo }) => {
    await db.query(
      `INSERT INTO horario_excepciones 
        (profesional_id, fecha, estado, hora_inicio, hora_termino, motivo)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [profesional_id, fecha, estado, hora_inicio, hora_termino, motivo]
    );
  },

  listarPorProfesional: async (id) => {
    const result = await db.query(
      `SELECT * FROM horario_excepciones WHERE profesional_id = $1 ORDER BY fecha`,
      [id]
    );
    return result.rows;
  }
};

module.exports = ExcepcionesModel;
