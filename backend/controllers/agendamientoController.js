const db = require("../models/db");
const PacientesModel = require("../models/pacientesModel");
const AgendamientoModel = require("../models/agendamientoModel");
const { enviarCorreo } = require("../utils/mailer");

const AgendamientoController = {
  crear: async (req, res) => {
    const datos = req.body;

    try {
      // 1. Verificar si el paciente ya existe
      const check = await db.query("SELECT * FROM pacientes WHERE cedula = $1", [datos.cedula]);
      if (check.rowCount === 0) {
        await PacientesModel.crear(datos);
      }

      // 2. Crear agendamiento
      await AgendamientoModel.crear(datos);

      // 3. Determinar a quién enviar el correo
      const email = datos.email;
      const nombre = datos.nombre || datos.representante_nombre;
      const fecha = datos.fecha_agendada;
      const hora = datos.hora_inicio;

      // 4. Enviar correo de confirmación
      await enviarCorreo(
        email,
        "Confirmación de cita",
        `<p>Hola ${nombre}, tu cita ha sido agendada para el <strong>${fecha}</strong> a las <strong>${hora}</strong>.</p>
         <p>La atención será por orden de llegada según el horario del profesional.</p>`
      );

      // 5. Programar correo de recordatorio si la cita es con más de 24h de anticipación
      const fechaHoraCita = new Date(`${fecha}T${hora}`);
      const ahora = new Date();
      const diferencia = fechaHoraCita - ahora;
      const ms24h = 24 * 60 * 60 * 1000;

      if (diferencia > ms24h) {
        setTimeout(() => {
          enviarCorreo(
            email,
            "Recordatorio de cita - Diagnocentro",
            `<p>Hola ${nombre}, te recordamos que mañana tienes una cita agendada a las <strong>${hora}</strong>.</p>`
          );
        }, diferencia - ms24h);
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
