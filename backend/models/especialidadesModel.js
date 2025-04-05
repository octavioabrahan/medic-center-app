const db = require('./db'); // PostgreSQL Pool

const EspecialidadesModel = {
  crear: async ({ nombre }) => {
    const query = `
      INSERT INTO especialidades (especialidad_id, nombre)
      VALUES (gen_random_uuid(), $1)
    `;
    await db.query(query, [nombre]);
  },

  listar: async () => {
    const result = await db.query("SELECT * FROM especialidades ORDER BY nombre ASC");
    return result.rows;
  }
};

module.exports = EspecialidadesModel;
