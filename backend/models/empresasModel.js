const db = require("./db");

const EmpresasModel = {
  crear: async ({ nombre_empresa, rif }) => {
    const query = `
      INSERT INTO empresas (nombre_empresa, rif)
      VALUES ($1, $2)
      RETURNING id_empresa
    `;
    const result = await db.query(query, [nombre_empresa, rif]);
    return result.rows[0];
  },

  listar: async () => {
    const result = await db.query(`SELECT * FROM empresas ORDER BY nombre_empresa`);
    return result.rows;
  }
};

module.exports = EmpresasModel;
