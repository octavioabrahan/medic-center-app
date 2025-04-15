const fs = require('fs');
const path = require('path');
const mjml = require('mjml');
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
        return res.status(400).json({ error: "Faltan datos obligatorios del paciente." });
      }

      const cedulaPaciente = representante_cedula || cedula;

      const check = await db.query("SELECT * FROM pacientes WHERE cedula = $1", [cedulaPaciente]);

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
        id_categoria,
        id_empresa
      });

      // 🔍 Obtener nombre del profesional
      const result = await db.query(
        "SELECT nombre, apellido FROM profesionales WHERE profesional_id = $1",
        [profesional_id]
      );
      const profesional = result.rows[0];
      const profesionalNombre = profesional
        ? `${profesional.nombre.toUpperCase()} ${profesional.apellido.toUpperCase()}`
        : "Profesional";

      // 🧠 Construcción de fecha legible
      const fechaFormateada = new Date(fecha_agendada).toLocaleDateString("es-CL", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      }).replace(/^./, str => str.toUpperCase());

      // 📬 Renderizar MJML
      const mjmlRaw = fs.readFileSync(
        path.join(__dirname, '../templates/agendamiento.mjml'),
        'utf8'
      );

      const mjmlRenderizado = mjml(mjmlRaw
        .replace(/{{nombre}}/g, nombre)
        .replace(/{{apellido}}/g, apellido)
        .replace(/{{profesional}}/g, profesionalNombre)
        .replace(/{{especialidad}}/g, observaciones)
        .replace(/{{fecha}}/g, fechaFormateada)
        .replace(/{{hora}}/g, hora_inicio?.slice(0, 5) || '---')
        .replace(/{{tipo_atencion}}/g, tipo_atencion_id === 1 ? "consulta médica" : "estudio")
        .replace(/{{numero}}/g, '1') // puedes reemplazarlo dinámicamente después
      );

      await enviarCorreo(
        email || "",
        "Confirmación de cita agendada",
        mjmlRenderizado.html
      );

      res.status(201).json({ mensaje: "Agendamiento registrado correctamente" });

    } catch (err) {
      console.error("Error al crear agendamiento:", err);
      res.status(500).json({ error: "Error al crear agendamiento" });
    }
  },

  listar: async (req, res) => {
    const { status, desde, hasta } = req.query;
    try {
      const resultados = await AgendamientoModel.listar({ status, desde, hasta });
      res.json(resultados);
    } catch (err) {
      console.error("Error al listar agendamientos:", err);
      res.status(500).json({ error: "Error al obtener los agendamientos" });
    }
  },

  actualizarEstado: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pendiente", "confirmada", "cancelada"].includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    try {
      const cambiadoPor = "sistema";
      const actualizado = await AgendamientoModel.actualizarEstado(id, status, cambiadoPor);
      res.json({ status: actualizado });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      res.status(500).json({ error: "Error al actualizar el estado" });
    }
  },

  obtenerHistorial: async (req, res) => {
    const { id } = req.params;
    try {
      const historial = await AgendamientoModel.listarHistorial(id);
      res.json(historial);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      res.status(500).json({ error: "Error al obtener el historial del agendamiento" });
    }
  }
};

module.exports = AgendamientoController;
