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
  },

  actualizar: async (id, { nombre }) => {
    const result = await db.query(
      "UPDATE especialidades SET nombre = $1 WHERE especialidad_id = $2 RETURNING *",
      [nombre, id]
    );
    return result.rows[0];
  },

  eliminar: async (id) => {
    // Primero verificar si la especialidad está siendo usada por algún profesional
    const checkResult = await db.query(
      "SELECT COUNT(*) as count FROM profesionales WHERE especialidad_id = $1",
      [id]
    );
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      throw new Error('No se puede eliminar la especialidad porque está siendo utilizada por uno o más profesionales');
    }
    
    const result = await db.query(
      "DELETE FROM especialidades WHERE especialidad_id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },

  obtenerPorId: async (id) => {
    const result = await db.query(
      "SELECT * FROM especialidades WHERE especialidad_id = $1",
      [id]
    );
    return result.rows[0];
  }
};

module.exports = EspecialidadesModel;
