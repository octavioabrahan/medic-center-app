const Model = require("../models/excepcionesModel");

const ExcepcionesController = {
  crear: async (req, res) => {
    try {
      await Model.crear(req.body);
      res.status(201).json({ mensaje: "Excepción registrada" });
    } catch (err) {
      console.error("Error al registrar excepción:", err);
      res.status(500).json({ error: "Error al guardar excepción" });
    }
  },

  listarPorProfesional: async (req, res) => {
    try {
      const data = await Model.listarPorProfesional(req.params.id);
      res.json(data);
    } catch (err) {
      console.error("Error al listar excepciones:", err);
      res.status(500).json({ error: "Error al obtener excepciones" });
    }
  }
};

module.exports = ExcepcionesController;
