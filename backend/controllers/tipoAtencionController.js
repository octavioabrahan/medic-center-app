const db = require("../models/db");

const TipoAtencionController = {
  crear: async (req, res) => {
    try {
      const { nombre } = req.body;
      await db.query("INSERT INTO tipo_atencion (nombre) VALUES ($1)", [nombre]);
      res.status(201).json({ mensaje: "Tipo de atención creado" });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Este tipo de atención ya existe." });
      }
      console.error(err);
      res.status(500).json({ error: "Error al crear tipo de atención" });
    }
  },

  listar: async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM tipo_atencion");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al listar tipos de atención" });
    }
  }
};

module.exports = TipoAtencionController;
