const db = require('./db'); // Asumo que tenés esto configurado

const AgendamientoModel = {
  crearAgendamiento: async (datos) => {
    const {
      convenio,
      fecha_agendada,
      status,
      profesional_id,
      tipo_atencion_id,
      cedula
    } = datos;

    const now = new Date().toISOString();
    const query = `
      INSERT INTO agendamiento (created_at, convenio, fecha_agendada, status, profesional_id, tipo_atencion_id, cedula)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.run(query, [now, convenio, fecha_agendada, status, profesional_id, tipo_atencion_id, cedula]);
  },

  obtenerAgendamientosPorProfesionalYFecha: async (profesional_id, fecha) => {
    const query = `
      SELECT * FROM agendamiento
      WHERE profesional_id = ? AND fecha_agendada = ?
    `;
    return await db.all(query, [profesional_id, fecha]);
  },

  // Puedes agregar más métodos como cancelar, actualizar status, etc.
};

module.exports = AgendamientoModel;
