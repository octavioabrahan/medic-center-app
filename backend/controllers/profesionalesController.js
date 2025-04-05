const ProfesionalesModel = require("../models/profesionalesModel");

const ProfesionalesController = {
  crear: async (req, res) => {
    try {
      await ProfesionalesModel.crear(req.body);
      res.status(201).json({ mensaje: "Profesional creado con éxito" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al crear profesional" });
    }
  }
};

module.exports = ProfesionalesController;
