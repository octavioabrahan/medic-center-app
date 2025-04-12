const db = require("../models/db");
const PacientesModel = require("../models/pacientesModel");
const AgendamientoModel = require("../models/agendamientoModel");
const { enviarCorreo } = require("../utils/mailer");

const AgendamientoController = {
  crear: async (req, res) => {
    try {
      const {
        cedula,
        paciente,
        profesional_id,
        fecha_agendada,
        tipo_atencion,
        detalle,
        hora_inicio
      } = req.body;

      if (!paciente || !paciente.nombre || !paciente.apellido || !paciente.fecha_nacimiento || !paciente.sexo) {
        return res.status(400).json({ error: "Faltan datos obligatorios del paciente." });
      }

      const cedulaPaciente = paciente.representante_cedula
        ? paciente.representante_cedula
        : cedula;

      const check = await db.query("SELECT * FROM pacientes WHERE cedula = $1", [cedulaPaciente]);

      if (check.rowCount === 0) {
        await PacientesModel.crear({
          cedula: cedulaPaciente,
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          fecha_nacimiento: paciente.fecha_nacimiento,
          sexo: paciente.sexo,
          telefono: paciente.telefono || null,
          email: paciente.email || null,
          seguro_medico: paciente.seguro_medico || false,
          representante_cedula: paciente.representante_cedula || null,
          representante_nombre: paciente.representante_nombre || null,
          representante_apellido: paciente.representante_apellido || null
        });
      }

      await AgendamientoModel.crear({
        cedula: cedulaPaciente,
        fecha_agendada,
        convenio: false,
        profesional_id,
        tipo_atencion_id: 1,
        observaciones: detalle,
        hora_inicio
      });

      await enviarCorreo(
        paciente.email || '',
        "Confirmación de cita agendada",
        `
          <h3>Tu cita fue registrada correctamente</h3>
          <p><strong>Paciente:</strong> ${paciente.nombre} ${paciente.apellido}</p>
          <p><strong>Fecha:</strong> ${fecha_agendada}</p>
          <p><strong>Hora:</strong> ${hora_inicio || 'No especificada'}</p>
        `
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
      // Si se proporcionaron parámetros específicos, usar el método original
      if (status || desde || hasta) {
        const resultados = await AgendamientoModel.listar({ status, desde, hasta });
        return res.json(resultados);
      }
      
      // De lo contrario, usar la nueva consulta que incluye datos del paciente
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
  },
  
  actualizarEstado: async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pendiente', 'confirmada', 'cancelada'].includes(status)) {
      return res.status(400).json({ error: "Estado inválido" });
    }
    
    try {
      const actualizado = await AgendamientoModel.actualizarEstado(id, status);
      res.json({ status: actualizado });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      res.status(500).json({ error: "Error al actualizar el estado" });
    }
  }
};

module.exports = AgendamientoController;