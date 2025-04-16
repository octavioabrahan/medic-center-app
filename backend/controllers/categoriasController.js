const CategoriasModel = require("../models/categoriasModel");

const CategoriasController = {
  listar: async (req, res) => {
    try {
      const categorias = await CategoriasModel.listar();
      res.json(categorias);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener categorías" });
    }
  },
  
  obtenerPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const categoria = await CategoriasModel.obtenerPorId(id);
      
      if (!categoria) {
        return res.status(404).json({ error: "Categoría no encontrada" });
      }
      
      res.json(categoria);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al obtener categoría" });
    }
  }
};

module.exports = CategoriasController;