const db = require("../models/db");

const ServiciosController = {
  listar: async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM servicio ORDER BY nombre_servicio");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener servicios" });
    }
  }
};

module.exports = ServiciosController;
