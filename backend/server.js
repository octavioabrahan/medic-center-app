const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { backupAllLogs } = require('./utils/logBackup');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Importar middleware de seguridad
const { preventInjection, preventXSS, securityHeaders } = require('./middleware/security');
const { authenticateJWT } = require('./middleware/auth');

// Importación de rutas
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

// Configuración avanzada de seguridad
// Limitar solicitudes para prevenir ataques de fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente después de 15 minutos'
});

// Configurar CORS para entornos de producción/desarrollo
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600 // Cache preflight por 10 minutos (600 segundos)
};

// Middleware de seguridad global
app.use(cors(corsOptions));
app.use(helmet()); // Protección con headers HTTP
app.use(express.json({ limit: '1mb' })); // Limitar tamaño de payload
app.use(securityHeaders);
app.use(preventXSS); // Proteger contra XSS
app.use('/api/', limiter); // Aplicar limitador de tasa a rutas API

// Servir archivos estáticos
const logosFolderPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'logos_empresas');
app.use('/components/logos_empresas', express.static(logosFolderPath));

// Rutas públicas (no requieren autenticación)
app.get('/', (req, res) => {
  res.json({ message: 'API del Centro Médico funcionando correctamente' });
});

// Rutas que requieren protección contra inyección pero no autenticación
app.use('/api/pacientes', preventInjection);
// ...otras rutas públicas que necesiten protección contra inyección...

// Aplicar middleware de autenticación a rutas protegidas
// Descomentar las siguientes líneas cuando el sistema de autenticación esté implementado
/*
app.use('/api/agendamiento', authenticateJWT);
app.use('/api/profesionales', authenticateJWT);
app.use('/api/especialidades', authenticateJWT);
app.use('/api/tipo-atencion', authenticateJWT); 
app.use('/api/horarios', authenticateJWT);
app.use('/api/roles', authenticateJWT);
app.use('/api/persona-roles', authenticateJWT);
app.use('/api/profesional-roles', authenticateJWT);
app.use('/api/excepciones', authenticateJWT);
app.use('/api/categorias', authenticateJWT);
app.use('/api/servicios', authenticateJWT);
app.use('/api/empresas', authenticateJWT);
app.use('/api/profesional-servicios', authenticateJWT);
app.use('/api/archivos', authenticateJWT);
app.use('/api/exams', authenticateJWT);
app.use('/api/appointments', authenticateJWT);
app.use('/api/tasa-cambio', authenticateJWT);
app.use('/api/cotizaciones', authenticateJWT);
app.use('/api/seguimiento', authenticateJWT);
*/

// Configuración de rutas API
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

// Manejo de errores mejorado
app.use((err, req, res, next) => {
  // Loguear el error con nuestro sistema de logs
  logger.logError('Error en la aplicación', err);
  
  // No mostrar detalles del error en producción
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Error interno del servidor' });
  } else {
    // En desarrollo, mostrar más detalles para depuración
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: err.message,
      stack: err.stack
    });
  }
});

// Ruta para manejar 404 (debe ir después de todas las demás rutas)
app.use((req, res) => {
  logger.logWarning(`Ruta no encontrada: ${req.originalUrl}`, {
    method: req.method,
    ip: req.ip
  });
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Ejecutar limpieza de archivos expirados a las 3 AM todos los días
schedule.scheduleJob('0 3 * * *', async () => {
  try {
    logger.logGeneral('Iniciando limpieza programada de archivos expirados...');
    const archivosEliminados = await ArchivoAdjunto.limpiarArchivosExpirados();
    logger.logGeneral(`Limpieza completada: ${archivosEliminados} archivos eliminados`);
  } catch (error) {
    logger.logError('Error durante la limpieza programada de archivos', error);
  }
});

// Respaldar logs diariamente a las 2 AM
schedule.scheduleJob('0 2 * * *', async () => {
  try {
    logger.logGeneral('Iniciando respaldo programado de archivos de log...');
    await backupAllLogs();
  } catch (error) {
    logger.logError('Error durante el respaldo programado de logs', error);
  }
});

// Iniciar el servidor de forma segura
app.listen(port, process.env.NODE_ENV === 'production' ? '127.0.0.1' : '0.0.0.0', () => {
  logger.logGeneral(`Backend corriendo en http://${process.env.NODE_ENV === 'production' ? 'localhost' : '10.20.20.111'}:${port}`);
});

