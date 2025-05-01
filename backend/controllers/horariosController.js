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
  },

  actualizar: async (req, res) => {
    const { id } = req.params;
    try {
      await Model.actualizar(id, req.body);
      res.json({ mensaje: "Horario actualizado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al actualizar horario" });
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
  },
  
  listarTodos: async (req, res) => {
    try {
      const horarios = await Model.listarTodos();
      res.json(horarios);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener todos los horarios" });
    }
  },

  eliminar: async (req, res) => {
    const { id } = req.params;
    try {
      await Model.eliminar(id);
      res.json({ mensaje: "Horario eliminado correctamente" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al eliminar horario" });
    }
  }
};

module.exports = HorariosController;
