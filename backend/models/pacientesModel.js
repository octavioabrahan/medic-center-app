const db = require("./db");

const PacientesModel = {
  crear: async (data) => {
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
      representante_apellido,
    } = data;

    await db.query(
      `INSERT INTO pacientes (
        cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, seguro_medico,
        representante_cedula, representante_nombre, representante_apellido
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        cedula,
        nombre,
        apellido,
        fecha_nacimiento,
        sexo,
        telefono,
        email,
        seguro_medico,
        representante_cedula || null,
        representante_nombre || null,
        representante_apellido || null,
      ]
    );
  },
};

module.exports = PacientesModel;
