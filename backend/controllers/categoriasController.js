const db = require("../models/db");

const CategoriasController = {
  listar: async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM categoria ORDER BY nombre_categoria");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener categorías" });
    }
  }
};

module.exports = CategoriasController;
