const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const { enviarCorreo } = require('../utils/mailer');
const { generarPDF } = require('../utils/pdf');
const { logGeneral, logPDF, logEmail } = require('../utils/logger');

router.post('/', async (req, res) => {
  const { nombre, rut, email, telefono, resumen } = req.body;

  logGeneral(`🧾 Nueva cotización recibida para: ${nombre} (${rut})`);

  if (!rut || !nombre || !resumen || !Array.isArray(resumen.cotizacion)) {
    logGeneral(`❌ Validación fallida al recibir cotización`);
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    // Buscar cliente
    let cliente = await pool.query('SELECT id FROM clientes WHERE rut = $1', [rut]);
    let clienteId;

    if (cliente.rows.length === 0) {
      const insertCliente = await pool.query(
        'INSERT INTO clientes (nombre, rut, email, telefono) VALUES ($1, $2, $3, $4) RETURNING id',
        [nombre, rut, email, telefono]
      );
      clienteId = insertCliente.rows[0].id;
      logGeneral(`🆕 Cliente creado: ${nombre} (${rut})`);
    } else {
      clienteId = cliente.rows[0].id;
      await pool.query(
        'UPDATE clientes SET email = $1, telefono = $2 WHERE id = $3',
        [email, telefono, clienteId]
      );
      logGeneral(`🔁 Cliente actualizado: ${nombre}`);
    }

    // Guardar cotización
    const result = await pool.query(
      'INSERT INTO cotizaciones (cliente_id, resumen) VALUES ($1, $2) RETURNING id',
      [clienteId, JSON.stringify(resumen)]
    );

    // Generar PDF
    const rutaPDF = await generarPDF(nombre, resumen);

    // Enviar correo
    if (email) {
      try {
        await enviarCorreo(email, 'Tu Cotización Médica', `
          <p>Hola ${nombre},</p>
          <p>Adjunto encontrarás tu cotización médica en formato PDF.</p>
        `, rutaPDF);

        logEmail(`📤 Enviado a ${email} -> archivo: ${rutaPDF}`);
      } catch (err) {
        logEmail(`❌ Error enviando PDF a ${email}: ${err.message}`);
        console.error('❌ Error al enviar correo:', err.message);
      }
    }

    res.json({ id: result.rows[0].id });

  } catch (err) {
    console.error('❌ Error general en /api/cotizaciones:', err.message);
    logGeneral(`❌ Error general: ${err.message}`);
    res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
  }
});

module.exports = router;

