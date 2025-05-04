import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminConvenios.css";

const AdminConvenios = () => {
  // Estados para los datos
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el formulario de agregar nueva empresa
  const [nombre, setNombre] = useState("");
  const [rif, setRif] = useState("");
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  
  // Estados para modal y edición
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [editMode, setEditMode] = useState(false);

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
      results = results.filter(empresa => empresa.activa);
    }
    
    setFilteredEmpresas(results);
  };

  // Cargar datos iniciales
  useEffect(() => {
    cargarEmpresas();
  }, []);

  // Aplicar filtros cuando cambian los criterios
  useEffect(() => {
    applyFilters();
  }, [searchTerm, showArchived]);

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
      const res = await axios.post(`${process.env.REACT_APP_API_URL || ''}/api/empresas`, {
        nombre_empresa: nombre,
        rif: rifLimpio
      });

      setNombre("");
      setRif("");
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
        rif: rifLimpio
      });

      setEditMode(false);
      cargarEmpresas();
      setFormSuccess("Convenio actualizado correctamente.");
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

  // Mostrar detalle de empresa
  const mostrarDetalle = (empresa) => {
    setCurrentEmpresa(empresa);
    setShowDetailModal(true);
    setEditMode(false);
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
                <input
                  type="text"
                  value={rif}
                  onChange={(e) => setRif(e.target.value)}
                  className="form-control"
                  placeholder="J-12345678-9"
                />
                <small className="form-text text-muted">
                  Formato: J-12345678-9, V-12345678-9, E-12345678-9, P-12345678-9 o G-12345678-9
                </small>
              </div>
              
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
                  <input
                    type="text"
                    value={currentEmpresa.rif}
                    onChange={(e) => setCurrentEmpresa({...currentEmpresa, rif: e.target.value})}
                    className="form-control"
                  />
                  <small className="form-text text-muted">
                    Formato: J-12345678-9, V-12345678-9, E-12345678-9, P-12345678-9 o G-12345678-9
                  </small>
                </div>
                
                {formError && <div className="alert alert-danger">{formError}</div>}
                
                <div className="action-buttons">
                  <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>
                    Cancelar
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
                    <div>
                      <strong>Estado:</strong>
                      <span className={`status-badge ${currentEmpresa.activa ? 'confirmada' : 'cancelada'}`}>
                        {currentEmpresa.activa ? 'Activo' : 'Archivado'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  {currentEmpresa.activa && (
                    <>
                      <button className="btn-secondary" onClick={() => {
                        setShowDetailModal(false);
                        setShowArchiveModal(true);
                      }}>
                        Archivar
                      </button>
                      <button className="btn-primary" onClick={() => setEditMode(true)}>
                        Editar
                      </button>
                    </>
                  )}
                  {!currentEmpresa.activa && (
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
                  <span className={`status-badge ${empresa.activa ? 'confirmada' : 'cancelada'}`}>
                    {empresa.activa ? 'Activo' : 'Archivado'}
                  </span>
                </td>
                <td className="actions-cell">
                  <button 
                    className="btn-action btn-view" 
                    onClick={() => mostrarDetalle(empresa)}
                    title="Ver detalles"
                  >
                    👁️
                  </button>
                  {empresa.activa && (
                    <button
                      className="btn-action btn-archive"
                      onClick={() => {
                        setCurrentEmpresa(empresa);
                        setShowArchiveModal(true);
                      }}
                      title="Archivar"
                    >
                      📁
                    </button>
                  )}
                  {!empresa.activa && (
                    <button
                      className="btn-action btn-activate"
                      onClick={() => activarEmpresa(empresa.id_empresa)}
                      title="Activar"
                    >
                      ✓
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