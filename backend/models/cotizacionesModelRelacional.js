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
    
    // Validar datos antes de interactuar con la BD
    if (!nombre || !apellido || !cedula || !examenes || !Array.isArray(examenes) || !tasaCambio) {
      throw new Error('Datos insuficientes para crear la cotización');
    }
    
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Verificar primero si necesitamos crear la tabla cotizaciones o ajustarla
      await client.query(`
        DO $$
        BEGIN
          -- Revisar si existe la columna total_usd
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name='cotizaciones' AND column_name='total_usd'
          ) THEN
            -- Agregar columnas necesarias para el modelo relacional
            ALTER TABLE cotizaciones 
              ADD COLUMN total_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
              ADD COLUMN total_ves NUMERIC(10,2) NOT NULL DEFAULT 0,
              ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
              ADD COLUMN observaciones TEXT,
              ADD COLUMN responsable VARCHAR(100);
          END IF;
        END
        $$;
      `);
      
      // Crear tabla cotizacion_examenes si no existe
      await client.query(`
        CREATE TABLE IF NOT EXISTS cotizacion_examenes (
          id SERIAL PRIMARY KEY,
          cotizacion_id INT NOT NULL,
          examen_codigo VARCHAR(50) NOT NULL,
          nombre_examen VARCHAR(255) NOT NULL,
          precio_usd NUMERIC(10,2) NOT NULL,
          precio_ves NUMERIC(10,2) NOT NULL,
          tiempo_entrega VARCHAR(100),
          CONSTRAINT fk_cotizacion FOREIGN KEY (cotizacion_id) 
            REFERENCES cotizaciones(id) ON DELETE CASCADE
        );
      `);
      
      // Buscar si el paciente ya existe por cédula
      console.log("Buscando paciente con cédula:", cedula);
      const pacienteQuery = await client.query(
        'SELECT * FROM pacientes WHERE cedula = $1',
        [cedula]
      );
      
      // Si no existe, crear un nuevo paciente
      if (pacienteQuery.rows.length === 0) {
        console.log("Paciente no encontrado, creando nuevo");
        await client.query(
          'INSERT INTO pacientes (cedula, nombre, apellido, telefono, email) VALUES ($1, $2, $3, $4, $5)',
          [cedula, nombre, apellido, telefono, email]
        );
        logGeneral(`🆕 Paciente creado: ${nombre} ${apellido} (${cedula})`);
      } else {
        // Si existe, actualizar datos de contacto
        console.log("Paciente encontrado, actualizando datos");
        await client.query(
          'UPDATE pacientes SET email = $1, telefono = $2 WHERE cedula = $3',
          [email, telefono, cedula]
        );
        logGeneral(`🔁 Paciente actualizado: ${nombre} ${apellido}`);
      }
      
      // Calcular totales
      const totalUSD = examenes.reduce((sum, examen) => {
        const precio = Number(examen.precio);
        return sum + (isNaN(precio) ? 0 : precio);
      }, 0);
      const totalVES = totalUSD * Number(tasaCambio);
      
      console.log("Totales calculados:", { totalUSD, totalVES });
      
      // Guardar cotización con referencia a la cédula del paciente
      const resultCotizacion = await client.query(
        'INSERT INTO cotizaciones (paciente_id, total_usd, total_ves, estado) VALUES ($1, $2, $3, $4) RETURNING id',
        [cedula, totalUSD, totalVES, 'pendiente']
      );
      
      if (!resultCotizacion.rows || resultCotizacion.rows.length === 0) {
        throw new Error('Error al crear la cotización: no se generó ID');
      }
      
      const cotizacionId = resultCotizacion.rows[0].id;
      console.log("Cotización creada con ID:", cotizacionId);
      
      // Registrar exámenes cotizados
      for (const examen of examenes) {
        // Validar que el examen tenga los datos necesarios
        if (!examen.codigo || !examen.nombre || !examen.precio) {
          console.warn(`Examen incompleto: ${JSON.stringify(examen)}`);
          continue; // Saltar este examen
        }
        
        const precioUSD = Number(examen.precio);
        const precioVES = precioUSD * Number(tasaCambio);
        
        await client.query(
          'INSERT INTO cotizacion_examenes (cotizacion_id, examen_codigo, nombre_examen, precio_usd, precio_ves, tiempo_entrega) VALUES ($1, $2, $3, $4, $5, $6)',
          [
            cotizacionId, 
            examen.codigo, 
            examen.nombre, 
            precioUSD, 
            precioVES,
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
      console.error("Error en proceso de cotización:", error);
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
        cotizacion: cotizacion.examenes.map(e => ({
          codigo: e.examen_codigo,
          nombre: e.nombre_examen,
          precioUSD: e.precio_usd,
          precioVES: e.precio_ves,
          tiempo_entrega: e.tiempo_entrega
        })),
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
      
      return cotizacion;
    } finally {
      client.release();
    }
  }
};

module.exports = CotizacionesModel;