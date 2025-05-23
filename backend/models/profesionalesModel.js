const db = require('./db');

const ProfesionalesModel = {
  crear: async ({ cedula, nombre, apellido, especialidad_id, telefono, correo }) => {
    const result = await db.query(
      `INSERT INTO profesionales (profesional_id, cedula, nombre, apellido, especialidad_id, telefono, email, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, true)
       RETURNING profesional_id`,
      [cedula, nombre, apellido, especialidad_id, telefono, correo]
    );
    return result.rows[0].profesional_id;
  },
  
  listar: async (onlyActive = true) => {
    const filter = onlyActive ? "WHERE p.is_active = true" : "";
    const result = await db.query(`
      SELECT 
        p.profesional_id,
        p.cedula,
        p.nombre,
        p.apellido,
        p.telefono,
        p.email,
        p.is_active,
        p.id_rol,
        e.nombre AS nombre_especialidad,
        e.especialidad_id,
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
      ${filter}
      GROUP BY p.profesional_id, p.cedula, p.nombre, p.apellido, p.telefono, p.email, p.is_active, p.id_rol, e.nombre, e.especialidad_id, r.nombre_rol
      ORDER BY p.nombre, p.apellido
    `);
    return result.rows;
  },
  
  cambiarEstado: async (profesionalId, estado) => {
    const result = await db.query(
      `UPDATE profesionales SET is_active = $1 WHERE profesional_id = $2 RETURNING *`,
      [estado, profesionalId]
    );
    return result.rows[0];
  },

  actualizar: async (profesionalId, datos) => {
    // Filtrar solo los campos que tienen valor (no undefined, null o vacío)
    const camposActualizar = {};
    const valores = [];
    let contador = 1;
    
    if (datos.cedula !== undefined && datos.cedula !== null && datos.cedula !== '') {
      camposActualizar.cedula = `$${contador}`;
      valores.push(datos.cedula);
      contador++;
    }
    if (datos.nombre !== undefined && datos.nombre !== null && datos.nombre !== '') {
      camposActualizar.nombre = `$${contador}`;
      valores.push(datos.nombre);
      contador++;
    }
    if (datos.apellido !== undefined && datos.apellido !== null && datos.apellido !== '') {
      camposActualizar.apellido = `$${contador}`;
      valores.push(datos.apellido);
      contador++;
    }
    if (datos.especialidad_id !== undefined && datos.especialidad_id !== null && datos.especialidad_id !== '') {
      camposActualizar.especialidad_id = `$${contador}`;
      valores.push(datos.especialidad_id);
      contador++;
    }
    if (datos.telefono !== undefined && datos.telefono !== null) {
      camposActualizar.telefono = `$${contador}`;
      valores.push(datos.telefono);
      contador++;
    }
    if (datos.correo !== undefined && datos.correo !== null) {
      camposActualizar.email = `$${contador}`;
      valores.push(datos.correo);
      contador++;
    }
    
    // Si no hay campos para actualizar, no hacer nada
    if (Object.keys(camposActualizar).length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }
    
    // Construir la consulta dinámicamente
    const setClauses = Object.entries(camposActualizar)
      .map(([campo, placeholder]) => `${campo} = ${placeholder}`)
      .join(', ');
    
    valores.push(profesionalId); // El ID va al final
    
    const query = `
      UPDATE profesionales 
      SET ${setClauses}
      WHERE profesional_id = $${contador}
      RETURNING *
    `;
    
    const result = await db.query(query, valores);
    return result.rows[0];
  }
};

module.exports = ProfesionalesModel;
