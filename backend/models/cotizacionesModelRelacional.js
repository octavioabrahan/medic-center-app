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
      fecha_nacimiento,
      sexo,
      examenes,
      tasaCambio
    } = datos;
    
    // Diagnóstico mejorado
    console.log('🔍 MODEL DIAGNÓSTICO: Inicio de método crear con datos:', {
      nombre, apellido, cedula, email, telefono, fecha_nacimiento, sexo,
      examenesCount: examenes?.length,
      tasaCambio
    });
    
    // Validar datos antes de interactuar con la BD
    if (!nombre || !apellido || !cedula || !examenes || !Array.isArray(examenes) || !tasaCambio) {
      console.error('🔍 MODEL DIAGNÓSTICO: Validación fallida - datos insuficientes', {
        nombre: !!nombre, 
        apellido: !!apellido, 
        cedula: !!cedula, 
        examenes: !!examenes, 
        esArray: Array.isArray(examenes), 
        tasaCambio: !!tasaCambio
      });
      throw new Error('Datos insuficientes para crear la cotización');
    }
    
    if (!fecha_nacimiento) {
      console.error('🔍 MODEL DIAGNÓSTICO: Validación fallida - fecha nacimiento faltante');
      throw new Error('La fecha de nacimiento es requerida');
    }
    
    if (!sexo) {
      console.error('🔍 MODEL DIAGNÓSTICO: Validación fallida - sexo faltante');
      throw new Error('El campo sexo es requerido');
    }
    
    const client = await db.connect();
    console.log('🔍 MODEL DIAGNÓSTICO: Conexión a BD establecida');
    
    try {
      await client.query('BEGIN');
      console.log('🔍 MODEL DIAGNÓSTICO: Transacción iniciada');
      
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
      console.log('🔍 MODEL DIAGNÓSTICO: Estructura de tabla verificada');
      
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
      console.log('🔍 MODEL DIAGNÓSTICO: Tabla cotizacion_examenes verificada');
      
      // Buscar si el paciente ya existe por cédula
      console.log("Buscando paciente con cédula:", cedula);
      const pacienteQuery = await client.query(
        'SELECT * FROM pacientes WHERE cedula = $1',
        [cedula]
      );
      
      console.log('🔍 MODEL DIAGNÓSTICO: Búsqueda de paciente completada, resultados:', pacienteQuery.rows.length);
      
      // Si no existe, crear un nuevo paciente
      if (pacienteQuery.rows.length === 0) {
        console.log("Paciente no encontrado, creando nuevo");
        try {
          await client.query(
            'INSERT INTO pacientes (cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email]
          );
          console.log('🔍 MODEL DIAGNÓSTICO: Paciente creado exitosamente');
          logGeneral(`🆕 Paciente creado: ${nombre} ${apellido} (${cedula})`);
        } catch (insertError) {
          console.error('🔍 MODEL DIAGNÓSTICO: Error al crear paciente:', insertError);
          throw new Error(`Error al crear paciente: ${insertError.message}`);
        }
      } else {
        // Si existe, actualizar datos de contacto
        console.log("Paciente encontrado, actualizando datos");
        try {
          await client.query(
            'UPDATE pacientes SET email = $1, telefono = $2, fecha_nacimiento = $3, sexo = $4 WHERE cedula = $5',
            [email, telefono, fecha_nacimiento, sexo, cedula]
          );
          console.log('🔍 MODEL DIAGNÓSTICO: Paciente actualizado exitosamente');
          logGeneral(`🔁 Paciente actualizado: ${nombre} ${apellido}`);
        } catch (updateError) {
          console.error('🔍 MODEL DIAGNÓSTICO: Error al actualizar paciente:', updateError);
          throw new Error(`Error al actualizar paciente: ${updateError.message}`);
        }
      }
      
      // Calcular totales
      let totalUSD = 0;
      try {
        totalUSD = examenes.reduce((sum, examen) => {
          const precio = Number(examen.precio);
          if (isNaN(precio)) {
            console.warn(`🔍 MODEL DIAGNÓSTICO: Precio no numérico para examen:`, examen);
            return sum;
          }
          return sum + precio;
        }, 0);
      } catch (reduceError) {
        console.error('🔍 MODEL DIAGNÓSTICO: Error al calcular totalUSD:', reduceError);
        throw new Error(`Error al calcular total USD: ${reduceError.message}`);
      }
      
      const totalVES = totalUSD * Number(tasaCambio);
      
      console.log("Totales calculados:", { totalUSD, totalVES, tasaCambio });
      
      // Guardar cotización con referencia a la cédula del paciente
      let cotizacionId;
      try {
        const resultCotizacion = await client.query(
          'INSERT INTO cotizaciones (paciente_id, total_usd, total_ves, estado) VALUES ($1, $2, $3, $4) RETURNING id',
          [cedula, totalUSD, totalVES, 'pendiente']
        );
        
        if (!resultCotizacion.rows || resultCotizacion.rows.length === 0) {
          throw new Error('Error al crear la cotización: no se generó ID');
        }
        
        cotizacionId = resultCotizacion.rows[0].id;
        console.log("Cotización creada con ID:", cotizacionId);
      } catch (cotizacionError) {
        console.error('🔍 MODEL DIAGNÓSTICO: Error al crear cotización:', cotizacionError);
        console.error('SQL Error details:', cotizacionError.code, cotizacionError.detail);
        throw new Error(`Error al crear cotización: ${cotizacionError.message}`);
      }
      
      // Registrar exámenes cotizados
      for (const examen of examenes) {
        // Validar que el examen tenga los datos necesarios
        if (!examen.codigo || !examen.nombre || examen.precio === undefined) {
          console.warn(`🔍 MODEL DIAGNÓSTICO: Examen incompleto: ${JSON.stringify(examen)}`);
          continue; // Saltar este examen
        }
        
        const precioUSD = Number(examen.precio);
        if (isNaN(precioUSD)) {
          console.warn(`🔍 MODEL DIAGNÓSTICO: Precio no numérico para examen:`, examen);
          continue; // Saltar este examen
        }
        
        const precioVES = precioUSD * Number(tasaCambio);
        
        try {
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
          console.log(`🔍 MODEL DIAGNÓSTICO: Examen registrado: ${examen.nombre}`);
        } catch (examenError) {
          console.error('🔍 MODEL DIAGNÓSTICO: Error al registrar examen:', examenError);
          console.error('Detalles del examen con error:', examen);
          throw new Error(`Error al registrar examen ${examen.nombre}: ${examenError.message}`);
        }
      }
      
      await client.query('COMMIT');
      console.log('🔍 MODEL DIAGNÓSTICO: Transacción completada exitosamente');
      
      return { 
        id: cotizacionId, 
        cedula,
        totalUSD,
        totalVES
      };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error en proceso de cotización:", error);
      console.error("🔍 MODEL DIAGNÓSTICO: Stack de error:", error.stack);
      throw error;
    } finally {
      client.release();
      console.log('🔍 MODEL DIAGNÓSTICO: Conexión a BD liberada');
    }
  },
  
  /**
   * Genera PDF y envía email con la cotización
   */
  procesarDocumentos: async (cotizacionId, nombreCompleto, email) => {
    console.log('🔍 MODEL DIAGNÓSTICO: Inicio procesarDocumentos:', {
      cotizacionId, nombreCompleto, email
    });
    
    try {
      // Obtener datos completos de la cotización
      const cotizacion = await CotizacionesModel.obtenerPorId(cotizacionId);
      
      if (!cotizacion) {
        console.error(`🔍 MODEL DIAGNÓSTICO: Cotización ${cotizacionId} no encontrada`);
        throw new Error(`Cotización ${cotizacionId} no encontrada`);
      }
      
      console.log('🔍 MODEL DIAGNÓSTICO: Cotización recuperada para generar PDF');
      
      // Generar PDF
      let rutaPDF;
      try {
        rutaPDF = await generarPDF(nombreCompleto, {
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
        console.log('🔍 MODEL DIAGNÓSTICO: PDF generado:', rutaPDF);
      } catch (pdfError) {
        console.error('🔍 MODEL DIAGNÓSTICO: Error al generar PDF:', pdfError);
        // Continuar incluso si falla la generación del PDF
        return { enviado: false, error: pdfError.message };
      }
      
      // Enviar correo si hay email
      if (email) {
        try {
          await enviarCorreo(email, 'Tu Cotización Médica', `
            <p>Hola ${nombreCompleto},</p>
            <p>Adjunto encontrarás tu cotización médica en formato PDF.</p>
          `, rutaPDF);
          
          console.log('🔍 MODEL DIAGNÓSTICO: Email enviado exitosamente');
          logEmail(`📤 Enviado a ${email} -> archivo: ${rutaPDF}`);
          
          return { enviado: true, rutaPDF };
        } catch (emailError) {
          console.error('🔍 MODEL DIAGNÓSTICO: Error al enviar email:', emailError);
          return { enviado: false, rutaPDF, error: emailError.message };
        }
      }
      
      return { enviado: false, rutaPDF };
    } catch (error) {
      console.error('🔍 MODEL DIAGNÓSTICO: Error en procesarDocumentos:', error);
      logEmail(`❌ Error procesando documentos: ${error.message}`);
      throw error;
    }
  },
  
  /**
   * Obtiene una cotización por su ID, incluyendo todos los datos relacionados
   */
  obtenerPorId: async (id) => {
    console.log('🔍 MODEL DIAGNÓSTICO: Obteniendo cotización por ID:', id);
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
        console.log('🔍 MODEL DIAGNÓSTICO: No se encontró cotización con ID:', id);
        return null;
      }
      
      const cotizacion = cotizacionResult.rows[0];
      console.log('🔍 MODEL DIAGNÓSTICO: Cotización encontrada:', cotizacion.id);
      
      // Obtener exámenes de la cotización
      const examenesResult = await client.query(`
        SELECT * FROM cotizacion_examenes
        WHERE cotizacion_id = $1
        ORDER BY id
      `, [id]);
      
      cotizacion.examenes = examenesResult.rows;
      console.log('🔍 MODEL DIAGNÓSTICO: Exámenes recuperados:', cotizacion.examenes.length);
      
      return cotizacion;
    } catch (error) {
      console.error('🔍 MODEL DIAGNÓSTICO: Error al obtener cotización:', error);
      throw error;
    } finally {
      client.release();
      console.log('🔍 MODEL DIAGNÓSTICO: Conexión a BD liberada');
    }
  }
};

module.exports = CotizacionesModel;