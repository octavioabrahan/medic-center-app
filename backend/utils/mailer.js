const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'octavio1709@gmail.com',
    pass: 'etsu jnfp jqvl kkpn',
  }
});

async function enviarCorreo(destinatario, asunto, mensajeHtml, adjuntoPath = null) {
  // Añadimos el logo al inicio del correo
  const logoHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="cid:logoHeader" alt="DIAGNOCENTRO" style="max-width: 200px; height: auto;" />
    </div>
  `;
  
  // Combinamos el logo con el contenido del mensaje
  const htmlCompleto = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      ${logoHtml}
      ${mensajeHtml}
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
        © ${new Date().getFullYear()} DIAGNOCENTRO. Todos los derechos reservados.
      </div>
    </div>
  `;

  // Ruta al logo
  const logoPath = path.join(__dirname, '../../frontend/src/assets/logo_header.png');
  
  const attachments = [
    {
      filename: 'logo_header.png',
      path: logoPath,
      cid: 'logoHeader' // El mismo que usamos en src="cid:logoHeader"
    }
  ];
  
  // Agregamos el adjunto PDF si existe
  if (adjuntoPath) {
    attachments.push({ filename: 'cotizacion.pdf', path: adjuntoPath });
  }

  const mailOptions = {
    from: '"Centro Médico" <tucorreo@gmail.com>',
    to: destinatario,
    subject: asunto,
    html: htmlCompleto,
    attachments: attachments
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { enviarCorreo };

