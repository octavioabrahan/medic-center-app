const db = require("./db");

const RolesModel = {
  crear: async ({ nombre_rol, descripcion }) => {
    const query = `
      INSERT INTO roles (id_rol, nombre_rol, descripcion)
      VALUES (gen_random_uuid(), $1, $2)
    `;
    await db.query(query, [nombre_rol, descripcion]);
  },

  listar: async () => {
    const result = await db.query("SELECT * FROM roles ORDER BY nombre_rol ASC");
    return result.rows;
  }
};

module.exports = RolesModel;
