const pool = require('../models/db');
const { generarPDF } = require('../utils/pdf');
const { enviarCorreo } = require('../utils/mailer');
const { logGeneral, logPDF, logEmail } = require('../utils/logger');
const axios = require('axios');

// Función auxiliar para generar un folio único
const generarFolio = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(2); // últimos 2 dígitos del año
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `COT-${year}${month}`;
  
  // Obtener el último folio con este prefijo
  const result = await pool.query(
    "SELECT folio FROM cotizaciones WHERE folio LIKE $1 ORDER BY folio DESC LIMIT 1",
    [`${prefix}%`]
  );
  
  let numero = 1;
  if (result.rows.length > 0) {
    const ultimoFolio = result.rows[0].folio;
    const ultimoNumero = parseInt(ultimoFolio.split('-')[2], 10);
    numero = ultimoNumero + 1;
  }
  
  return `${prefix}-${numero.toString().padStart(4, '0')}`;
};

/**
 * Obtiene todas las cotizaciones
 */
const obtenerTodas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, cl.nombre, cl.apellido, cl.email 
      FROM cotizaciones c
      JOIN clientes cl ON c.cedula_cliente = cl.cedula
      ORDER BY c.fecha_creacion DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener cotizaciones:', err);
    logGeneral(`❌ Error al obtener cotizaciones: ${err.message}`);
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
};

/**
 * Obtiene una cotización por su ID o folio
 */
