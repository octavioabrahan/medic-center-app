const db = require('./db');
const { generarPDF } = require('../utils/pdf');
const { enviarCorreo } = require('../utils/mailer');
const { logGeneral, logPDF, logEmail } = require('../utils/logger');

const CotizacionesModel = {
  /**
   * Crea una nueva cotización relacionada con un paciente
   */
  crear: async (datos) => {
    const { 
      nombre, 
      apellido, 
      cedula, 
      email, 
      telefono, 
      examenes,
      tasaCambio
    } = datos;
    
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Buscar si el paciente ya existe por cédula
      const pacienteQuery = await client.query(
        'SELECT * FROM pacientes WHERE cedula = $1',
        [cedula]
      );
      
      // Si no existe, crear un nuevo paciente
      if (pacienteQuery.rows.length === 0) {
        await client.query(
          'INSERT INTO pacientes (cedula, nombre, apellido, telefono, email) VALUES ($1, $2, $3, $4, $5)',
          [cedula, nombre, apellido, telefono, email]
        );
        logGeneral(`🆕 Paciente creado: ${nombre} ${apellido} (${cedula})`);
      } else {
        // Si existe, actualizar datos de contacto
        await client.query(
          'UPDATE pacientes SET email = $1, telefono = $2 WHERE cedula = $3',
          [email, telefono, cedula]
        );
        logGeneral(`🔁 Paciente actualizado: ${nombre} ${apellido}`);
      }
      
      // Calcular totales
      const totalUSD = examenes.reduce((sum, examen) => sum + Number(examen.precio), 0);
      const totalVES = totalUSD * tasaCambio;
      
      // Guardar cotización con referencia a la cédula del paciente
      const resultCotizacion = await client.query(
        'INSERT INTO cotizaciones (paciente_id, total_usd, total_ves, estado) VALUES ($1, $2, $3, $4) RETURNING id',
        [cedula, totalUSD, totalVES, 'pendiente']
      );
      
      const cotizacionId = resultCotizacion.rows[0].id;
      
      // Registrar exámenes cotizados
      for (const examen of examenes) {
        await client.query(
          'INSERT INTO cotizacion_examenes (cotizacion_id, examen_codigo, nombre_examen, precio_usd, precio_ves, tiempo_entrega) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            cotizacionId, 
            examen.codigo, 
            examen.nombre, 
            Number(examen.precio), 
            Number(examen.precio) * tasaCambio,
            examen.tiempo_entrega || null
          ]
        );
      }
      
      await client.query('COMMIT');
      
      return { 
        id: cotizacionId, 
        cedula,
        totalUSD,
        totalVES
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
  
  /**
   * Genera PDF y envía email con la cotización
   */
  procesarDocumentos: async (cotizacionId, nombreCompleto, email) => {
    try {
      // Obtener datos completos de la cotización
      const cotizacion = await CotizacionesModel.obtenerPorId(cotizacionId);
      
      if (!cotizacion) {
        throw new Error(`Cotización ${cotizacionId} no encontrada`);
      }
      
      // Generar PDF
      const rutaPDF = await generarPDF(nombreCompleto, {
        paciente: {
          nombre: cotizacion.nombre,
          apellido: cotizacion.apellido,
          cedula: cotizacion.cedula,
          email: cotizacion.email,
          telefono: cotizacion.telefono
        },
        cotizacion: cotizacion.examenes,
        totalUSD: cotizacion.total_usd,
        totalVES: cotizacion.total_ves,
        fecha: cotizacion.fecha
      });
      
      // Enviar correo si hay email
      if (email) {
        await enviarCorreo(email, 'Tu Cotización Médica', `
          <p>Hola ${nombreCompleto},</p>
          <p>Adjunto encontrarás tu cotización médica en formato PDF.</p>
        `, rutaPDF);
        
        logEmail(`📤 Enviado a ${email} -> archivo: ${rutaPDF}`);
        
        // Registrar el envío de email
        await db.query(
          'INSERT INTO cotizacion_seguimiento (cotizacion_id, tipo, usuario, comentario, resultado) VALUES ($1, $2, $3, $4, $5)',
          [cotizacionId, 'email', 'sistema', 'Envío automático de cotización', 'enviado']
        );
        
        return { enviado: true, rutaPDF };
      }
      
      return { enviado: false, rutaPDF };
    } catch (error) {
      logEmail(`❌ Error procesando documentos: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Obtiene una cotización por su ID, incluyendo todos los datos relacionados
   */
  obtenerPorId: async (id) => {
    const client = await db.connect();
    
    try {
      // Obtener datos de la cotización
      const cotizacionResult = await client.query(`
        SELECT 
          c.id, 
          c.fecha, 
          c.total_usd, 
          c.total_ves, 
          c.estado, 
          c.observaciones,
          c.responsable,
          p.cedula,
          p.nombre,
          p.apellido,
          p.telefono,
          p.email
        FROM cotizaciones c
        JOIN pacientes p ON c.paciente_id = p.cedula
        WHERE c.id = $1
      `, [id]);
      
      if (cotizacionResult.rows.length === 0) {
        return null;
      }
      
      const cotizacion = cotizacionResult.rows[0];
      
      // Obtener exámenes de la cotización
      const examenesResult = await client.query(`
        SELECT * FROM cotizacion_examenes
        WHERE cotizacion_id = $1
        ORDER BY id
      `, [id]);
      
      cotizacion.examenes = examenesResult.rows;
      
      // Obtener seguimiento de la cotización
      const seguimientoResult = await client.query(`
        SELECT * FROM cotizacion_seguimiento
        WHERE cotizacion_id = $1
        ORDER BY fecha DESC
      `, [id]);
      
      cotizacion.seguimiento = seguimientoResult.rows;
      
      return cotizacion;
    } finally {
      client.release();
    }
  },
  
  /**
   * Obtiene cotizaciones para el panel administrativo con filtros
   */
  obtenerParaAdmin: async (filtros = {}) => {
    const { 
      cedula, 
      nombre,
      estado, 
      fechaDesde, 
      fechaHasta,
      page = 1, 
      limit = 20 
    } = filtros;
    
    let query = `
      SELECT 
        c.id, 
        c.fecha, 
        c.total_usd, 
        c.total_ves, 
        c.estado, 
        c.responsable,
        p.cedula,
        p.nombre,
        p.apellido,
        p.telefono,
        p.email
      FROM cotizaciones c
      JOIN pacientes p ON c.paciente_id = p.cedula
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Aplicar filtros
    if (cedula) {
      query += ` AND p.cedula = $${paramIndex++}`;
      params.push(cedula);
    }
    
    if (nombre) {
      query += ` AND (LOWER(p.nombre) LIKE $${paramIndex++} OR LOWER(p.apellido) LIKE $${paramIndex++})`;
      const termBusqueda = `%${nombre.toLowerCase()}%`;
      params.push(termBusqueda, termBusqueda);
    }
    
    if (estado) {
      query += ` AND c.estado = $${paramIndex++}`;
      params.push(estado);
    }
    
    if (fechaDesde) {
      query += ` AND c.fecha >= $${paramIndex++}`;
      params.push(fechaDesde);
    }
    
    if (fechaHasta) {
      query += ` AND c.fecha <= $${paramIndex++}`;
      params.push(fechaHasta);
    }
    
    // Ordenar y paginar
    query += ` ORDER BY c.fecha DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, (page - 1) * limit);
    
    // Consulta de conteo para la paginación
    let countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) FROM').replace(/ORDER BY .* LIMIT.*/, '');
    
    const client = await db.connect();
    
    try {
      const result = await client.query(query, params);
      const countResult = await client.query(countQuery, params.slice(0, -2));
      
      return {
        cotizaciones: result.rows,
        total: parseInt(countResult.rows[0].count),
        page,
        limit
      };
    } finally {
      client.release();
    }
  },
  
  /**
   * Actualiza el estado de una cotización
   */
  actualizarEstado: async (id, estado, responsable = null, observaciones = null) => {
    const query = `
      UPDATE cotizaciones
      SET 
        estado = $1,
        responsable = COALESCE($2, responsable),
        observaciones = COALESCE($3, observaciones)
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await db.query(query, [estado, responsable, observaciones, id]);
    return result.rows[0];
  },
  
  /**
   * Registra una nueva entrada de seguimiento
   */
  agregarSeguimiento: async (datos) => {
    const { cotizacionId, tipo, usuario, comentario, resultado } = datos;
    
    const query = `
      INSERT INTO cotizacion_seguimiento 
        (cotizacion_id, tipo, usuario, comentario, resultado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      cotizacionId, 
      tipo, 
      usuario, 
      comentario, 
      resultado
    ]);
    
    return result.rows[0];
  },
  
  /**
   * Obtiene estadísticas para el dashboard administrativo
   */
  obtenerEstadisticas: async (fechaDesde, fechaHasta) => {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Total de cotizaciones por estado
      const estadosResult = await client.query(`
        SELECT estado, COUNT(*) as cantidad, SUM(total_usd) as suma_usd
        FROM cotizaciones
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY estado
      `, [fechaDesde, fechaHasta]);
      
      // Exámenes más solicitados
      const examenesResult = await client.query(`
        SELECT examen_codigo, nombre_examen, COUNT(*) as cantidad
        FROM cotizacion_examenes ce
        JOIN cotizaciones c ON ce.cotizacion_id = c.id
        WHERE c.fecha BETWEEN $1 AND $2
        GROUP BY examen_codigo, nombre_examen
        ORDER BY cantidad DESC
        LIMIT 10
      `, [fechaDesde, fechaHasta]);
      
      // Cotizaciones por día (para gráfico)
      const cotizacionesPorDiaResult = await client.query(`
        SELECT 
          DATE(fecha) as dia, 
          COUNT(*) as cantidad, 
          SUM(total_usd) as suma_usd
        FROM cotizaciones
        WHERE fecha BETWEEN $1 AND $2
        GROUP BY dia
        ORDER BY dia
      `, [fechaDesde, fechaHasta]);
      
      await client.query('COMMIT');
      
      return {
        porEstado: estadosResult.rows,
        examenesMasSolicitados: examenesResult.rows,
        cotizacionesPorDia: cotizacionesPorDiaResult.rows
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = CotizacionesModel;