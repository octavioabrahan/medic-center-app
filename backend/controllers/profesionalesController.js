const Model = require("../models/profesionalesModel");

const ProfesionalesController = {
  crear: async ({ cedula, nombre, apellido, especialidad_id }) => {
    const { rows } = await db.query(
      `INSERT INTO profesionales (profesional_id, cedula, especialidad_id)
       VALUES (gen_random_uuid(), $1, $2)
       RETURNING profesional_id`,
      [cedula, especialidad_id]
    );
    return rows[0].profesional_id;
  }

  listar: async (req, res) => {
    try {
      const profesionales = await Model.listar();
      res.json(profesionales);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener profesionales" });
    }
  }
};

module.exports = ProfesionalesController;
