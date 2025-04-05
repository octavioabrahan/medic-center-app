const Model = require("../models/profesionalRolesModel");

const ProfesionalRolesController = {
  asignar: async (req, res) => {
    try {
      await Model.asignar(req.body);
      res.status(201).json({ mensaje: "Rol asignado correctamente" });
    } catch (err) {
      console.error("Error al asignar rol:", err);
      res.status(500).json({ error: "Error al asignar rol" });
    }
  }
};

module.exports = ProfesionalRolesController;
