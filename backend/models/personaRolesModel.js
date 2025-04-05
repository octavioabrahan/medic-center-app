const db = require("./db");

const PersonaRolesModel = {
  asignarRol: async ({ cedula, id_rol, creado_desde }) => {
    const query = `
      INSERT INTO persona_roles (cedula, id_rol, creado_desde, creado_at)
      VALUES ($1, $2, $3, NOW())
    `;
    await db.query(query, [cedula, id_rol, creado_desde]);
  },

  listarPorCedula: async (cedula) => {
    const result = await db.query(
      "SELECT * FROM persona_roles WHERE cedula = $1",
      [cedula]
    );
    return result.rows;
  }
};

module.exports = PersonaRolesModel;
