const db = require('./db');

const CategoriasModel = {
  listar: async () => {
    const result = await db.query("SELECT * FROM categoria ORDER BY nombre_categoria ASC");
    return result.rows;
  },
  
  obtenerPorId: async (id) => {
    const result = await db.query("SELECT * FROM categoria WHERE id_categoria = $1", [id]);
    return result.rows[0];
  }
};

module.exports = CategoriasModel;