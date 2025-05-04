const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const ArchivoAdjunto = require('../models/archivoAdjunto');

// Configuración del directorio de uploads
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'agendamientos');

// Asegurar que el directorio existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuración de Multer para el almacenamiento
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function(req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    cb(null, fileName);
  }
});

// Filtro para tipos de archivos permitidos
const fileFilter = (req, file, cb) => {
  // Aceptar PDF, JPG/JPEG, PNG, GIF, SVG para los logos
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, PNG, GIF y SVG.'), false);
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
    
    const filePath = path.resolve(archivo.ruta_archivo);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'El archivo físico no existe' });
    }
    
    // Establecer tipo de contenido
    res.setHeader('Content-Type', archivo.tipo_archivo);
    
    // Decidir si mostrar en navegador o descargar basado en query param
    const descargar = req.query.download === 'true';
    if (descargar) {
      res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombre_original}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre_original}"`);
    }
    
    // Enviar el archivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error al obtener archivo:', error);
    res.status(500).json({ error: 'Error al obtener el archivo' });
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
  eliminarArchivo,
  limpiarArchivosExpirados
};