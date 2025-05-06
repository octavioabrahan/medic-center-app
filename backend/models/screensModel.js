const db = require("./db");

const ScreensModel = {
  listar: async () => {
    const query = `
      SELECT * FROM screens 
      WHERE is_active = true
      ORDER BY orden ASC
    `;
    const result = await db.query(query);
    return result.rows;
  },
  
  crear: async ({ name, description, path, icon, orden }) => {
    const query = `
      INSERT INTO screens (name, description, path, icon, orden)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await db.query(query, [name, description, path, icon, orden]);
    return result.rows[0];
  },
  
  actualizar: async (id_screen, { name, description, path, icon, orden, is_active }) => {
    const query = `
      UPDATE screens
      SET name = $2, description = $3, path = $4, icon = $5, orden = $6, is_active = $7
      WHERE id_screen = $1
      RETURNING *
    `;
    const result = await db.query(query, [id_screen, name, description, path, icon, orden, is_active]);
    return result.rows[0];
  },
  
  eliminar: async (id_screen) => {
    const query = `DELETE FROM screens WHERE id_screen = $1`;
    await db.query(query, [id_screen]);
  }
};

module.exports = ScreensModel;