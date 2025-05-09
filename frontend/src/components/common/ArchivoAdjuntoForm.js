import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ArchivoAdjuntoForm.css';

const ArchivoAdjuntoForm = ({ onFileUploaded, requiereArchivo }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [archivoId, setArchivoId] = useState(null);

  // Configuración de límites
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setError('');
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validar tipo de archivo
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo se aceptan PDF, JPG y PNG.');
      fileInputRef.current.value = '';
      setSelectedFile(null);
      return;
    }

    // Validar tamaño de archivo
    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo es demasiado grande. El tamaño máximo es ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      fileInputRef.current.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    
    // Iniciar carga automáticamente después de seleccionar el archivo
    await handleUpload(file);
  };

  const handleUpload = async (fileToUpload) => {
    const fileToUse = fileToUpload || selectedFile;
    
    if (!fileToUse) {
      if (requiereArchivo) {
        setError('Por favor selecciona un archivo.');
      }
      return;
    }

    setLoading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('archivo', fileToUse);

    try {
      console.log("Enviando archivo al servidor...");
      const response = await axios.post('/api/archivos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });

      console.log("Respuesta del servidor:", response.data);
      const { archivo } = response.data;
      console.log("ID del archivo recibido:", archivo?.id);
      setArchivoId(archivo.id);
      
      // Notificar al componente padre
      if (onFileUploaded) {
        onFileUploaded(archivo.id);
      }

      // Limpiar después de la subida exitosa
      setSelectedFile(null);
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setError(error.response?.data?.error || 'Error al subir el archivo. Inténtalo de nuevo.');
      // Restaurar input de archivo para permitir reintento
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Si ya se había subido un archivo, notificar que fue removido
    if (archivoId && onFileUploaded) {
      onFileUploaded(null);
      setArchivoId(null);
    }
  };

  return (
    <div className="archivo-adjunto-form">
      <div className="form-group">
        <label className="archivo-label">
          {requiereArchivo ? 'Adjuntar archivo (obligatorio):' : 'Adjuntar archivo (opcional):'}
          <span className="file-info-text">
            Formatos permitidos: PDF, JPG, PNG. Tamaño máximo: 20MB.
          </span>
        </label>
        
        <div className="file-input-container">
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept={ALLOWED_FILE_EXTENSIONS.join(',')}
            disabled={loading || archivoId}
            className="file-input"
          />
          
          {archivoId && (
            <button 
              type="button"
              onClick={handleRemoveFile}
              className="remove-button"
            >
              Quitar archivo
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {loading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            <span className="progress-text">{progress}% {progress < 100 ? 'Subiendo...' : 'Finalizando...'}</span>
          </div>
        )}

        {archivoId && (
          <div className="success-message">
            Archivo subido exitosamente.
          </div>
        )}
        
        {selectedFile && !archivoId && !loading && (
          <div className="selected-file-info">
            <p><strong>Nombre:</strong> {selectedFile.name}</p>
            <p><strong>Tamaño:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivoAdjuntoForm;