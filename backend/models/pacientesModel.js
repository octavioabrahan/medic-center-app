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
      representante_apellido,
      id_empresa
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
        representante_apellido,
        id_empresa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;
  
    await db.query(query, [
      cedula,
      nombre,
      apellido,
      fecha_nacimiento,
      sexo ? sexo.toLowerCase() : null,
      telefono,
      email,
      seguro_medico,
      representante_cedula,
      representante_nombre,
      representante_apellido,
      id_empresa || null
    ]);
  }  
};

module.exports = PacientesModel;
