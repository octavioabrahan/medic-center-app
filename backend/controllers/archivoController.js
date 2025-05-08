const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const ArchivoAdjunto = require('../models/archivoAdjunto');

// Configuración de los directorios de uploads
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'agendamientos');
const LOGOS_DIR = path.join(__dirname, '..', '..', 'frontend', 'src', 'components', 'logos_empresas');

// Asegurar que los directorios existen
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

// Configuración de Multer para el almacenamiento
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determinar si es un logo o un adjunto normal
    const isLogo = req.query.tipo === 'logo';
    cb(null, isLogo ? LOGOS_DIR : UPLOAD_DIR);
  },
  filename: function(req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    cb(null, fileName);
  }
});

// Filtro para tipos de archivos permitidos
const fileFilter = (req, file, cb) => {
  const isLogo = req.query.tipo === 'logo';
  
  if (isLogo) {
    // Filtros más estrictos para logos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido para logos. Solo se aceptan JPG, PNG, GIF y SVG.'), false);
    }
  } else {
    // Para otros tipos de archivos adjuntos
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, PNG, GIF y SVG.'), false);
    }
  }
};

// Configuración de Multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB máximo
  },
  fileFilter: fileFilter
});

// Controlador para subir archivo
const subirArchivo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Determinar si es un logo o un adjunto normal
    const isLogo = req.query.tipo === 'logo';

    if (isLogo) {
      // Para logos, simplemente devolver la ruta relativa
      const fileName = path.basename(req.file.path);
      const logoPath = `/components/logos_empresas/${fileName}`;
      
      res.status(201).json({
        message: 'Logo subido exitosamente',
        archivo: {
          id: null, // No necesitamos ID para los logos
          url: logoPath,
          nombre_original: req.file.originalname,
          tipo_archivo: req.file.mimetype,
          tamaño: req.file.size
        }
      });
    } else {
      // Para archivos normales, manejar como antes
      // Crear registro en la base de datos
      const archivoInfo = await ArchivoAdjunto.crearArchivo(
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        30 // días de expiración
      );

      // Generar la URL para acceder al archivo
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = `${baseUrl}/api/archivos/${archivoInfo.id}`;

      // Incluir la URL en la respuesta
      res.status(201).json({
        message: 'Archivo subido exitosamente',
        archivo: {
          ...archivoInfo,
          url: fileUrl
        }
      });
    }
  } catch (error) {
    console.error('Error al subir archivo:', error);
    
    // Si ocurre un error, intentar eliminar el archivo subido
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
};

// Controlador para descargar/ver archivo
const obtenerArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const archivo = await ArchivoAdjunto.obtenerArchivoPorId(id);
    
    if (!archivo) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Extraer solo la parte del nombre del archivo de la ruta completa
    // Esto es importante porque las rutas completas en el servidor no son accesibles desde el navegador
    let filePath = archivo.ruta_archivo;
    
    console.log('Ruta original del archivo:', filePath);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        error: `El archivo físico no existe en la ruta: ${filePath}`,
        detalles: `Tipo: ${archivo.tipo_archivo}, Nombre original: ${archivo.nombre_original}`
      });
    }
    
    // Establecer tipo de contenido basado en el registro del archivo
    res.setHeader('Content-Type', archivo.tipo_archivo);
    
    // Decidir si mostrar en navegador o descargar basado en query param
    const descargar = req.query.download === 'true';
    if (descargar) {
      res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombre_original}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre_original}"`);
    }
    
    // Leer y enviar el archivo como respuesta
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error al leer el archivo:', err);
        return res.status(500).json({ error: 'Error al leer el archivo' });
      }
      res.end(data);
    });
  } catch (error) {
    console.error('Error al obtener archivo:', error);
    res.status(500).json({ 
      error: 'Error al obtener el archivo', 
      mensaje: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// Controlador para obtener información del archivo sin enviarlo
const obtenerInfoArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const archivo = await ArchivoAdjunto.obtenerArchivoPorId(id);
    
    if (!archivo) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Verificar si el archivo existe físicamente
    if (!fs.existsSync(archivo.ruta_archivo)) {
      return res.status(404).json({ error: 'El archivo físico no existe en el servidor' });
    }
    
    // Extraer solo el nombre del archivo de la ruta completa
    const nombreArchivo = path.basename(archivo.ruta_archivo);
    
    // Devolver información relevante sobre el archivo
    res.json({
      id: archivo.id,
      nombre_original: archivo.nombre_original,
      ruta_archivo: archivo.ruta_archivo,
      tipo_archivo: archivo.tipo_archivo,
      tamaño: archivo.tamaño,
      fecha_subida: archivo.fecha_subida,
      nombre_archivo: nombreArchivo
    });
  } catch (error) {
    console.error('Error al obtener información del archivo:', error);
    res.status(500).json({ error: 'Error al obtener información del archivo' });
  }
};

// Eliminar archivo
const eliminarArchivo = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await ArchivoAdjunto.eliminarArchivo(id);
    
    if (!resultado) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    res.status(200).json({ message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    res.status(500).json({ error: 'Error al eliminar el archivo' });
  }
};

// Limpiar archivos expirados (para llamar desde un cron)
const limpiarArchivosExpirados = async (req, res) => {
  try {
    const archivosEliminados = await ArchivoAdjunto.limpiarArchivosExpirados();
    res.status(200).json({ 
      message: `Limpieza completada: ${archivosEliminados} archivos eliminados` 
    });
  } catch (error) {
    console.error('Error al limpiar archivos expirados:', error);
    res.status(500).json({ error: 'Error al limpiar archivos expirados' });
  }
};

module.exports = {
  upload,
  subirArchivo,
  obtenerArchivo,
  obtenerInfoArchivo,
  eliminarArchivo,
  limpiarArchivosExpirados
};