const Model = require("../models/tipoAtencionModel");

const TipoAtencionController = {
  crear: async (req, res) => {
    try {
      await Model.crear(req.body);
      res.status(201).json({ mensaje: "Tipo de atención creado" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al guardar tipo de atención" });
    }
  }
};

module.exports = TipoAtencionController;
