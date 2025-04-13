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
      `SELECT * FROM empresas ORDER BY activa DESC, nombre_empresa`
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

  activar: async (id_empresa) => {
    const query = `UPDATE empresas SET activa = true WHERE id_empresa = $1`;
    await db.query(query, [id_empresa]);
  },  
  
  existeRif: async (rif) => {
    const query = `SELECT 1 FROM empresas WHERE LOWER(rif) = LOWER($1)`;
    const result = await db.query(query, [rif]);
    return result.rowCount > 0;
  },  
};

module.exports = EmpresasModel;
