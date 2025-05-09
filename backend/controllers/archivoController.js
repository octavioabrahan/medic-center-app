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
      
      // Asegurarse de que la ruta esté construida correctamente sin caracteres problemáticos
      const logoPath = `/components/logos_empresas/${fileName}`.replace(/\/\//g, '/');
      
      console.log("Logo subido exitosamente:", logoPath);
      
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
    console.log('Obteniendo archivo con ID:', id);
    
    // Obtener información del archivo desde la base de datos
    const archivo = await ArchivoAdjunto.obtenerArchivoPorId(id);
    
    if (!archivo) {
      console.error('Archivo no encontrado en la base de datos:', id);
      return res.status(404).json({ error: 'Archivo no encontrado en la base de datos' });
    }
    
    console.log('Información del archivo obtenida:', {
      id: archivo.id,
      nombre: archivo.nombre_original,
      tipo: archivo.tipo_archivo,
      ruta: archivo.ruta_archivo
    });
    
    // Extraer solo el nombre del archivo de la ruta completa
    const nombreArchivo = path.basename(archivo.ruta_archivo);
    console.log('Nombre de archivo extraído:', nombreArchivo);
    
    // Intentar diferentes rutas para encontrar el archivo
    let rutasIntento = [];
    let archivoEncontrado = false;
    let rutaCorrecta = '';
    
    // 1. Intentar con la ruta exacta almacenada en la BD
    rutasIntento.push(archivo.ruta_archivo);
    
    // 2. Intentar con la ruta relativa desde el directorio de uploads
    rutasIntento.push(path.join(UPLOAD_DIR, nombreArchivo));
    
    // 3. Intentar buscando directamente por el nombre del archivo en el directorio de uploads
    rutasIntento.push(path.join(UPLOAD_DIR, nombreArchivo));
    
    // 4. Intentar con el directorio absoluto predeterminado
    rutasIntento.push(path.join('/opt/medic-center-app/backend/uploads/agendamientos', nombreArchivo));
    
    // 5. Intentar con el directorio absoluto alternativo (en caso de ser un entorno de desarrollo)
    rutasIntento.push(path.join(process.cwd(), 'uploads', 'agendamientos', nombreArchivo));
    
    // Eliminar duplicados
    rutasIntento = [...new Set(rutasIntento)];
    
    // Verificar cada ruta
    for (let ruta of rutasIntento) {
      console.log('Intentando acceder a ruta:', ruta);
      if (fs.existsSync(ruta)) {
        archivoEncontrado = true;
        rutaCorrecta = ruta;
        console.log('¡Archivo encontrado en:', rutaCorrecta);
        break;
      }
    }
    
    // Si no se encuentra el archivo en ninguna ruta, devolver error 404
    if (!archivoEncontrado) {
      console.error('No se pudo encontrar el archivo físico. Rutas intentadas:', rutasIntento);
      return res.status(404).json({ 
        error: 'No se pudo encontrar el archivo físico',
        rutasIntentadas: rutasIntento
      });
    }
    
    // Configurar la respuesta con los encabezados correctos según el tipo MIME
    res.setHeader('Content-Type', archivo.tipo_archivo);
    
    // Decidir si mostrar en navegador o descargar
    const descargar = req.query.download === 'true';
    if (descargar) {
      res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombre_original}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre_original}"`);
    }
    
    // Stream de archivo para optimizar el uso de memoria
    const fileStream = fs.createReadStream(rutaCorrecta);
    fileStream.on('error', (error) => {
      console.error('Error al leer el archivo:', error);
      // Solo enviar respuesta si no se ha enviado ya
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al leer el archivo' });
      }
    });
    
    // Pipe directamente al response
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error general al obtener archivo:', error);
    // Solo enviar respuesta si no se ha enviado ya
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Error al obtener el archivo',
        mensaje: error.message
      });
    }
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

// Controlador para obtener una miniatura del archivo
const obtenerThumbnail = async (req, res) => {
  try {
    const { id } = req.params;
    const archivo = await ArchivoAdjunto.obtenerArchivoPorId(id);
    
    if (!archivo) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    // Verificar si el archivo existe físicamente
    if (!fs.existsSync(archivo.ruta_archivo)) {
      return res.status(404).json({ error: 'El archivo físico no existe' });
    }
    
    // Comprobar si es una imagen
    const esImagen = archivo.tipo_archivo.startsWith('image/');
    
    if (esImagen) {
      // Si es imagen, servir la imagen directamente como miniatura
      res.setHeader('Content-Type', archivo.tipo_archivo);
      fs.createReadStream(archivo.ruta_archivo).pipe(res);
    } else {
      // Si no es imagen, servir un ícono genérico según el tipo de archivo
      let iconoRuta;
      
      if (archivo.tipo_archivo === 'application/pdf') {
        iconoRuta = path.join(__dirname, '..', 'assets', 'pdf-icon.png');
      } else {
        iconoRuta = path.join(__dirname, '..', 'assets', 'document-icon.png');
      }
      
      // Verificar si existe el icono, si no, usar una respuesta alternativa
      if (fs.existsSync(iconoRuta)) {
        res.setHeader('Content-Type', 'image/png');
        fs.createReadStream(iconoRuta).pipe(res);
      } else {
        // Redirigir a un icono genérico online si no tenemos el icono localmente
        res.redirect('https://cdn-icons-png.flaticon.com/512/337/337946.png');
      }
    }
  } catch (error) {
    console.error('Error al obtener miniatura:', error);
    res.status(500).json({ error: 'Error al generar la miniatura del archivo' });
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
  obtenerThumbnail,
  eliminarArchivo,
  limpiarArchivosExpirados
};