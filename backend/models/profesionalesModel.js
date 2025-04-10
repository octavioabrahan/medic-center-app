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
      SELECT 
        p.profesional_id,
        p.cedula,
        p.nombre,
        p.apellido,
        e.nombre AS nombre_especialidad,
        r.nombre_rol AS nombre_rol,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.nombre_servicio), NULL) AS servicios,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT c.nombre_categoria), NULL) AS categorias
      FROM profesionales p
      LEFT JOIN especialidades e ON p.especialidad_id = e.especialidad_id
      LEFT JOIN roles r ON p.id_rol = r.id_rol
      LEFT JOIN profesional_servicio ps ON p.profesional_id = ps.profesional_id
      LEFT JOIN servicio s ON ps.id_servicio = s.id_servicio
      LEFT JOIN profesional_categoria pc ON p.profesional_id = pc.profesional_id
      LEFT JOIN categoria c ON pc.id_categoria = c.id_categoria
      GROUP BY p.profesional_id, p.cedula, p.nombre, p.apellido, e.nombre, r.nombre_rol
      ORDER BY p.nombre, p.apellido
    `);
    return result.rows;
  }
  
};

module.exports = ProfesionalesModel;
