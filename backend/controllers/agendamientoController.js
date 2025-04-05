const AgendamientoModel = require('../models/agendamientoModel');

const AgendamientoController = {
  crear: async (req, res) => {
    try {
      const datos = req.body;
      await AgendamientoModel.crearAgendamiento(datos);
      res.status(201).json({ mensaje: 'Agendamiento creado con éxito' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear agendamiento' });
    }
  },

  getByProfesionalYFecha: async (req, res) => {
    const { id, fecha } = req.params;
    try {
      const agendamientos = await AgendamientoModel.obtenerAgendamientosPorProfesionalYFecha(id, fecha);
      res.json(agendamientos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener agendamientos' });
    }
  },
};

module.exports = AgendamientoController;
