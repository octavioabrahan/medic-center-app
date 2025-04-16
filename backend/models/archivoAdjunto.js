const pool = require('./db');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

class ArchivoAdjunto {
  static async crearArchivo(nombreOriginal, rutaArchivo, tipoArchivo, tamaño, diasExpiracion = 30) {
    try {
      // Calcular fecha de expiración
      const fechaExpiracion = new Date();
      fechaExpiracion.setDate(fechaExpiracion.getDate() + diasExpiracion);

      const query = `
        INSERT INTO archivos_adjuntos 
        (nombre_original, ruta_archivo, tipo_archivo, tamaño, fecha_expiracion)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [nombreOriginal, rutaArchivo, tipoArchivo, tamaño, fechaExpiracion];
      const result = await pool.query(query, values);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear registro de archivo:', error);
      throw error;
    }
  }

  static async obtenerArchivoPorId(id) {
    try {
      const query = 'SELECT * FROM archivos_adjuntos WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener archivo:', error);
      throw error;
    }
  }

  static async eliminarArchivo(id) {
    try {
      // Primero obtenemos la info del archivo para eliminar el archivo físico
      const archivoInfo = await this.obtenerArchivoPorId(id);
      
      if (archivoInfo) {
        // Eliminar el archivo físico
        const rutaCompleta = path.resolve(archivoInfo.ruta_archivo);
        if (fs.existsSync(rutaCompleta)) {
          fs.unlinkSync(rutaCompleta);
        }
        
        // Eliminar el registro de la base de datos
        const query = 'DELETE FROM archivos_adjuntos WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        
        return result.rows[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      throw error;
    }
  }

  static async limpiarArchivosExpirados() {
    try {
      const now = new Date();
      
      // Obtener archivos expirados
      const querySelect = 'SELECT * FROM archivos_adjuntos WHERE fecha_expiracion < $1';
      const archivosExpirados = await pool.query(querySelect, [now]);
      
      for (const archivo of archivosExpirados.rows) {
        // Intentar eliminar el archivo físico
        const rutaCompleta = path.resolve(archivo.ruta_archivo);
        if (fs.existsSync(rutaCompleta)) {
          fs.unlinkSync(rutaCompleta);
          console.log(`Archivo físico eliminado: ${rutaCompleta}`);
        }
      }
      
      // Eliminar los registros expirados
      const queryDelete = 'DELETE FROM archivos_adjuntos WHERE fecha_expiracion < $1 RETURNING id';
      const result = await pool.query(queryDelete, [now]);
      
      console.log(`Limpieza completada: ${result.rowCount} archivos eliminados`);
      return result.rowCount;
    } catch (error) {
      console.error('Error durante la limpieza de archivos expirados:', error);
      throw error;
    }
  }
}

module.exports = ArchivoAdjunto;