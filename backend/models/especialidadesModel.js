const db = require('../database/db');

const EspecialidadesModel = {
  crear: async ({ nombre }) => {
    const query = `
      INSERT INTO especialidades (especialidad_id, nombre)
      VALUES (lower(hex(randomblob(16))), ?)
    `;
    await db.run(query, [nombre]);
  }
};

module.exports = EspecialidadesModel;
