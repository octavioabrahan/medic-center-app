const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { logPDF } = require('./logger');

function generarPDF(nombrePaciente, resumen) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Datos de resumen recibidos:', JSON.stringify({
        folio: resumen.folio,
        totalUSD: resumen.totalUSD,
        examenes: resumen.cotizacion?.map(e => ({
          nombre: e.nombre_examen || e.nombre,
          preciousd: e.preciousd,
          precioUSD: e.precioUSD,
          precio_unitario: e.precio_unitario
        }))
      }, null, 2));

      const pdfDir = path.join(__dirname, '../pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      const slug = nombrePaciente.toLowerCase().replace(/\s+/g, '_');
      const nombreArchivo = `cotizacion_${resumen.folio || Date.now()}_${slug}_${Date.now()}.pdf`;
      const filePath = path.join(pdfDir, nombreArchivo);

      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `Cotización de Exámenes Médicos - ${resumen.folio || 'Sin folio'}`,
          Author: 'Centro Médico',
          Subject: 'Cotización de Exámenes',
          Keywords: 'cotización, exámenes médicos',
          Creator: 'Sistema de Cotizaciones Centro Médico'
        }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const formatNumber = (num) => typeof num === 'number' ? num.toFixed(2) : '0.00';

      const colors = {
        primary: '#1e3a8a',
        secondary: '#60a5fa',
        accent: '#ef4444',
        text: '#1f2937',
        lightText: '#6b7280',
        lightBg: '#f3f4f6',
        borderColor: '#d1d5db',
        headerBg: '#e5e7eb'
      };

      doc.fontSize(24).fillColor(colors.primary).text('CENTRO MÉDICO', 50, 45);
      doc.fontSize(10).fillColor(colors.lightText).text('Cuidando tu salud desde 1995', 50, 75);
      doc.fontSize(9).fillColor(colors.lightText).text([
        'Centro Médico Especializado',
        'Dirección: Av. Principal #123, Ciudad',
        'Teléfono: +58 123-456-7890',
        'Email: contacto@centromedico.com',
        'Web: www.centromedico.com'
      ].join('\n'), 400, 45, { align: 'right' });

      doc.moveTo(50, 105).lineTo(550, 105).strokeColor(colors.borderColor).stroke();
      doc.fontSize(22).fillColor(colors.primary).text('Cotización de Exámenes Médicos', 50, 120, { align: 'center' });
      doc.fontSize(12).fillColor(colors.text);
      doc.text(`Folio: ${resumen.folio || 'Sin folio'}`, 50, 155, { align: 'center' });
      doc.text(`Fecha: ${resumen.fecha || new Date().toLocaleDateString()}`, 50, 175, { align: 'center' });
      doc.moveDown(2);

      doc.fontSize(14).fillColor(colors.primary).text('Información del Paciente', 50, 210);
      doc.moveDown(0.5);

      const patientInfoY = doc.y;
      doc.rect(50, patientInfoY, 500, 85).fillColor(colors.lightBg).fillOpacity(0.5).fill();
      doc.fillColor(colors.text).fillOpacity(1).fontSize(11);
      doc.text(`Nombre: ${nombrePaciente}`, 60, patientInfoY + 10);
      doc.text(`Cédula: ${resumen.paciente?.cedula || 'No proporcionado'}`, 60, patientInfoY + 30);
      doc.text(`Email: ${resumen.paciente?.email || 'No proporcionado'}`, 60, patientInfoY + 50);
      doc.text(`Teléfono: ${resumen.paciente?.telefono || 'No proporcionado'}`, 60, patientInfoY + 70);

      doc.moveDown(5);

      doc.fontSize(14).fillColor(colors.primary).text('Exámenes seleccionados:', 50, patientInfoY + 100);
      doc.moveDown(0.5);

      const tableTop = doc.y + 10;
      const tableHeaders = ['Examen', 'Tiempo de Entrega', 'Precio USD'];
      const tableWidths = [250, 150, 100];
      let yPosition = tableTop;

      doc.rect(50, yPosition, 500, 25).fillColor(colors.headerBg).fill();
      doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.text);

      let xPosition = 50;
      tableHeaders.forEach((header, i) => {
        const align = i === 2 ? 'right' : 'left';
        doc.text(header, xPosition + 5, yPosition + 8, { width: tableWidths[i], align });
        xPosition += tableWidths[i];
      });

      yPosition += 25;
      doc.font('Helvetica');

      const indicaciones = [];

      if (resumen.cotizacion && Array.isArray(resumen.cotizacion)) {
        resumen.cotizacion.forEach((examen, i) => {
          if (yPosition + 25 > doc.page.height - 100) {
            doc.addPage();
            yPosition = 50;
          }

          if (i % 2 === 0) {
            doc.rect(50, yPosition, 500, 25).fillColor(colors.lightBg).fillOpacity(0.3).fill();
          }

          doc.fillOpacity(1).fillColor(colors.text);
          xPosition = 50;

          const nombreExamen = examen.nombre_examen || examen.nombre || 'Examen sin nombre';
          doc.text(nombreExamen, xPosition + 5, yPosition + 8, { width: tableWidths[0], align: 'left' });
          xPosition += tableWidths[0];

          doc.text(examen.tiempo_entrega || 'Estándar', xPosition + 5, yPosition + 8, { width: tableWidths[1], align: 'left' });
          xPosition += tableWidths[1];

          const precioUSD = (
            examen.preciousd !== undefined && examen.preciousd !== null ? Number(examen.preciousd) :
            examen.precioUSD !== undefined && examen.precioUSD !== null ? Number(examen.precioUSD) :
            examen.precio_unitario !== undefined && examen.precio_unitario !== null ? Number(examen.precio_unitario) :
            0
          );

          console.log(`Examen: ${nombreExamen}`, { preciousd: examen.preciousd, precioUSD: examen.precioUSD, precio_unitario: examen.precio_unitario }, `Precio final: ${precioUSD}`);

          doc.text(`$${formatNumber(precioUSD)}`, xPosition + 5, yPosition + 8, { width: tableWidths[2], align: 'left' });

          if (examen.informacion) {
            indicaciones.push({ nombre: nombreExamen, informacion: examen.informacion });
          }

          yPosition += 25;
        });
      }

      doc.moveTo(50, yPosition).lineTo(550, yPosition).strokeColor(colors.borderColor).stroke();
      yPosition += 20;

      let calculatedTotalUSD = 0;
      if (resumen.cotizacion && Array.isArray(resumen.cotizacion)) {
        calculatedTotalUSD = resumen.cotizacion.reduce((total, examen) => {
          const precio = (
            examen.preciousd !== undefined && examen.preciousd !== null ? Number(examen.preciousd) :
            examen.precioUSD !== undefined && examen.precioUSD !== null ? Number(examen.precioUSD) :
            examen.precio_unitario !== undefined && examen.precio_unitario !== null ? Number(examen.precio_unitario) :
            0
          );
          return total + precio;
        }, 0);
      }

      const totalUSD = calculatedTotalUSD > 0 ? calculatedTotalUSD : (typeof resumen.totalUSD === 'number' ? resumen.totalUSD : 0);

      doc.rect(350, yPosition, 200, 30).fillColor(colors.primary).fillOpacity(0.1).fill();
      doc.fillOpacity(1);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.primary);
      doc.text(`Total USD: $${formatNumber(totalUSD)}`, 360, yPosition + 10, { align: 'right', width: 180 });

      // Finalizar documento
      doc.end();

      stream.on('finish', () => {
        logPDF(`✅ PDF generado: ${filePath}`);
        resolve(filePath);
      });

      stream.on('error', (err) => {
        logPDF(`❌ Error en stream al generar PDF: ${err.message}`);
        reject(err);
      });
    } catch (err) {
      logPDF(`❌ Error al generar PDF: ${err.message}`);
      reject(err);
    }
  });
}

module.exports = { generarPDF };
