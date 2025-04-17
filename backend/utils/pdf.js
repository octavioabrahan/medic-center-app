const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { logPDF } = require('./logger');

function generarPDF(nombrePaciente, resumen) {
  return new Promise((resolve, reject) => {
    try {
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

      // Función segura para formatear números
      const formatNumber = (num) => {
        return typeof num === 'number' ? num.toFixed(2) : '0.00';
      };

      // Colores
      const colors = {
        primary: '#1e3a8a',  // Azul oscuro
        secondary: '#60a5fa', // Azul claro
        accent: '#ef4444',   // Rojo para destacados
        text: '#1f2937',     // Texto oscuro
        lightText: '#6b7280', // Texto gris
        lightBg: '#f3f4f6',  // Fondo gris claro
        borderColor: '#d1d5db', // Color de borde
        headerBg: '#e5e7eb'  // Fondo de encabezado
      };

      // Agregar logo (placeholder - deberías reemplazar esto con tu logo real)
      // Si tienes un logo, puedes usar:
      // doc.image('ruta/al/logo.png', 50, 45, { width: 150 });
      
      // Como placeholder, haremos un logo de texto
      doc.fontSize(24).fillColor(colors.primary).text('CENTRO MÉDICO', 50, 45);
      doc.fontSize(10).fillColor(colors.lightText).text('Cuidando tu salud desde 1995', 50, 75);
      
      // Información de la clínica
      doc.fontSize(9).fillColor(colors.lightText).text([
        'Centro Médico Especializado',
        'Dirección: Av. Principal #123, Ciudad',
        'Teléfono: +58 123-456-7890',
        'Email: contacto@centromedico.com',
        'Web: www.centromedico.com'
      ].join('\n'), 400, 45, { align: 'right' });

      // Línea separadora
      doc.moveTo(50, 105).lineTo(550, 105).strokeColor(colors.borderColor).stroke();
      
      // Título principal
      doc.fontSize(22).fillColor(colors.primary).text('Cotización de Exámenes Médicos', 50, 120, { align: 'center' });
      
      // Folio y fecha
      doc.fontSize(12).fillColor(colors.text);
      doc.text(`Folio: ${resumen.folio || 'Sin folio'}`, 50, 155, { align: 'center' });
      doc.text(`Fecha: ${resumen.fecha || new Date().toLocaleDateString()}`, 50, 175, { align: 'center' });
      
      doc.moveDown(2);

      // Información del paciente
      doc.fontSize(14).fillColor(colors.primary).text('Información del Paciente', 50, 210);
      doc.moveDown(0.5);
      
      // Dibujar un cuadro para la información del paciente
      const patientInfoY = doc.y;
      doc.rect(50, patientInfoY, 500, 85)
         .fillColor(colors.lightBg)
         .fillOpacity(0.5)
         .fill();
      
      doc.fillColor(colors.text).fillOpacity(1).fontSize(11);
      
      doc.text(`Nombre: ${nombrePaciente}`, 60, patientInfoY + 10);
      doc.text(`Cédula: ${resumen.paciente?.cedula || 'No proporcionado'}`, 60, patientInfoY + 30);
      doc.text(`Email: ${resumen.paciente?.email || 'No proporcionado'}`, 60, patientInfoY + 50);
      doc.text(`Teléfono: ${resumen.paciente?.telefono || 'No proporcionado'}`, 60, patientInfoY + 70);
      
      doc.moveDown(5);

      // Exámenes seleccionados
      doc.fontSize(14).fillColor(colors.primary).text('Exámenes seleccionados:', 50, patientInfoY + 100);
      doc.moveDown(0.5);

      // Tabla de exámenes
      const tableTop = doc.y + 10;
      const tableHeaders = ['Examen', 'Tiempo de Entrega', 'Precio USD', 'Precio VES'];
      const tableWidths = [250, 100, 75, 75];
      let yPosition = tableTop;

      // Dibujar encabezado de tabla
      doc.rect(50, yPosition, 500, 25)
         .fillColor(colors.headerBg)
         .fill();
      
      doc.fontSize(10).font('Helvetica-Bold').fillColor(colors.text);
      
      let xPosition = 50;
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPosition + 5, yPosition + 8, { width: tableWidths[i], align: i > 1 ? 'right' : 'left' });
        xPosition += tableWidths[i];
      });
      
      yPosition += 25;
      doc.font('Helvetica');

      // Filas de la tabla
      if (resumen.cotizacion && Array.isArray(resumen.cotizacion)) {
        resumen.cotizacion.forEach((examen, i) => {
          // Verificar si hay suficiente espacio para la siguiente fila
          if (yPosition + 25 > doc.page.height - 100) {
            doc.addPage();
            yPosition = 50; // Reset para la nueva página
          }

          // Alternar colores de fila
          if (i % 2 === 0) {
            doc.rect(50, yPosition, 500, 25)
               .fillColor(colors.lightBg)
               .fillOpacity(0.3)
               .fill();
          }
          
          doc.fillOpacity(1).fillColor(colors.text);
          xPosition = 50;
          
          // Nombre del examen
          const nombreExamen = examen.nombre_examen || examen.nombre || 'Examen sin nombre';
          doc.text(nombreExamen, xPosition + 5, yPosition + 8, { 
            width: tableWidths[0], 
            align: 'left'
          });
          xPosition += tableWidths[0];
          
          // Tiempo de entrega
          doc.text(examen.tiempo_entrega || 'Estándar', xPosition + 5, yPosition + 8, { 
            width: tableWidths[1], 
            align: 'left' 
          });
          xPosition += tableWidths[1];
          
          // Precio USD
          const precioUSD = typeof examen.precioUSD === 'number' ? examen.precioUSD : 
                            typeof examen.preciousd === 'number' ? examen.preciousd : 0;
          doc.text(`$${formatNumber(precioUSD)}`, xPosition + 5, yPosition + 8, { 
            width: tableWidths[2], 
            align: 'right' 
          });
          xPosition += tableWidths[2];
          
          // Precio VES
          const precioVES = typeof examen.precioVES === 'number' ? examen.precioVES : 0;
          doc.text(`Bs. ${formatNumber(precioVES)}`, xPosition + 5, yPosition + 8, { 
            width: tableWidths[3], 
            align: 'right' 
          });
          
          yPosition += 25;
        });
      }

      // Línea separadora
      doc.moveTo(50, yPosition).lineTo(550, yPosition)
         .strokeColor(colors.borderColor)
         .stroke();
      yPosition += 20;

      // Total con un fondo destacado
      const totalUSD = typeof resumen.totalUSD === 'number' ? resumen.totalUSD : 0;
      const totalVES = typeof resumen.totalVES === 'number' ? resumen.totalVES : 0;

      // Caja para totales
      doc.rect(350, yPosition, 200, 50)
         .fillColor(colors.primary)
         .fillOpacity(0.1)
         .fill();
      
      doc.fillOpacity(1);
      doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.primary);
      doc.text(`Total USD: $${formatNumber(totalUSD)}`, 360, yPosition + 10, { align: 'right', width: 180 });
      doc.text(`Total VES: Bs. ${formatNumber(totalVES)}`, 360, yPosition + 30, { align: 'right', width: 180 });
      
      yPosition += 70;
      
      // Notas finales
      doc.fontSize(10).font('Helvetica').fillColor(colors.text);
      doc.text('Notas importantes:', 50, yPosition);
      doc.moveDown(0.5);
      
      doc.fillColor(colors.lightText).fontSize(9);
      doc.list([
        'Esta cotización tiene una validez de 15 días a partir de la fecha de emisión.',
        'Los precios en bolívares pueden variar según la tasa de cambio del día del pago.',
        'Para cualquier consulta adicional, por favor contáctenos indicando el número de folio.',
        'Los tiempos de entrega pueden variar dependiendo de la demanda.'
      ], { bulletRadius: 2, textIndent: 20 });

      // Pie de página
      const pageBottom = doc.page.height - 50;
      
      // Línea del pie de página
      doc.moveTo(50, pageBottom - 15).lineTo(550, pageBottom - 15)
         .strokeColor(colors.borderColor)
         .stroke();
      
      doc.fontSize(8).fillColor(colors.lightText);
      doc.text('Centro Médico - Cuidando tu salud', 50, pageBottom - 10, { align: 'center', width: 500 });

      // Finalizar PDF
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

