const TipoAtencionModel = require("../models/tipoAtencionModel");

const TipoAtencionController = {
  crear: async (req, res) => {
    try {
      const { nombre } = req.body;
      await TipoAtencionModel.crear({ nombre });
      res.status(201).json({ mensaje: "Tipo de atención creado" });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(400).json({ error: "Este tipo de atención ya existe." });
      }
      console.error(err);
      res.status(500).json({ error: "Error al crear tipo de atención" });
    }
  },

  listar: async (req, res) => {
    try {
      const tiposAtencion = await TipoAtencionModel.listar();
      res.json(tiposAtencion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al listar tipos de atención" });
    }
  },
  
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const tipoAtencion = await TipoAtencionModel.obtenerPorId(id);
      
      if (!tipoAtencion) {
        return res.status(404).json({ error: "Tipo de atención no encontrado" });
      }
      
      res.json(tipoAtencion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener tipo de atención" });
    }
  }
};

module.exports = TipoAtencionController;