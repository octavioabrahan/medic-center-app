const db = require("../models/db");
const PacientesModel = require("../models/pacientesModel");
const AgendamientoModel = require("../models/agendamientoModel");
const { enviarCorreo } = require("../utils/mailer");

const AgendamientoController = {
  crear: async (req, res) => {
    const datos = req.body;

    try {
      // Validar existencia del paciente
      const check = await db.query("SELECT * FROM pacientes WHERE cedula = $1", [datos.cedula]);

      if (check.rowCount === 0) {
        // Crear paciente nuevo
        await PacientesModel.crear({
          cedula: datos.cedula,
          nombre: datos.paciente.nombre,
          apellido: datos.paciente.apellido,
          fecha_nacimiento: datos.paciente.fechaNacimiento,
          sexo: datos.paciente.sexo,
          telefono: datos.paciente.telefono,
          email: datos.paciente.email,
          representante_nombre: datos.representante?.nombre || null,
          representante_apellido: datos.representante?.apellido || null,
          representante_telefono: datos.representante?.telefono || null,
          representante_email: datos.representante?.email || null
        });        
      }

      // Crear agendamiento
      await AgendamientoModel.crear(datos);

      // Enviar email inmediato
      const correoDestino = datos.representante?.email || datos.paciente.email;
      const nombreDestinatario = datos.representante?.nombre || datos.paciente.nombre;

      const mensaje = `
        <h2>¡Hola, ${nombreDestinatario}!</h2>
        <p>Tu cita fue registrada con éxito:</p>
        <ul>
          <li><strong>Profesional:</strong> ${datos.detalle}</li>
          <li><strong>Fecha:</strong> ${datos.fecha}</li>
          <li><strong>Hora:</strong> ${datos.hora_inicio || 'por confirmar'}</li>
        </ul>
        <p>Gracias por confiar en nosotros.</p>
      `;

      await enviarCorreo(correoDestino, "Confirmación de cita - Centro Médico", mensaje);

      // TODO: programar recordatorio 24 horas antes si aplica

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
