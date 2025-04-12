const db = require("./db");

const PacientesModel = {
  crear: async ({
    cedula,
    nombre,
    apellido,
    fecha_nacimiento,
    sexo,
    telefono,
    email,
    representante_nombre,
    representante_apellido,
    representante_telefono,
    representante_email
  }) => {
    await db.query(
      `INSERT INTO pacientes (
        cedula, nombre, apellido, fecha_nacimiento, sexo,
        telefono, email, representante_nombre, representante_apellido,
        representante_telefono, representante_email
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
        representante_nombre,
        representante_apellido,
        representante_telefono,
        representante_email
      ]
    );
  }
};

module.exports = PacientesModel;
