const Model = require("../models/personaRolesModel");

const PersonaRolesController = {
  asignar: async (req, res) => {
    try {
      await Model.asignarRol(req.body);
      res.status(201).json({ mensaje: "Rol asignado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al asignar rol" });
    }
  },

  obtener: async (req, res) => {
    const { cedula } = req.params;
    try {
      const roles = await Model.listarPorCedula(cedula);
      res.json(roles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener roles de la persona" });
    }
  }
};

module.exports = PersonaRolesController;
