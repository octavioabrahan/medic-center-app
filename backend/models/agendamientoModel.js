const db = require("./db");

const AgendamientoModel = {
  crear: async (datos) => {
    const {
      cedula,
      fecha_agendada,
      convenio,
      profesional_id,
      tipo_atencion_id,
      observaciones
    } = datos;

    const query = `
      INSERT INTO agendamiento (
        cedula, fecha_agendada, convenio,
        profesional_id, tipo_atencion_id, observaciones
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    await db.query(query, [
      cedula,
      fecha_agendada,
      convenio,
      profesional_id,
      tipo_atencion_id,
      observaciones || null
    ]);
  }
};

module.exports = AgendamientoModel;
