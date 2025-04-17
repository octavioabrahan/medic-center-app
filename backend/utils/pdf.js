const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { logPDF } = require('./logger');

function generarPDF(nombrePaciente, resumen) {
  return new Promise((resolve, reject) => {
    try {
      // Verificar datos requeridos
      if (!resumen || !resumen.cotizacion || !Array.isArray(resumen.cotizacion)) {
        throw new Error('Datos de resumen incompletos');
      }

      // Crear directorio para PDFs si no existe
      const pdfDir = path.join(__dirname, '../pdfs');
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
      }

      // Generar nombre de archivo único
      const slug = nombrePaciente.toLowerCase().replace(/\s+/g, '_');
      const nombreArchivo = `cotizacion_${resumen.folio || Date.now()}_${slug}_${Date.now()}.pdf`;
      const filePath = path.join(pdfDir, nombreArchivo);

      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Formatear números de manera segura
      const formatNumber = (num) => {
        return typeof num === 'number' ? num.toFixed(2) : '0.00';
      };

      // Añadir elementos al PDF
      doc.fontSize(22).text('Cotización de Exámenes Médicos', { align: 'center' });
      doc.fontSize(14).text(`Folio: ${resumen.folio || 'N/A'}`, { align: 'center' });
      doc.fontSize(10).text(`Fecha: ${resumen.fecha || new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Información del paciente
      doc.fontSize(14).text('Información del Paciente', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Nombre: ${nombrePaciente}`);
      doc.text(`Cédula: ${resumen.paciente?.cedula || 'No proporcionado'}`);
      doc.text(`Email: ${resumen.paciente?.email || 'No proporcionado'}`);
      doc.text(`Teléfono: ${resumen.paciente?.telefono || 'No proporcionado'}`);
      doc.moveDown(2);

      // Exámenes seleccionados
      doc.fontSize(14).text('Exámenes seleccionados:', { underline: true });
      doc.moveDown(0.5);

      // Tabla de exámenes
      const tableTop = doc.y;
      const tableHeaders = ['Examen', 'Tiempo de Entrega', 'Precio USD', 'Precio VES'];
      const tableWidths = [250, 100, 80, 80];
      let yPosition = tableTop;

      // Dibujar encabezado de tabla
      doc.fontSize(10).font('Helvetica-Bold');
      doc.rect(50, yPosition, 500, 20).fill('#e0e0e0');
      
      let xPosition = 50;
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPosition + 5, yPosition + 5, { width: tableWidths[i], align: 'left' });
        xPosition += tableWidths[i];
      });
      
      yPosition += 20;
      doc.font('Helvetica');

      // Filas de la tabla
      resumen.cotizacion.forEach((examen, i) => {
        // Verificar si hay suficiente espacio para la siguiente fila
        if (yPosition + 20 > doc.page.height - 100) {
          doc.addPage();
          yPosition = 50; // Reset para la nueva página
        }

        // Alternar colores de fila
        if (i % 2 === 0) {
          doc.rect(50, yPosition, 500, 20).fill('#f8f8f8');
        }
        
        xPosition = 50;
        
        // Nombre del examen
        const nombreExamen = examen.nombre_examen || examen.nombre || 'Examen sin nombre';
        doc.text(nombreExamen, xPosition + 5, yPosition + 5, { 
          width: tableWidths[0], 
          align: 'left' 
        });
        xPosition += tableWidths[0];
        
        // Tiempo de entrega
        doc.text(examen.tiempo_entrega || 'Estándar', xPosition + 5, yPosition + 5, { 
          width: tableWidths[1], 
          align: 'left' 
        });
        xPosition += tableWidths[1];
        
        // Precio USD
        const precioUSD = typeof examen.precioUSD === 'number' ? examen.precioUSD : 
                          typeof examen.preciousd === 'number' ? examen.preciousd : 0;
        doc.text(`$${formatNumber(precioUSD)}`, xPosition + 5, yPosition + 5, { 
          width: tableWidths[2], 
          align: 'right' 
        });
        xPosition += tableWidths[2];
        
        // Precio VES
        const precioVES = typeof examen.precioVES === 'number' ? examen.precioVES : 0;
        doc.text(`Bs. ${formatNumber(precioVES)}`, xPosition + 5, yPosition + 5, { 
          width: tableWidths[3], 
          align: 'right' 
        });
        
        yPosition += 20;
      });

      // Línea separadora
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 20;

      // Total
      const totalUSD = typeof resumen.totalUSD === 'number' ? resumen.totalUSD : 0;
      const totalVES = typeof resumen.totalVES === 'number' ? resumen.totalVES : 0;

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Total USD: $${formatNumber(totalUSD)}`, 380, yPosition);
      yPosition += 20;
      doc.text(`Total VES: Bs. ${formatNumber(totalVES)}`, 380, yPosition);
      doc.font('Helvetica');
      
      // Resto del PDF...
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

