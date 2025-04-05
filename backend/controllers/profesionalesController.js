const Model = require("../models/profesionalesModel");

const ProfesionalesController = {
  crear: async (req, res) => {
    try {
      await Model.crear(req.body);
      res.status(201).json({ mensaje: "Profesional creado con éxito" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al crear profesional" });
    }
  },

  listar: async (req, res) => {
    try {
      const profesionales = await Model.listar();
      res.json(profesionales);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener profesionales" });
    }
  }
};

module.exports = ProfesionalesController;
