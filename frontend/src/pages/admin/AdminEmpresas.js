import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../components/admin/AdminCommon.css"; // Importamos los estilos comunes

const AdminEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  
  // Estado para el formulario de empresas
  const [formData, setFormData] = useState({
    nombre_empresa: "",
    rif: "",
    logo_url: ""
  });
  
  // Estado para el filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  
  // Estados para modal
  const [showModal, setShowModal] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  
  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/empresas");
      setEmpresas(res.data);
      setFilteredEmpresas(res.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar empresas", err);
      setError("Error al cargar las empresas. Por favor, intente de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empresas cuando cambia el término de búsqueda
  useEffect(() => {
    if (empresas.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredEmpresas(empresas);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = empresas.filter(empresa => 
          empresa.nombre_empresa.toLowerCase().includes(term) ||
          empresa.rif.toLowerCase().includes(term)
        );
        setFilteredEmpresas(filtered);
      }
    }
  }, [searchTerm, empresas]);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCreateEmpresa = () => {
    setCurrentEmpresa(null);
    setFormData({
      nombre_empresa: "",
      rif: "",
      logo_url: ""
    });
    setShowModal(true);
  };

  const handleEditEmpresa = (empresa) => {
    setCurrentEmpresa(empresa);
    setFormData({
      nombre_empresa: empresa.nombre_empresa,
      rif: empresa.rif,
      logo_url: empresa.logo_url || ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    if (!formData.nombre_empresa || !formData.rif) {
      setError("El nombre y RIF son campos obligatorios.");
      return;
    }

    try {
      if (currentEmpresa) {
        // Actualizar empresa existente
        await axios.put("/api/empresas", {
          id_empresa: currentEmpresa.id_empresa,
          ...formData
        });
        setMensaje("Empresa actualizada correctamente.");
      } else {
        // Crear nueva empresa
        await axios.post("/api/empresas", formData);
        setMensaje("Empresa registrada correctamente.");
      }
      
      setShowModal(false);
      cargarEmpresas();
    } catch (err) {
      setError(err.response?.data?.error || "Error inesperado al procesar la solicitud.");
    }
  };

  const cambiarEstadoEmpresa = async (id_empresa, activar) => {
    const action = activar ? "activar" : "desactivar";
    const confirmar = window.confirm(`¿Desea ${action} esta empresa?`);
    if (!confirmar) return;

    try {
      if (activar) {
        await axios.patch(`/api/empresas/${id_empresa}/activar`);
      } else {
        await axios.delete(`/api/empresas/${id_empresa}`);
      }
      cargarEmpresas();
    } catch (err) {
      alert(`Error al ${action} la empresa.`);
    }
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Gestión de Empresas</h1>
      
      <div className="admin-filters-bar">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar por nombre o RIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <button className="btn-add" onClick={handleCreateEmpresa}>
          Registrar empresa
        </button>
      </div>
      
      {mensaje && <div className="success-message">{mensaje}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-container">Cargando empresas...</div>
      ) : filteredEmpresas.length === 0 ? (
        <div className="no-results">No se encontraron empresas</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
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
                  <td>{empresa.rif}</td>
                  <td>
                    {empresa.logo_url ? (
                      <img 
                        src={empresa.logo_url} 
                        alt={`Logo de ${empresa.nombre_empresa}`} 
                        className="empresa-logo"
                      />
                    ) : (
                      <span className="no-logo">Sin logo</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${empresa.is_active ? 'status-active' : 'status-inactive'}`}>
                      {empresa.is_active ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action btn-edit" 
                      onClick={() => handleEditEmpresa(empresa)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {empresa.is_active ? (
                      <button
                        className="btn-action btn-delete"
                        onClick={() => cambiarEstadoEmpresa(empresa.id_empresa, false)}
                        title="Desactivar"
                      >
                        🚫
                      </button>
                    ) : (
                      <button
                        className="btn-action btn-activate"
                        onClick={() => cambiarEstadoEmpresa(empresa.id_empresa, true)}
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
      )}

      {/* Modal para añadir/editar empresa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentEmpresa ? "Editar empresa" : "Registrar nueva empresa"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre_empresa">Nombre de la empresa</label>
                  <input
                    id="nombre_empresa"
                    type="text"
                    name="nombre_empresa"
                    value={formData.nombre_empresa}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rif">RIF</label>
                  <input
                    id="rif"
                    type="text"
                    name="rif"
                    value={formData.rif}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="logo_url">URL del Logo</label>
                  <input
                    id="logo_url"
                    type="text"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>

                {formData.logo_url && (
                  <div className="logo-preview">
                    <p>Vista previa del logo:</p>
                    <img 
                      src={formData.logo_url} 
                      alt="Vista previa del logo" 
                      className="logo-preview-image" 
                    />
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit}>
                {currentEmpresa ? "Actualizar" : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmpresas;
