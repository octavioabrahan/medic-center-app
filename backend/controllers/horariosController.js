const Model = require("../models/horariosModel");

const HorariosController = {
  crear: async (req, res) => {
    try {
      await Model.crear(req.body);
      res.status(201).json({ mensaje: "Horario creado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al guardar horario" });
    }
  }
};

module.exports = HorariosController;
