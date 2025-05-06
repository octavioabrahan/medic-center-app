const ScreensModel = require("../models/screensModel");
const logger = require("../utils/logger");

const ScreensController = {
  listar: async (req, res) => {
    try {
      const pantallas = await ScreensModel.listar();
      res.json(pantallas);
    } catch (err) {
      logger.logError('Error al listar pantallas', err);
      res.status(500).json({ error: "Error al obtener pantallas" });
    }
  },

  crear: async (req, res) => {
    try {
      const { name, description, path, icon, orden } = req.body;
      const nuevaPantalla = await ScreensModel.crear({ name, description, path, icon, orden });
      res.status(201).json(nuevaPantalla);
    } catch (err) {
      logger.logError('Error al crear pantalla', err);
      res.status(500).json({ error: "Error al crear pantalla" });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id_screen } = req.params;
      const { name, description, path, icon, orden, is_active } = req.body;
      const pantallaActualizada = await ScreensModel.actualizar(id_screen, { 
        name, 
        description, 
        path, 
        icon, 
        orden, 
        is_active 
      });
      res.json(pantallaActualizada);
    } catch (err) {
      logger.logError('Error al actualizar pantalla', err);
      res.status(500).json({ error: "Error al actualizar pantalla" });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id_screen } = req.params;
      await ScreensModel.eliminar(id_screen);
      res.json({ mensaje: "Pantalla eliminada correctamente" });
    } catch (err) {
      logger.logError('Error al eliminar pantalla', err);
      res.status(500).json({ error: "Error al eliminar pantalla" });
    }
  }
};

module.exports = ScreensController;