const obtenerPorIdOFolio = async (req, res) => {
  try {
    const { id } = req.params;
    let cotizacionQuery;
    
    // Verificar si es un ID numérico o un folio
    if (!isNaN(id)) {
      cotizacionQuery = await pool.query(`
        SELECT c.*, cl.nombre, cl.apellido, cl.email, cl.telefono 
        FROM cotizaciones c
        JOIN clientes cl ON c.cedula_cliente = cl.cedula
        WHERE c.id_unico = $1
      `, [id]);
    } else {
      cotizacionQuery = await pool.query(`
        SELECT c.*, cl.nombre, cl.apellido, cl.email, cl.telefono 
        FROM cotizaciones c
        JOIN clientes cl ON c.cedula_cliente = cl.cedula
        WHERE c.folio = $1
      `, [id]);
    }
    
    if (cotizacionQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    // Obtener los exámenes asociados a esta cotización
    const examenesQuery = await pool.query(`
      SELECT ce.*, e.nombre_examen, e.tiempo_entrega, e.tipo
      FROM cotizacion_examenes ce
      JOIN examenes e ON ce.examen_codigo = e.codigo
      WHERE ce.cotizacion_id = $1
    `, [cotizacionQuery.rows[0].id_unico]);
    
    // Combinar la información
    const resultado = {
      ...cotizacionQuery.rows[0],
      examenes: examenesQuery.rows
    };
    
    res.json(resultado);
  } catch (err) {
    console.error('Error al obtener cotización:', err);
    res.status(500).json({ error: 'Error al obtener cotización' });
  }
};

/**
 * Crea una nueva cotización
 */
const crear = async (req, res) => {
  const { cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, examenes } = req.body;

  if (!cedula || !nombre || !apellido || !examenes || !Array.isArray(examenes) || examenes.length === 0) {
    logGeneral(`❌ Validación fallida al recibir cotización`);
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  logGeneral(`🧾 Nueva cotización recibida para: ${nombre} ${apellido} (${cedula})`);
  logGeneral(`Payload recibido: ${JSON.stringify(req.body, null, 2)}`);

  const client = await pool.getClient();

  try {
    await client.query('BEGIN');

    // Verificar si el cliente existe, si no, crearlo
    let clienteResult = await client.query('SELECT cedula FROM clientes WHERE cedula = $1', [cedula]);
    
    if (clienteResult.rows.length === 0) {
      await client.query(
        'INSERT INTO clientes (cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email]
      );
      logGeneral(`🆕 Cliente creado: ${nombre} ${apellido} (${cedula})`);
    } else {
      // Actualizar la información del cliente
      await client.query(
        'UPDATE clientes SET nombre = $1, apellido = $2, telefono = $3, email = $4 WHERE cedula = $5',
        [nombre, apellido, telefono, email, cedula]
      );
      logGeneral(`🔁 Cliente actualizado: ${nombre} ${apellido}`);
    }

    // Generar folio único
    const folio = await generarFolio();

    // Calcular totales
    const cantidad_examenes = examenes.length;
    const total_usd = examenes.reduce((total, examen) => total + parseFloat(examen.preciousd), 0);

    // Crear la cotización
    const cotizacionResult = await client.query(
      'INSERT INTO cotizaciones (folio, cedula_cliente, cantidad_examenes, total_usd) VALUES ($1, $2, $3, $4) RETURNING *',
      [folio, cedula, cantidad_examenes, total_usd]
    );
    
    const cotizacionId = cotizacionResult.rows[0].id_unico;

    // Insertar los exámenes de la cotización
    for (const examen of examenes) {
      logGeneral(`Insertando examen: ${JSON.stringify(examen, null, 2)}`);
      await client.query(
        'INSERT INTO cotizacion_examenes (cotizacion_id, examen_codigo, precio_unitario) VALUES ($1, $2, $3)',
        [cotizacionId, examen.codigo, examen.preciousd]
      );
    }

    await client.query('COMMIT');

    // Obtener tasa de cambio actual
    let tasaCambio = 0;
    try {
      const tasaResponse = await axios.get(`${process.env.API_URL || 'http://localhost:3001'}/api/tasa-cambio`);
      tasaCambio = tasaResponse.data.tasa || 0;
    } catch (err) {
      console.warn('No se pudo obtener la tasa de cambio actual:', err.message);
      logGeneral(`⚠️ No se pudo obtener la tasa de cambio: ${err.message}`);
    }

    // Obtener información completa de los exámenes desde la base de datos
    // incluyendo el campo 'informacion' que contiene las indicaciones
    const examenesCompletos = [];
    for (const examen of examenes) {
      try {
        const examenCompleto = await pool.query(
          'SELECT codigo, nombre_examen, preciousd, tiempo_entrega, informacion FROM examenes WHERE codigo = $1',
          [examen.codigo]
        );
        
        if (examenCompleto.rows.length > 0) {
          const examenData = examenCompleto.rows[0];
          examenesCompletos.push({
            codigo: examenData.codigo,
            nombre_examen: examenData.nombre_examen,
            nombre: examenData.nombre_examen, // Para compatibilidad
            preciousd: parseFloat(examenData.preciousd),
            tiempo_entrega: examenData.tiempo_entrega,
            informacion: examenData.informacion, // Esta es la información clave para las indicaciones
            precioVES: parseFloat(examenData.preciousd) * tasaCambio
          });
        } else {
          // Si no se encuentra el examen en la BD, usar los datos del frontend
          logGeneral(`⚠️ Examen ${examen.codigo} no encontrado en BD, usando datos del frontend`);
          examenesCompletos.push({
            ...examen,
            precioVES: parseFloat(examen.preciousd) * tasaCambio
          });
        }
      } catch (err) {
        logGeneral(`❌ Error obteniendo examen ${examen.codigo}: ${err.message}`);
        // En caso de error, usar los datos del frontend
        examenesCompletos.push({
          ...examen,
          precioVES: parseFloat(examen.preciousd) * tasaCambio
        });
      }
    }

    // Preparar datos para PDF
    const datosCliente = {
      nombre: `${nombre} ${apellido}`,
      cedula,
      email,
      telefono
    };

    const resumenCotizacion = {
      folio,
      paciente: datosCliente,
      cotizacion: examenesCompletos, // Usar los exámenes completos con indicaciones
      totalUSD: total_usd,
      totalVES: total_usd * tasaCambio,
      fecha: new Date().toLocaleDateString()
    };

    // Generar PDF
    let rutaPDF;
    try {
      rutaPDF = await generarPDF(datosCliente.nombre, resumenCotizacion);
    } catch (err) {
      console.error('Error al generar PDF:', err.message);
      logPDF(`❌ Error al generar PDF: ${err.message}`);
      // Continuamos aunque falle el PDF
    }

    // Enviar correo electrónico si hay email y se generó el PDF
    if (email && rutaPDF) {
      try {
        await enviarCorreo(email, 'Tu Cotización Médica', `
          <p>Hola ${nombre},</p>
          <p>Adjunto encontrarás tu cotización médica con folio ${folio} en formato PDF.</p>
          <p>Puedes consultar el estado de tu cotización usando este folio en nuestra página web.</p>
        `, rutaPDF);

        logEmail(`📤 Enviado a ${email} -> archivo: ${rutaPDF}`);
      } catch (err) {
        logEmail(`❌ Error enviando PDF a ${email}: ${err.message}`);
        console.error('❌ Error al enviar correo:', err.message);
      }
    }

    res.status(201).json({ 
      id: cotizacionId, 
      folio,
      mensaje: 'Cotización creada exitosamente'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error general en cotizaciones:', err.message);
    logGeneral(`❌ Error general: ${err.message}`);
    res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
  } finally {
    client.release();
  }
};

/**
 * Actualiza estado de una cotización
 */
const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  
  if (!estado) {
    return res.status(400).json({ error: 'Estado es requerido' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE cotizaciones SET estado = $1 WHERE id_unico = $2 RETURNING *',
      [estado, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    logGeneral(`✅ Cotización ${id} actualizada a estado: ${estado}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar cotización:', err);
    logGeneral(`❌ Error al actualizar cotización: ${err.message}`);
    res.status(500).json({ error: 'Error al actualizar cotización' });
  }
};

module.exports = {
  obtenerTodas,
  obtenerPorIdOFolio,
  crear,
  actualizarEstado
};