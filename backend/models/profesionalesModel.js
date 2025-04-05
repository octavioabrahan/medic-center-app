const db = require('./db');

const ProfesionalesModel = {
  crear: async ({ cedula, nombre, apellido, especialidad_id }) => {
    const result = await db.query(
      `INSERT INTO profesionales (profesional_id, cedula, nombre, apellido, especialidad_id)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING profesional_id`,
      [cedula, nombre, apellido, especialidad_id]
    );
    return result.rows[0].profesional_id;
  },
  

  listar: async () => {
    const result = await db.query(`
      SELECT p.*, e.nombre AS especialidad
      FROM profesionales p
      JOIN especialidades e ON p.especialidad_id = e.especialidad_id
    `);
    return result.rows;
  }
};

module.exports = ProfesionalesModel;
