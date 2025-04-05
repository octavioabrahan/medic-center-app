const db = require('./db');

const TipoAtencionModel = {
  crear: async ({ nombre }) => {
    const query = `INSERT INTO tipo_atencion (nombre) VALUES ($1)`;
    await db.query(query, [nombre]);
  },

  listar: async () => {
    const result = await db.query("SELECT * FROM tipo_atencion ORDER BY nombre ASC");
    return result.rows;
  }
};

module.exports = TipoAtencionModel;
