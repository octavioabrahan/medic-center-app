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
  }
};

module.exports = EspecialidadesController;
