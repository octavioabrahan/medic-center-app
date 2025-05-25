const fs = require('fs');
const path = require('path');
const mjml = require('mjml');
const moment = require('moment');
const db = require("../models/db");
const PacientesModel = require("../models/pacientesModel");
const AgendamientoModel = require("../models/agendamientoModel");
const HorariosModel = require("../models/horariosModel");
const ExcepcionesModel = require("../models/excepcionesModel");
const { enviarCorreo } = require("../utils/mailer");

// Función para obtener horarios de un profesional en una fecha específica
async function obtenerHorariosPorFecha(profesional_id, fecha) {
  try {
    // 1. Verificar si hay excepciones para esta fecha
    const excepcionesResult = await db.query(
      `SELECT fecha, estado, hora_inicio, hora_termino 
       FROM horario_excepciones 
       WHERE profesional_id = $1 AND fecha = $2`,
      [profesional_id, fecha]
    );

    if (excepcionesResult.rows.length > 0) {
      const excepcion = excepcionesResult.rows[0];
      if (excepcion.estado === 'cancelado') {
        return null; // No hay horarios este día
      }
      if (excepcion.estado === 'manual') {
        return {
          hora_inicio: excepcion.hora_inicio,
          hora_termino: excepcion.hora_termino
        };
      }
    }

    // 2. Si no hay excepciones, buscar en horarios regulares
    const fechaMoment = moment(fecha);
    const diaSemana = fechaMoment.isoWeekday(); // 1=Lunes, 7=Domingo

    const horariosResult = await db.query(
      `SELECT hora_inicio, hora_termino 
       FROM horario_medico 
       WHERE profesional_id = $1 
       AND $2 = ANY(dia_semana) 
       AND $3 >= valido_desde 
       AND $3 <= valido_hasta`,
      [profesional_id, diaSemana, fecha]
    );

    if (horariosResult.rows.length > 0) {
      const horario = horariosResult.rows[0];
      return {
        hora_inicio: horario.hora_inicio,
        hora_termino: horario.hora_termino
      };
    }

    return null; // No se encontraron horarios
  } catch (error) {
    console.error('Error al obtener horarios por fecha:', error);
    return null;
  }
}

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
        id_empresa,
        archivo_adjunto_id
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
        id_empresa,
        archivo_adjunto_id
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

      // 🕐 Obtener horarios del profesional para la fecha específica
      const horarios = await obtenerHorariosPorFecha(profesional_id, fecha_agendada);
      let horaInicio = '---';
      let horaFin = '---';
      
      if (horarios) {
        horaInicio = horarios.hora_inicio ? horarios.hora_inicio.slice(0, 5) : '---';
        horaFin = horarios.hora_termino ? horarios.hora_termino.slice(0, 5) : '---';
      }

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
        .replace(/{{hora_inicio}}/g, horaInicio)
        .replace(/{{hora_fin}}/g, horaFin)
        .replace(/{{hora}}/g, horaInicio) // Mantenemos compatibilidad con el template actual
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
