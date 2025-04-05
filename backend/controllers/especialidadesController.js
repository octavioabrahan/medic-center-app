const Model = require("../models/especialidadesModel");

const EspecialidadesController = {
  crear: async (req, res) => {
    try {
      await Model.crear(req.body);
      res.status(201).json({ mensaje: "Especialidad creada" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al guardar especialidad" });
    }
  },

  listar: async (req, res) => {
    try {
      const especialidades = await Model.listar();
      res.json(especialidades);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener especialidades" });
    }
  }
};

module.exports = EspecialidadesController;
