const Model = require("../models/profesionalesModel");

const ProfesionalesController = {
  crear: async (req, res) => {
    try {
      const id = await Model.crear(req.body);
      res.status(201).json({ profesional_id: id });
    } catch (err) {
      console.error("Error al crear profesional:", err);
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
