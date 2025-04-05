const Model = require("../models/horariosModel");

router.get("/fechas/:id", controller.listarFechasPorProfesional);

const HorariosController = {
  crear: async (req, res) => {
    try {
      await Model.crear(req.body);
      res.status(201).json({ mensaje: "Horario creado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al guardar horario" });
    }
  },

  listarPorProfesional: async (req, res) => {
    const { id } = req.params;
    try {
      const horarios = await Model.listarPorProfesional(id);
      res.json(horarios);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener horarios" });
    }
  },

  listarFechasPorProfesional: async (req, res) => {
    try {
      const fechas = await Model.listarFechasPorProfesional(req.params.id);
      res.json(fechas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener fechas activas" });
    }
  }
  
};

module.exports = HorariosController;
