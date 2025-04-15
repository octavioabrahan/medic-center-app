const db = require("../models/db");

const ProfesionalServicioController = {
  listar: async (req, res) => {
    try {
      const result = await db.query(`
        SELECT ps.profesional_id, ps.id_servicio
        FROM profesional_servicio ps
      `);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener relaciones profesional-servicio" });
    }
  }
};

module.exports = ProfesionalServicioController;