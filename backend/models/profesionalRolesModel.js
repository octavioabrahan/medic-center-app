const db = require("./db");

const ProfesionalRolesModel = {
  asignar: async ({ profesional_id, id_rol, creado_desde }) => {
    const query = `
      INSERT INTO profesional_roles (profesional_id, id_rol, creado_desde)
      VALUES ($1, $2, $3)
    `;
    await db.query(query, [profesional_id, id_rol, creado_desde]);
  }
};

module.exports = ProfesionalRolesModel;
