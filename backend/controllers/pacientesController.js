const Model = require("../models/pacientesModel");

const PacientesController = {
  crear: async (req, res) => {
    try {
      await Model.crear(req.body);
      res.status(201).json({ mensaje: "Paciente creado con éxito" });
    } catch (err) {
      console.error("Error al crear paciente:", err);
      res.status(500).json({ error: "Error al crear paciente" });
    }
  },
};

module.exports = PacientesController;
