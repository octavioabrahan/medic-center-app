const Model = require("../models/rolesModel");

const RolesController = {
  crear: async (req, res) => {
    try {
      await Model.crear(req.body);
      res.status(201).json({ mensaje: "Rol creado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al crear rol" });
    }
  },

  listar: async (req, res) => {
    try {
      const roles = await Model.listar();
      res.json(roles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener roles" });
    }
  }
};

module.exports = RolesController;
