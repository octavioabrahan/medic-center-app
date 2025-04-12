const db = require('./db');

const PacientesModel = {
  crear: async (datos) => {
    const {
      cedula,
      nombre,
      apellido,
      fecha_nacimiento,
      sexo,
      telefono,
      email,
      seguro_medico,
      representante_cedula,
      representante_nombre,
      representante_apellido
    } = datos;

    const query = `
      INSERT INTO pacientes (
        cedula,
        nombre,
        apellido,
        fecha_nacimiento,
        sexo,
        telefono,
        email,
        seguro_medico,
        representante_cedula,
        representante_nombre,
        representante_apellido
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    await db.query(query, [
      cedula,
      nombre,
      apellido,
      fecha_nacimiento,
      sexo ? sexo.toULowerCase() : null,
      telefono,
      email,
      seguro_medico,
      representante_cedula,
      representante_nombre,
      representante_apellido
    ]);
  }
};

module.exports = PacientesModel;
