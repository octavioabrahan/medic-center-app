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
  }
};

module.exports = EspecialidadesController;
