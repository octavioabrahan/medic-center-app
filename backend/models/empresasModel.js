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
    const result = await db.query(
      `SELECT * FROM empresas WHERE activa = true ORDER BY nombre_empresa`
    );
    return result.rows;
  },

  actualizar: async ({ id_empresa, nombre_empresa, rif }) => {
    const query = `
      UPDATE empresas
      SET nombre_empresa = $1, rif = $2
      WHERE id_empresa = $3
    `;
    await db.query(query, [nombre_empresa, rif, id_empresa]);
  },
  
  desactivar: async (id_empresa) => {
    const query = `UPDATE empresas SET activa = false WHERE id_empresa = $1`;
    await db.query(query, [id_empresa]);
  },
  
};

module.exports = EmpresasModel;
