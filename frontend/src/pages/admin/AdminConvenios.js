import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminConvenios.css";

const LogoUploader = ({ onLogoUploaded, initialLogo }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialLogo || "");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = React.useRef(null);
  
  // Configuración de límites
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
  const ALLOWED_FILE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];

  // Efecto para manejar la URL inicial cuando se recibe
  useEffect(() => {
    if (initialLogo) {
      setPreviewUrl(initialLogo);
    }
  }, [initialLogo]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setError('');
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validar tipo de archivo
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Formato no permitido. Solo se aceptan JPG, PNG, GIF y SVG.');
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
    
    // Crear una vista previa
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona una imagen.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('archivo', selectedFile);

    try {
      console.log('Iniciando carga de logo...');
      // Añadir parámetro tipo=logo a la URL para indicar que es un logo
      const response = await axios.post('/api/archivos/upload?tipo=logo', formData, {
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

      console.log('Respuesta del servidor:', response.data);
      
      if (!response.data || !response.data.archivo || !response.data.archivo.url) {
        throw new Error('Formato de respuesta inválido: No se recibió la ruta del archivo');
      }
      
      const logoPath = response.data.archivo.url;
      console.log('Ruta del logo recibida:', logoPath);
      
      // Notificar al componente padre con la ruta del archivo
      if (onLogoUploaded) {
        onLogoUploaded(logoPath);
      }
      
      // Actualizar vista previa con la ruta real del servidor
      setPreviewUrl(logoPath);

      // Limpiar selección después de la subida exitosa
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Mostrar mensaje de éxito temporal
      setError('');
    } catch (error) {
      console.error('Error detallado al subir imagen:', error);
      let errorMessage = 'Error al subir la imagen. Inténtalo de nuevo.';
      
      if (error.response) {
        console.error('Respuesta del servidor:', error.response.data);
        errorMessage = error.response.data?.error || errorMessage;
      }
      
      setError(errorMessage);
      setPreviewUrl(''); // Limpiar la vista previa en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Notificar al componente padre que la imagen fue eliminada
    if (onLogoUploaded) {
      onLogoUploaded("");
    }
  };

  return (
    <div className="logo-uploader">
      <div className="form-group">
        <label>Logo de la empresa</label>
        
        <div className="file-input-container">
          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            accept={ALLOWED_FILE_EXTENSIONS.join(',')}
            disabled={loading}
            className="file-input"
          />
          
          {selectedFile && !loading && (
            <button 
              type="button"
              onClick={handleUpload}
              className="upload-button"
            >
              Subir imagen
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {loading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            <span className="progress-text">{progress}%</span>
          </div>
        )}
        
        {previewUrl && (
          <div className="logo-preview">
            <img 
              src={previewUrl} 
              alt="Logo de la empresa" 
              style={{ maxWidth: "200px", maxHeight: "100px" }}
            />
            <button 
              type="button" 
              onClick={handleRemoveImage} 
              className="remove-button"
            >
              Eliminar logo
            </button>
          </div>
        )}
        
        <small className="form-text text-muted">
          Formatos permitidos: JPG, PNG, GIF, SVG. Tamaño máximo: 2MB.
        </small>
      </div>
    </div>
  );
};

const AdminConvenios = () => {
  // Estados para los datos
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el formulario de agregar nueva empresa
  const [nombre, setNombre] = useState("");
  const [rif, setRif] = useState("");
  const [logoUrl, setLogoUrl] = useState(""); // Para almacenar la URL del logo
  const [rifBase, setRifBase] = useState(""); // Para la parte base del RIF (sin dígito verificador)
  const [digitoVerificador, setDigitoVerificador] = useState(""); // Para el dígito verificador calculado
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState('az'); // 'az', 'za', 'reciente', 'antiguo'
  
  // Estados para modal y edición
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Función para calcular el dígito verificador del RIF
  const calcularDigitoVerificador = (rifInput) => {
    // Limpiar el RIF
    const rifLimpio = rifInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Verificar que el RIF tenga el formato correcto
    if (!/^[VJEGP][0-9]{8}$/.test(rifLimpio)) return "";

    const letras = { V: 1, E: 2, J: 3, P: 4, G: 5 };
    const letra = rifLimpio.charAt(0);
    const numeros = rifLimpio.substr(1).split('').map(Number);

    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = letras[letra] * 4;

    for (let i = 0; i < 8; i++) {
      suma += numeros[i] * coeficientes[i];
    }

    const resto = suma % 11;
    const digito = resto > 1 ? 11 - resto : 0;

    return digito.toString();
  };

  // Actualizar RIF cuando cambia la parte base
  useEffect(() => {
    if (rifBase) {
      const dv = calcularDigitoVerificador(rifBase);
      setDigitoVerificador(dv);
      setRif(rifBase + dv);
    }
  }, [rifBase]);

  // Función para validar el RIF
  const validarRIF = (rif) => {
    rif = rif.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!/^[VJEGP][0-9]{8}[0-9]$/.test(rif)) return false;

    const letras = { V: 1, E: 2, J: 3, P: 4, G: 5 };
    const letra = rif.charAt(0);
    const numeros = rif.substr(1, 8).split('').map(Number);
    const verificador = parseInt(rif.charAt(9), 10);

    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = letras[letra] * 4;

    for (let i = 0; i < 8; i++) {
      suma += numeros[i] * coeficientes[i];
    }

    const resto = suma % 11;
    const digito = resto > 1 ? 11 - resto : 0;

    return digito === verificador;
  };

  // Formatear RIF para mostrar
  const formatearRIF = (rif) => {
    if (!rif) return '';
    rif = rif.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (rif.length !== 10) return rif;
    return `${rif.substring(0, 1)}-${rif.substring(1, 9)}-${rif.substring(9)}`;
  };

  // Cargar empresas desde la API
  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/empresas`);
      setEmpresas(res.data);
      applyFilters(res.data);
    } catch (err) {
      console.error("Error al cargar empresas", err);
      setError("No se pudieron cargar los convenios. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros a las empresas
  const applyFilters = (data = empresas) => {
    if (!data || data.length === 0) {
      setFilteredEmpresas([]);
      return;
    }

    let results = [...data];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(empresa => 
        empresa.nombre_empresa.toLowerCase().includes(term) ||
        empresa.rif.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado (archivado/activo)
    if (!showArchived) {
      results = results.filter(empresa => empresa.is_active);
    }
    
    // Aplicar ordenamiento
    switch (ordenamiento) {
      case 'az':
        results = [...results].sort((a, b) => 
          a.nombre_empresa.localeCompare(b.nombre_empresa)
        );
        break;
      case 'za':
        results = [...results].sort((a, b) => 
          b.nombre_empresa.localeCompare(a.nombre_empresa)
        );
        break;
      case 'reciente':
        // Asumimos que los IDs más altos son los más recientes
        results = [...results].sort((a, b) => 
          b.id_empresa - a.id_empresa
        );
        break;
      case 'antiguo':
        // Asumimos que los IDs más bajos son los más antiguos
        results = [...results].sort((a, b) => 
          a.id_empresa - b.id_empresa
        );
        break;
      default:
        break;
    }
    
    setFilteredEmpresas(results);
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpresas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplicar filtros cuando cambian los criterios
  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, showArchived, ordenamiento]);

  // Manejar cambios en el campo RIF y calcular dígito verificador
  const handleRifChange = (e) => {
    const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (valor.length <= 9) {
      setRifBase(valor);
      // Cuando se modifica la parte base, el dígito verificador se calculará en el useEffect
    } else {
      // Si el usuario escribe directamente el RIF completo, separar la base y el dígito
      setRifBase(valor.substring(0, 9));
      // El dígito verificador se calculará automáticamente en el useEffect
    }
  };

  // Manejar envío del formulario para crear nueva empresa
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validaciones
    if (!nombre || !rif) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    
    // Validar formato RIF
    const rifLimpio = rif.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!validarRIF(rifLimpio)) {
      setFormError("El RIF ingresado no es válido.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/empresas`, {
        nombre_empresa: nombre,
        rif: rifLimpio,
        logo_url: logoUrl
      });

      setNombre("");
      setRif("");
      setRifBase("");
      setDigitoVerificador("");
      setLogoUrl("");
      setFormSuccess("Convenio registrado correctamente.");
      cargarEmpresas();
      setShowAddModal(false);
    } catch (err) {
      setFormError(err.response?.data?.error || "Error al registrar el convenio.");
    }
  };

  // Editar empresa
  const handleEdit = async (e) => {
    e.preventDefault();
    setFormError(null);
    
    if (!currentEmpresa.nombre_empresa || !currentEmpresa.rif) {
      setFormError("Todos los campos son obligatorios.");
      return;
    }
    
    // Validar formato RIF
    const rifLimpio = currentEmpresa.rif.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!validarRIF(rifLimpio)) {
      setFormError("El RIF ingresado no es válido.");
      return;
    }

    try {
      await axios.put(`${process.env.REACT_APP_API_URL || ''}/api/empresas`, {
        id_empresa: currentEmpresa.id_empresa,
        nombre_empresa: currentEmpresa.nombre_empresa,
        rif: rifLimpio,
        logo_url: currentEmpresa.logo_url
      });

      setEditMode(false);
      cargarEmpresas();
      setFormSuccess("Convenio actualizado correctamente.");
      setShowDetailModal(false);
    } catch (err) {
      setFormError("No se pudo actualizar el convenio.");
    }
  };

  // Archivar empresa
  const archivarEmpresa = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || ''}/api/empresas/${currentEmpresa.id_empresa}`);
      setShowArchiveModal(false);
      setCurrentEmpresa(null);
      cargarEmpresas();
    } catch (err) {
      setError("Error al archivar convenio.");
    }
  };

  // Activar empresa
  const activarEmpresa = async (id_empresa) => {
    try {
      await axios.patch(`${process.env.REACT_APP_API_URL || ''}/api/empresas/${id_empresa}/activar`);
      cargarEmpresas();
    } catch (err) {
      setError("Error al activar convenio.");
    }
  };

  // Mostrar modal de edición
  const handleEditClick = (empresa) => {
    setCurrentEmpresa({...empresa});
    setShowDetailModal(true);
    setEditMode(true);
  };

  // Formulario para agregar empresa
  const renderAddModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Agregar nuevo convenio</h2>
            <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre de la empresa</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="form-control"
                  placeholder="Nombre de la empresa"
                />
              </div>
              
              <div className="form-group">
                <label>RIF</label>
                <div className="rif-input-group">
                  <input
                    type="text"
                    value={rifBase}
                    onChange={handleRifChange}
                    className="form-control rif-base"
                    placeholder="J12345678"
                    maxLength={9}
                  />
                  <span className="rif-separator">-</span>
                  <input
                    type="text"
                    value={digitoVerificador}
                    className="form-control rif-verificador"
                    placeholder="DV"
                    disabled
                  />
                </div>
                <small className="form-text text-muted">
                  Formato: J12345678 (El dígito verificador se calcula automáticamente)
                </small>
              </div>
              
              <LogoUploader 
                onLogoUploaded={(url) => setLogoUrl(url)}
              />
              
              {formError && <div className="alert alert-danger">{formError}</div>}
              
              <div className="action-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar convenio
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Modal de detalles y edición
  const renderDetailModal = () => {
    if (!showDetailModal || !currentEmpresa) return null;

    const handleCurrentEmpresaRifChange = (e) => {
      const valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      if (valor.length <= 9) {
        // Actualizar RIF base
        const rifCompleto = valor + calcularDigitoVerificador(valor);
        setCurrentEmpresa({...currentEmpresa, rif: rifCompleto});
      } else {
        // Si escriben el RIF completo, separar base y dígito
        const base = valor.substring(0, 9);
        const rifCompleto = base + calcularDigitoVerificador(base);
        setCurrentEmpresa({...currentEmpresa, rif: rifCompleto});
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{editMode ? "Editar convenio" : "Detalles del convenio"}</h2>
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            {editMode ? (
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <label>Nombre de la empresa</label>
                  <input
                    type="text"
                    value={currentEmpresa.nombre_empresa}
                    onChange={(e) => setCurrentEmpresa({...currentEmpresa, nombre_empresa: e.target.value})}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label>RIF</label>
                  <div className="rif-input-group">
                    <input
                      type="text"
                      value={currentEmpresa.rif.substring(0, 9)}
                      onChange={handleCurrentEmpresaRifChange}
                      className="form-control rif-base"
                      maxLength={9}
                    />
                    <span className="rif-separator">-</span>
                    <input
                      type="text"
                      value={currentEmpresa.rif.substring(9) || calcularDigitoVerificador(currentEmpresa.rif.substring(0, 9))}
                      className="form-control rif-verificador"
                      disabled
                    />
                  </div>
                  <small className="form-text text-muted">
                    Formato: J12345678 (El dígito verificador se calcula automáticamente)
                  </small>
                </div>
                
                <LogoUploader 
                  onLogoUploaded={(url) => setCurrentEmpresa({...currentEmpresa, logo_url: url})}
                  initialLogo={currentEmpresa.logo_url}
                />
                
                {formError && <div className="alert alert-danger">{formError}</div>}
                
                <div className="action-buttons">
                  <button type="button" className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="btn-archive" onClick={() => {
                    setShowDetailModal(false);
                    setShowArchiveModal(true);
                  }}>
                    Archivar
                  </button>
                  <button type="submit" className="btn-primary">
                    Guardar cambios
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="detail-section">
                  <h3>Información del Convenio</h3>
                  <div className="detail-grid">
                    <div>
                      <strong>ID:</strong> {currentEmpresa.id_empresa}
                    </div>
                    <div>
                      <strong>Nombre:</strong> {currentEmpresa.nombre_empresa}
                    </div>
                    <div>
                      <strong>RIF:</strong> {formatearRIF(currentEmpresa.rif)}
                    </div>
                    {currentEmpresa.logo_url && (
                      <div>
                        <strong>Logo:</strong>
                        <div className="logo-preview">
                          <img 
                            src={currentEmpresa.logo_url} 
                            alt={`Logo de ${currentEmpresa.nombre_empresa}`}
                            style={{ maxWidth: "100px", maxHeight: "100px", marginTop: "8px" }}
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <strong>Estado:</strong>
                      <span className={`status-badge ${currentEmpresa.is_active ? 'confirmada' : 'cancelada'}`}>
                        {currentEmpresa.is_active ? 'Activo' : 'Archivado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                    Cerrar
                  </button>
                  {currentEmpresa.is_active && (
                    <button className="btn-primary" onClick={() => setEditMode(true)}>
                      Editar
                    </button>
                  )}
                  {!currentEmpresa.is_active && (
                    <button className="btn-primary" onClick={() => {
                      activarEmpresa(currentEmpresa.id_empresa);
                      setShowDetailModal(false);
                    }}>
                      Activar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Modal de confirmación para archivar
  const renderArchiveModal = () => {
    if (!showArchiveModal || !currentEmpresa) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>¿Quieres archivar el convenio?</h2>
            <button className="close-btn" onClick={() => setShowArchiveModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <p>Al archivar este convenio:</p>
            <ul>
              <li>Ya no estará disponible en el sitio de agendamiento.</li>
              <li>Los profesionales que lo tienen asignado dejarán de mostrarse si no tienen otros servicios activos.</li>
              <li>Los agendamientos previamente generados no se eliminarán.</li>
            </ul>
            
            <div className="checkbox-container">
              <input 
                type="checkbox" 
                id="confirm-archive" 
                value="confirm"
                onChange={(e) => {}}
              />
              <label htmlFor="confirm-archive">
                Entiendo que este convenio y los profesionales que solo lo ofrecen dejarán de mostrarse en el portal.
              </label>
            </div>
            
            <div className="action-buttons">
              <button className="btn-secondary" onClick={() => setShowArchiveModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={archivarEmpresa}>
                Archivar convenio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderizar tabla de empresas
  const renderConveniosTable = () => {
    if (loading) return <div className="loading">Cargando convenios...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredEmpresas.length === 0) return <div className="no-results">No se encontraron convenios</div>;

    return (
      <div className="table-container">
        <table className="citas-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RIF</th>
              <th>Logo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmpresas.map((empresa) => (
              <tr key={empresa.id_empresa}>
                <td>{empresa.nombre_empresa}</td>
                <td>{formatearRIF(empresa.rif)}</td>
                <td>
                  {empresa.logo_url ? (
                    <img 
                      src={empresa.logo_url}
                      alt={`Logo de ${empresa.nombre_empresa}`}
                      style={{ maxWidth: "40px", maxHeight: "40px" }}
                    />
                  ) : (
                    <span className="no-logo">Sin logo</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${empresa.is_active ? 'confirmada' : 'cancelada'}`}>
                    {empresa.is_active ? 'Activo' : 'Archivado'}
                  </span>
                </td>
                <td className="actions-cell">
                  {empresa.is_active ? (
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditClick(empresa)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                  ) : (
                    <button
                      className="btn-action btn-activate"
                      onClick={() => activarEmpresa(empresa.id_empresa)}
                      title="Activar"
                    >
                      ↩️
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="admin-citas-container">
      <h1>Convenios</h1>
      
      {formSuccess && <div className="success-message">{formSuccess}</div>}
      
      <div className="admin-citas-filters">
        <div className="admin-citas-search">
          <input
            type="text"
            placeholder="Buscar por nombre o RIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-container">
          <div className="sort-buttons">
            <button 
              className={`sort-btn ${ordenamiento === 'az' ? 'active' : ''}`}
              onClick={() => setOrdenamiento('az')}
              title="Ordenar A-Z"
            >
              A → Z
            </button>
            <button 
              className={`sort-btn ${ordenamiento === 'za' ? 'active' : ''}`}
              onClick={() => setOrdenamiento('za')}
              title="Ordenar Z-A"
            >
              Z → A
            </button>
            <button 
              className={`sort-btn ${ordenamiento === 'reciente' ? 'active' : ''}`}
              onClick={() => setOrdenamiento('reciente')}
              title="Más recientes primero"
            >
              Nuevos
            </button>
            <button 
              className={`sort-btn ${ordenamiento === 'antiguo' ? 'active' : ''}`}
              onClick={() => setOrdenamiento('antiguo')}
              title="Más antiguos primero"
            >
              Antiguos
            </button>
          </div>
        </div>
        
        <div className="filter-container">
          <div className="checkbox-container">
            <input 
              type="checkbox" 
              id="show-archived" 
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            <label htmlFor="show-archived">Mostrar archivados</label>
          </div>
        </div>
        
        <button 
          className="btn-add" 
          onClick={() => {
            setNombre("");
            setRif("");
            setRifBase("");
            setDigitoVerificador("");
            setLogoUrl("");
            setFormError(null);
            setShowAddModal(true);
          }}
        >
          + Agregar empresa con convenio
        </button>
      </div>
      
      {renderConveniosTable()}
      {renderAddModal()}
      {renderDetailModal()}
      {renderArchiveModal()}
    </div>
  );
};

export default AdminConvenios;