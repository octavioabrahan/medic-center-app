const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { logPDF } = require('./logger');

function generarPDF(nombrePaciente, resumen) {
  return new Promise((resolve, reject) => {
    const slug = nombrePaciente.toLowerCase().replace(/\s+/g, '_');
    const nombreArchivo = `cotizacion_${slug}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../pdfs', nombreArchivo);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(18).text('Cotización de Exámenes Médicos', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Paciente: ${nombrePaciente}`);
    doc.text(`Email: ${resumen.paciente.email}`);
    doc.moveDown();

    doc.fontSize(14).text('Exámenes seleccionados:');
    doc.moveDown(0.5);

    resumen.cotizacion.forEach((e, i) => {
      doc.fontSize(12).text(`${i + 1}. ${e.nombre}`);
      doc.text(`    Precio USD: $${e.precioUSD.toFixed(2)}`);
      doc.text(`    Precio VES: Bs. ${e.precioVES.toFixed(2)}`);
      if (e.tiempo_entrega) {
        doc.text(`    Entrega: ${e.tiempo_entrega}`);
      }
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(12).text(`Total USD: $${resumen.totalUSD.toFixed(2)}`);
    doc.fontSize(12).text(`Total VES: Bs. ${resumen.totalVES.toFixed(2)}`);

    doc.end();

    stream.on('finish', () => {
      logPDF(`✅ PDF generado: ${filePath}`);
      resolve(filePath);
    });

    stream.on('error', (err) => {
      logPDF(`❌ Error al generar PDF: ${err.message}`);
      reject(err);
    });
  });
}

module.exports = { generarPDF };

