const db = require("../models/db");
const PacientesModel = require("../models/pacientesModel");
const AgendamientoModel = require("../models/agendamientoModel");

const AgendamientoController = {
  crear: async (req, res) => {
    const datos = req.body;
    try {
      // Verificar si el paciente ya existe
      const check = await db.query("SELECT * FROM pacientes WHERE cedula = $1", [datos.cedula]);

      if (check.rowCount === 0) {
        await PacientesModel.crear(datos);
      }

      await AgendamientoModel.crear(datos);

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
