const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'octavio1709@gmail.com',
    pass: 'etsu jnfp jqvl kkpn',
  }
});

async function enviarCorreo(destinatario, asunto, mensajeHtml, adjuntoPath = null) {
  const mailOptions = {
    from: '"Centro Médico" <tucorreo@gmail.com>',
    to: destinatario,
    subject: asunto,
    html: mensajeHtml,
    attachments: adjuntoPath
      ? [{ filename: 'cotizacion.pdf', path: adjuntoPath }]
      : [],
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { enviarCorreo };

