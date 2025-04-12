const db = require("./db");

const AgendamientoModel = {
  crear: async (datos) => {
    const {
      cedula,
      fecha_agendada,
      convenio,
      profesional_id,
      tipo_atencion_id,
      observaciones,
      hora_inicio
    } = datos;

    const query = `
      INSERT INTO agendamiento (
        cedula, fecha_agendada, convenio,
        profesional_id, tipo_atencion_id, observaciones,
        hora_inicio
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await db.query(query, [
      cedula,
      fecha_agendada,
      convenio,
      profesional_id,
      tipo_atencion_id,
      observaciones || null,
      hora_inicio || null
    ]);
  },

  listar: async ({ status, desde, hasta }) => {
    const condiciones = [];
    const valores = [];
  
    if (typeof status === "string" && status.trim() !== "") {
      valores.push(status);
      condiciones.push(`a.status = $${valores.length}`);
    }
  
    if (desde) {
      valores.push(desde);
      condiciones.push(`a.fecha_agendada >= $${valores.length}`);
    }
  
    if (hasta) {
      valores.push(hasta);
      condiciones.push(`a.fecha_agendada <= $${valores.length}`);
    }
  
    const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
  
    const query = `
      SELECT 
        a.agendamiento_id,
        a.fecha_agendada,
        a.status,
        a.observaciones,
        a.cedula,
        a.profesional_id,
        a.tipo_atencion_id,
        p.nombre AS paciente_nombre,
        p.apellido AS paciente_apellido,
        p.email AS paciente_email,
        p.telefono AS paciente_telefono,
        pr.nombre AS profesional_nombre,
        pr.apellido AS profesional_apellido,
        ta.nombre AS tipo_atencion
      FROM agendamiento a
      LEFT JOIN pacientes p ON a.cedula = p.cedula
      LEFT JOIN profesionales pr ON a.profesional_id = pr.profesional_id
      LEFT JOIN tipo_atencion ta ON a.tipo_atencion_id = ta.tipo_atencion_id
      ${where}
      ORDER BY a.fecha_agendada DESC
    `;

    const result = await db.query(query, valores);
    return result.rows;
  },

  actualizarEstado: async (id, nuevoEstado) => {
    const query = `
      UPDATE agendamiento 
      SET status = $1 
      WHERE agendamiento_id = $2 
      RETURNING status
    `;
    const result = await db.query(query, [nuevoEstado, id]);
    return result.rows[0]?.status;
  }
};

module.exports = AgendamientoModel;
