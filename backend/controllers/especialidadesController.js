const Model = require("../models/especialidadesModel");
const db = require("../models/db");

// Cache para especialidades
let especialidadesCache = {
  data: null,
  lastUpdated: null,
  expirationTimeMs: 30 * 60 * 1000 // 30 minutos
};

const EspecialidadesController = {
  crear: async (req, res) => {
    try {
      const { nombre } = req.body;
      await db.query("INSERT INTO especialidades (nombre) VALUES ($1)", [nombre]);
      
      // Invalidar cache después de crear una nueva especialidad
      especialidadesCache.data = null;
      
      res.status(201).json({ mensaje: "Especialidad creada" });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Esta especialidad ya existe." });
      }
      console.error(err);
      res.status(500).json({ error: "Error al crear especialidad" });
    }
  },

  listar: async (req, res) => {
    try {
      // Comprobar si hay datos en caché válidos
      const now = Date.now();
      if (
        especialidadesCache.data && 
        especialidadesCache.lastUpdated && 
        (now - especialidadesCache.lastUpdated < especialidadesCache.expirationTimeMs)
      ) {
        return res.json(especialidadesCache.data);
      }

      // Si no hay caché o está caducado, consultar la base de datos
      const especialidades = await Model.listar();
      
      // Actualizar la caché
      especialidadesCache.data = especialidades;
      especialidadesCache.lastUpdated = now;
      
      res.json(especialidades);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener especialidades" });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre } = req.body;
      
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ error: "El nombre de la especialidad es obligatorio" });
      }
      
      const especialidad = await Model.actualizar(id, { nombre: nombre.trim() });
      
      if (!especialidad) {
        return res.status(404).json({ error: "Especialidad no encontrada" });
      }
      
      // Invalidar cache después de actualizar
      especialidadesCache.data = null;
      
      res.json({ 
        mensaje: "Especialidad actualizada correctamente",
        especialidad
      });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Ya existe una especialidad con este nombre." });
      }
      console.error("Error al actualizar especialidad:", err);
      res.status(500).json({ error: "Error al actualizar especialidad" });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      
      const especialidad = await Model.eliminar(id);
      
      if (!especialidad) {
        return res.status(404).json({ error: "Especialidad no encontrada" });
      }
      
      // Invalidar cache después de eliminar
      especialidadesCache.data = null;
      
      res.json({ 
        mensaje: "Especialidad eliminada correctamente",
        especialidad
      });
    } catch (err) {
      if (err.message.includes('está siendo utilizada')) {
        return res.status(400).json({ error: err.message });
      }
      console.error("Error al eliminar especialidad:", err);
      res.status(500).json({ error: "Error al eliminar especialidad" });
    }
  }
};

module.exports = EspecialidadesController;
