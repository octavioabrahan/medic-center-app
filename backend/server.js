const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3001;

//const examRoutes = require('./routes/exams');
//const appointmentRoutes = require('./routes/appointments');
//const exchangeRateRoutes = require('./routes/exchangeRate');
//const quotesRoutes = require('./routes/quotes');
const agendamientoRoutes = require('./routes/agendamiento');
const profesionalesRoutes = require("./routes/profesionales");
const especialidadesRoutes = require("./routes/especialidades");
const tipoAtencionRoutes = require("./routes/tipoAtencion");
const horariosRoutes = require("./routes/horarios");
const rolesRoutes = require("./routes/roles");
const personaRolesRoutes = require("./routes/personaRoles");
const profesionalRolesRoutes = require("./routes/profesionalRoles");
const excepcionesRoutes = require("./routes/excepciones");
const pacientesRoutes = require("./routes/pacientes");
const categoriasRoutes = require("./routes/categorias");
const serviciosRoutes = require("./routes/servicios");
const empresasRoutes = require("./routes/empresas");
const profesionalServicioRoutes = require("./routes/profesionalServicio");
const archivoRoutes = require('./routes/archivoRoutes');
//Cotizador_V2
const examRoutes = require('./routes/exams');
const appointmentRoutes = require('./routes/appointments');
const exchangeRateRoutes = require('./routes/exchangeRate');
const quotesRoutes = require('./routes/quotes');
const seguimientoRoutes = require('./routes/seguimiento');
const schedule = require('node-schedule');
const ArchivoAdjunto = require('./models/archivoAdjunto');

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
const logosFolderPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'logos_empresas');
app.use('/components/logos_empresas', express.static(logosFolderPath));

//app.use('/api/exams', examRoutes);
//app.use('/api/appointments', appointmentRoutes);
//app.use('/api/tasa-cambio', exchangeRateRoutes);
//app.use('/api/cotizaciones', quotesRoutes);
app.use('/api/agendamiento', agendamientoRoutes);
app.use("/api/profesionales", profesionalesRoutes);
app.use("/api/especialidades", especialidadesRoutes);
app.use("/api/tipo-atencion", tipoAtencionRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/persona-roles", personaRolesRoutes);
app.use("/api/profesional-roles", profesionalRolesRoutes);
app.use("/api/excepciones", excepcionesRoutes);
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/servicios", serviciosRoutes);
app.use("/api/empresas", empresasRoutes);
app.use("/api/profesional-servicios", profesionalServicioRoutes);
app.use('/api/archivos', archivoRoutes);
//Cotizador_V2
app.use('/api/exams', examRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/tasa-cambio', exchangeRateRoutes);
app.use('/api/cotizaciones', quotesRoutes);
app.use('/api/seguimiento', seguimientoRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API del Centro Médico funcionando correctamente' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Ejecutar limpieza de archivos expirados a las 3 AM todos los días
schedule.scheduleJob('0 3 * * *', async () => {
  try {
    console.log('Iniciando limpieza programada de archivos expirados...');
    const archivosEliminados = await ArchivoAdjunto.limpiarArchivosExpirados();
    console.log(`Limpieza completada: ${archivosEliminados} archivos eliminados`);
  } catch (error) {
    console.error('Error durante la limpieza programada:', error);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend corriendo en http://10.20.20.111:${port}`);
});

