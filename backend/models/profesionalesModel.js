const db = require('../database/db');

const ProfesionalesModel = {
  crear: async ({ cedula, nombre, apellido, especialidad_id }) => {
    const query = `
      INSERT INTO profesionales (profesional_id, cedula, especialidad_id)
      VALUES (lower(hex(randomblob(16))), ?, ?)
    `;
    await db.run(query, [cedula, especialidad_id]);

    // Insertar en personas si quieres (opcional)
    await db.run(
      `INSERT INTO personas (cedula, nombre, apellido) VALUES (?, ?, ?)`,
      [cedula, nombre, apellido]
    );
  }
};

module.exports = ProfesionalesModel;
