const Model = require("../models/especialidadesModel");
const db = require("../models/db");

const EspecialidadesController = {
  crear: async (req, res) => {
    try {
      const { nombre } = req.body;
      await db.query("INSERT INTO especialidades (nombre) VALUES ($1)", [nombre]);
      res.status(201).json({ mensaje: "Especialidad creada" });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Esta especialidad ya existe." });
      }
      console.error(err);
      res.status(500).json({ error: "Error al crear especialidad" });
    }
  },

  listar: async (req, res) => {
    try {
      const especialidades = await Model.listar();
      res.json(especialidades);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener especialidades" });
    }
  }
};

module.exports = EspecialidadesController;
