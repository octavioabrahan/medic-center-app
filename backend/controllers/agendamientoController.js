const db = require("../models/db");
const PacientesModel = require("../models/pacientesModel");
const AgendamientoModel = require("../models/agendamientoModel");
const { enviarCorreo } = require("../utils/mailer");

const AgendamientoController = {
  crear: async (req, res) => {
    try {
      const {
        cedula,
        nombre,
        apellido,
        fecha_nacimiento,
        sexo,
        telefono,
        email,
        seguro_medico,
        representante_cedula,
        representante_nombre,
        representante_apellido,
        profesional_id,
        fecha_agendada,
        tipo_atencion_id,
        observaciones,
        hora_inicio,
        id_categoria,
        id_empresa
      } = req.body;

      if (!nombre || !apellido || !fecha_nacimiento || !sexo) {
        return res
          .status(400)
          .json({ error: "Faltan datos obligatorios del paciente." });
      }

      const cedulaPaciente = representante_cedula || cedula;

      const check = await db.query(
        "SELECT * FROM pacientes WHERE cedula = $1",
        [cedulaPaciente]
      );

      if (check.rowCount === 0) {
        await PacientesModel.crear({
          cedula: cedulaPaciente,
          nombre,
          apellido,
          fecha_nacimiento,
          sexo,
          telefono: telefono || null,
          email: email || null,
          seguro_medico: seguro_medico || false,
          representante_cedula: representante_cedula || null,
          representante_nombre: representante_nombre || null,
          representante_apellido: representante_apellido || null,
          id_empresa
        });
      }

      await AgendamientoModel.crear({
        cedula,
        fecha_agendada,
        convenio: seguro_medico === true,
        profesional_id,
        tipo_atencion_id,
        observaciones,
        hora_inicio,
        id_categoria,
        id_empresa
      });

      await enviarCorreo(
        email || "",
        "Confirmación de cita agendada",
        `
          <h3>Tu cita fue registrada correctamente</h3>
          <p><strong>Paciente:</strong> ${nombre} ${apellido}</p>
          <p><strong>Fecha:</strong> ${fecha_agendada}</p>
          <p><strong>Hora:</strong> ${hora_inicio || "No especificada"}</p>
        `
      );

      res
        .status(201)
        .json({ mensaje: "Agendamiento registrado correctamente" });
    } catch (err) {
      console.error("Error al crear agendamiento:", err);
      res.status(500).json({ error: "Error al crear agendamiento" });
    }
  },

  // El resto de métodos se mantiene igual:
  listar: async (req, res) => { /* ... */ },
  actualizarEstado: async (req, res) => { /* ... */ },
  obtenerHistorial: async (req, res) => { /* ... */ }
};

module.exports = AgendamientoController;
