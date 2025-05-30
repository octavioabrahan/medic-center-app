const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
// We're not using rate limiting anymore, as it's causing issues
// const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const { backupAllLogs } = require('./utils/logBackup');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);
const port = process.env.PORT || 3001;

// Importar middleware de seguridad
const { preventInjection, preventXSS, securityHeaders } = require('./middleware/security');
const { authenticateJWT } = require('./middleware/auth');

// Importación de rutas
const adminUsersRoutes = require('./routes/adminUsers'); // Nuevas rutas de usuarios administrativos
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
// Nuevas rutas para gestión de pantallas y permisos
const screensRoutes = require('./routes/screens');
const roleScreenPermissionsRoutes = require('./routes/roleScreenPermissions');
//Cotizador_V2
const examRoutes = require('./routes/exams');
const appointmentRoutes = require('./routes/appointments');
const exchangeRateRoutes = require('./routes/exchangeRate');
const quotesRoutes = require('./routes/quotes');
const seguimientoRoutes = require('./routes/seguimiento');
const demoRoutes = require('./routes/demo'); // Ruta para demostración de correos
const schedule = require('node-schedule');
const ArchivoAdjunto = require('./models/archivoAdjunto');

// Configuración avanzada de seguridad
// Limitar solicitudes para prevenir ataques de fuerza bruta - COMPLETAMENTE DESACTIVADO
// El rate limiting estaba causando errores 429 (Too Many Requests)

// No implementamos ningún limitador de tasa, ya que estaba causando problemas
// con el error 429 "Too Many Requests"

// Configurar CORS para entornos de producción/desarrollo
const corsOptions = {
  origin: true, //process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600 // Cache preflight por 10 minutos (600 segundo)
};

// Middleware de seguridad global
app.use(cors(corsOptions));
app.use(helmet()); // Protección con headers HTTP
app.use(express.json({ limit: '1mb' })); // Limitar tamaño de payload
app.use(securityHeaders);
app.use(preventXSS); // Proteger contra XSS
// El rate limiter ha sido completamente eliminado para evitar errores 429

// Servir archivos estáticos
const logosFolderPath = path.join(__dirname, '..', 'frontend', 'src', 'components', 'logos_empresas');
app.use('/components/logos_empresas', express.static(logosFolderPath));

// Servir archivos estáticos del frontend (incluyendo logo_header.png)
const frontendSrcPath = path.join(__dirname, '..', 'frontend', 'src');
app.use('/frontend/src', express.static(frontendSrcPath));

// Configurar acceso a la carpeta de uploads para ver los archivos adjuntos directamente
const uploadsPath = path.join(__dirname, 'uploads', 'agendamientos');
app.use('/uploads/agendamientos', express.static(uploadsPath));

// Rutas públicas (no requieren autenticación)
app.get('/', (req, res) => {
  res.json({ message: 'API del Centro Médico funcionando correctamente' });
});

// Ruta para autenticación - acceso público al login
app.use('/api/auth', adminUsersRoutes);

// Rutas que requieren protección contra inyección pero no autenticación
app.use('/api/pacientes', preventInjection);
// ...otras rutas públicas que necesiten protección contra inyección...

// Comentado temporalmente para permitir el funcionamiento del frontend
// mientras se implementa la autenticación en el lado del cliente
/*
// Aplicar middleware de autenticación a rutas protegidas
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
app.use('/api/exchange-rate', exchangeRateRoutes); // Añadir ruta adicional compatible con el frontend
app.use('/api/cotizaciones', quotesRoutes);
app.use('/api/seguimiento', seguimientoRoutes);
// Nuevas rutas para gestión de pantallas y permisos
app.use('/api/screens', screensRoutes);
app.use('/api/role-screen-permissions', roleScreenPermissionsRoutes);

// Ruta de demostración (sin autenticación para fácil acceso)
app.use('/demo', demoRoutes);

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

// Iniciar el servidor - configuración simplificada para escuchar en todas las interfaces
app.listen(port, '0.0.0.0', () => {
  logger.logGeneral(`Backend corriendo en http://10.20.20.111:${port}`);
});

