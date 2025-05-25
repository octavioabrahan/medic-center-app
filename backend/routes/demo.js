const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const mjml = require('mjml');

// Función para obtener el logo como base64
function obtenerLogoBase64() {
  try {
    const logoPath = path.join(__dirname, '../../frontend/src/logo_header.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
    return 'https://via.placeholder.com/169x60/20377A/FFFFFF?text=DIAGNOCENTRO';
  } catch (error) {
    console.error('Error al obtener logo base64:', error);
    return 'https://via.placeholder.com/169x60/20377A/FFFFFF?text=DIAGNOCENTRO';
  }
}

// Ruta de demostración del correo de agendamiento
router.get('/correo-agendamiento', (req, res) => {
  try {
    // Datos de ejemplo para la demostración
    const datosEjemplo = {
      nombre: 'María José',
      apellido: 'González Pérez',
      profesional: 'DR. CARLOS RODRIGUEZ MARTINEZ',
      especialidad: 'Consulta médica general, Examen de laboratorio',
      fecha: 'Lunes, 27 de mayo de 2025',
      hora_inicio: '09:00',
      hora_fin: '12:00',
      tipo_atencion: 'consulta médica',
      numero: '1'
    };

    // Leer el template MJML
    const mjmlRaw = fs.readFileSync(
      path.join(__dirname, '../templates/agendamiento.mjml'),
      'utf8'
    );

    // Obtener logo en base64
    const logoUrl = obtenerLogoBase64();

    // Renderizar MJML con datos de ejemplo
    const mjmlRenderizado = mjml(mjmlRaw
      .replace(/{{nombre}}/g, datosEjemplo.nombre)
      .replace(/{{apellido}}/g, datosEjemplo.apellido)
      .replace(/{{profesional}}/g, datosEjemplo.profesional)
      .replace(/{{especialidad}}/g, datosEjemplo.especialidad)
      .replace(/{{fecha}}/g, datosEjemplo.fecha)
      .replace(/{{hora_inicio}}/g, datosEjemplo.hora_inicio)
      .replace(/{{hora_fin}}/g, datosEjemplo.hora_fin)
      .replace(/{{hora}}/g, datosEjemplo.hora_inicio) // Compatibilidad
      .replace(/{{logo_url}}/g, logoUrl)
      .replace(/{{tipo_atencion}}/g, datosEjemplo.tipo_atencion)
      .replace(/{{numero}}/g, datosEjemplo.numero)
    );

    if (mjmlRenderizado.errors && mjmlRenderizado.errors.length > 0) {
      console.error('Errores en MJML:', mjmlRenderizado.errors);
    }

    // Devolver el HTML renderizado
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demo - Correo de Agendamiento</title>
        <style>
          body { margin: 0; padding: 20px; background-color: #f5f5f5; font-family: Arial, sans-serif; }
          .demo-header { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 20px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .demo-content { 
            background: white; 
            border-radius: 8px; 
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .info-badge {
            background: #e3f2fd;
            color: #1976d2;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            margin: 5px 0;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="demo-header">
          <h1 style="color: #20377A; margin: 0 0 10px 0;">📧 Demostración - Correo de Agendamiento</h1>
          <p style="margin: 0; color: #666;">Esta es una vista previa de cómo se ve el correo que reciben los pacientes al agendar una cita.</p>
          <div style="margin-top: 15px;">
            <span class="info-badge">✅ Logo embebido en base64</span>
            <span class="info-badge">⏰ Horarios desde BD</span>
            <span class="info-badge">📅 Formato de fecha chileno</span>
          </div>
        </div>
        <div class="demo-content">
          ${mjmlRenderizado.html}
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Error en demo de correo:', error);
    res.status(500).send(`
      <h1>Error en la demostración</h1>
      <p>Ocurrió un error al generar la vista previa del correo:</p>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px;">${error.message}</pre>
    `);
  }
});

module.exports = router;
