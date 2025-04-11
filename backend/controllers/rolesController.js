const Model = require("../models/rolesModel");
const db = require("../models/db");

const RolesController = {
  crear: async (req, res) => {
    try {
      const { nombre_rol, descripcion } = req.body;
      await db.query("INSERT INTO roles (nombre_rol, descripcion) VALUES ($1, $2)", [nombre_rol, descripcion]);
      res.status(201).json({ mensaje: "Rol creado" });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Este nombre de rol ya existe." });
      }
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
