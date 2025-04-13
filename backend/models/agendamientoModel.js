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
      hora_inicio,
      id_empresa
    } = datos;
  
    const query = `
      INSERT INTO agendamiento (
        cedula,
        fecha_agendada,
        convenio,
        profesional_id,
        tipo_atencion_id,
        observaciones,
        hora_inicio,
        id_empresa
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
  
    await db.query(query, [
      cedula,
      fecha_agendada,
      convenio,
      profesional_id,
      tipo_atencion_id,
      observaciones || null,
      hora_inicio || null,
      id_empresa || null
    ]);
  },

  listar: async ({ status, desde, hasta }) => {
    const condiciones = [];
    const valores = [];
    const todosLosEstados = ['pendiente', 'confirmada', 'cancelada'];
  
    if (status) {
      const estados = status.split(",").map(s => s.trim()).filter(Boolean);
    
      if (estados.length > 0) {
        const placeholders = estados.map((_, i) => `$${valores.length + i + 1}`);
        condiciones.push(`a.status IN (${placeholders.join(", ")})`);
        valores.push(...estados);
      }
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

  actualizarEstado: async (id, nuevoEstado, cambiadoPor = "sistema") => {
    const client = await db.connect();
  
    try {
      await client.query("BEGIN");
  
      // Obtener estado actual
      const current = await client.query(
        `SELECT status FROM agendamiento WHERE agendamiento_id = $1`,
        [id]
      );
      const estadoAnterior = current.rows[0]?.status;
  
      // Si no existe, abortar
      if (!estadoAnterior) {
        throw new Error("Agendamiento no encontrado");
      }
  
      // Actualizar estado
      await client.query(
        `UPDATE agendamiento SET status = $1 WHERE agendamiento_id = $2`,
        [nuevoEstado, id]
      );
  
      // Registrar historial
      await client.query(
        `INSERT INTO agendamiento_historial (agendamiento_id, estado_anterior, estado_nuevo, cambiado_por)
         VALUES ($1, $2, $3, $4)`,
        [id, estadoAnterior, nuevoEstado, cambiadoPor]
      );
  
      await client.query("COMMIT");
      return nuevoEstado;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  listarHistorial: async (agendamientoId) => {
    const query = `
      SELECT historial_id, estado_anterior, estado_nuevo, cambiado_por, fecha_cambio
      FROM agendamiento_historial
      WHERE agendamiento_id = $1
      ORDER BY fecha_cambio DESC
    `;
    const result = await db.query(query, [agendamientoId]);
    return result.rows;
  }
};

module.exports = AgendamientoModel;