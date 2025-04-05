const db = require('./db');

const ProfesionalesModel = {
  crear: async ({ cedula, nombre, apellido, especialidad_id }) => {
    // Insertar en personas
    await db.query(
      `INSERT INTO personas (cedula, nombre, apellido) VALUES ($1, $2, $3)
       ON CONFLICT (cedula) DO NOTHING`,
      [cedula, nombre, apellido]
    );

    // Insertar en profesionales
    await db.query(
      `INSERT INTO profesionales (profesional_id, cedula, especialidad_id)
       VALUES (gen_random_uuid(), $1, $2)`,
      [cedula, especialidad_id]
    );
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
