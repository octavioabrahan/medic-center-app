const model = require("../models/empresasModel");

const EmpresasController = {
  crear: async (req, res) => {
    const { nombre_empresa, rif } = req.body;

    if (!nombre_empresa || !rif) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    try {
      const empresa = await model.crear({ nombre_empresa, rif });
      res.status(201).json(empresa);
    } catch (err) {
      console.error("Error al registrar empresa:", err);
      res.status(500).json({ error: "Error al registrar la empresa" });
    }
  },

  listar: async (_req, res) => {
    try {
      const empresas = await model.listar();
      res.json(empresas);
    } catch (err) {
      console.error("Error al listar empresas:", err);
      res.status(500).json({ error: "Error al obtener empresas" });
    }
  },

  actualizar: async (req, res) => {
    const { id_empresa, nombre_empresa, rif } = req.body;
    try {
      await model.actualizar({ id_empresa, nombre_empresa, rif });
      res.json({ mensaje: "Empresa actualizada" });
    } catch (err) {
      console.error("Error al actualizar empresa:", err);
      res.status(500).json({ error: "Error al actualizar empresa" });
    }
  },
  
  desactivar: async (req, res) => {
    const { id } = req.params;
    try {
      await model.desactivar(id);
      res.json({ mensaje: "Empresa desactivada" });
    } catch (err) {
      console.error("Error al desactivar empresa:", err);
      res.status(500).json({ error: "Error al desactivar empresa" });
    }
  },
  
};

module.exports = EmpresasController;
