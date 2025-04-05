const db = require('../database/db');

const TipoAtencionModel = {
  crear: async ({ nombre }) => {
    const query = `INSERT INTO tipo_atencion (nombre) VALUES (?)`;
    await db.run(query, [nombre]);
  }
};

module.exports = TipoAtencionModel;
