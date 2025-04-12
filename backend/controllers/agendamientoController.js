const db = require("../models/db");
const PacientesModel = require("../models/pacientesModel");
const AgendamientoModel = require("../models/agendamientoModel");
const { enviarCorreo } = require("../utils/mailer");

const AgendamientoController = {
  crear: async (req, res) => {
    const datos = req.body;

    try {
      const check = await db.query("SELECT * FROM pacientes WHERE cedula = $1", [datos.cedula]);

      if (check.rowCount === 0) {
        await PacientesModel.crear(datos);
      }

      const agendamiento = await AgendamientoModel.crear(datos);

      // Enviar correo de confirmación inmediato
      const emailDestino = datos.email || datos.representante_email;
      const nombreDestino = datos.nombre;
      const fechaCita = new Date(datos.fecha_agendada).toLocaleDateString("es-CL");
      const mensajeHtml = `
        <h2>Confirmación de Cita</h2>
        <p>Hola ${nombreDestino}, tu cita ha sido agendada para el día <strong>${fechaCita}</strong>.</p>
        <p>Gracias por confiar en nuestro centro médico.</p>
      `;

      await enviarCorreo(
        emailDestino,
        "Confirmación de cita",
        mensajeHtml
      );

      // Agendar recordatorio si la cita es en más de 24h
      const fechaCitaTimestamp = new Date(datos.fecha_agendada).getTime();
      const ahora = Date.now();
      const diffHoras = (fechaCitaTimestamp - ahora) / (1000 * 60 * 60);

      if (diffHoras >= 24) {
        const jobTime = new Date(fechaCitaTimestamp - 24 * 60 * 60 * 1000); // 24h antes
        const jobTimeISOString = jobTime.toISOString();

        await db.query(
          `INSERT INTO jobs_email (cedula, fecha_envio, asunto, cuerpo)
           VALUES ($1, $2, $3, $4)`,
          [
            datos.cedula,
            jobTimeISOString,
            "Recordatorio de cita",
            `Hola ${nombreDestino}, te recordamos que tienes una cita médica agendada para el día ${fechaCita}.`
          ]
        );
      }

      res.status(201).json({ mensaje: "Agendamiento registrado correctamente" });

    } catch (err) {
      console.error("Error al crear agendamiento:", err);
      res.status(500).json({ error: "Error al crear agendamiento" });
    }
  },

  listar: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT a.*, p.nombre, p.apellido, p.representante_nombre, p.representante_apellido
        FROM agendamiento a
        JOIN pacientes p ON p.cedula = a.cedula
        ORDER BY a.fecha_agendada DESC
      `);
      res.json(result.rows);
    } catch (err) {
      console.error("Error al listar agendamientos:", err);
      res.status(500).json({ error: "Error al obtener los agendamientos" });
    }
  }
};

module.exports = AgendamientoController;
