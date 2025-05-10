import React, { useEffect, useState } from "react";
import axios from "axios";
// Eliminadas las importaciones CSS redundantes que ahora están en main.css
import AdminFilterBar from "../../components/admin/AdminFilterBar"; // Importamos el nuevo componente
import ArchivoAdjuntoForm from "../../components/common/ArchivoAdjuntoForm"; // Importamos el componente de archivos mejorado desde la ubicación común
import FormField from "../../components/common/FormField"; // Importamos el nuevo componente de formulario

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
  
  // Estados para filtrado y ordenamiento
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [sortOrder, setSortOrder] = useState("az");
  
  // Estados para modal
  const [showModal, setShowModal] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [logoArchivoId, setLogoArchivoId] = useState(null);
  
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

  // Filtrar y ordenar empresas cuando cambian los criterios
  useEffect(() => {
    if (empresas.length > 0) {
      let filtered = [...empresas];
      
      // Filtrar por término de búsqueda
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(empresa => 
          empresa.nombre_empresa.toLowerCase().includes(term) ||
          empresa.rif.toLowerCase().includes(term)
        );
      }
      
      // Filtrar por estado activo/inactivo
      if (!showArchived) {
        filtered = filtered.filter(empresa => empresa.is_active);
      }
      
      // Aplicar ordenamiento
      switch (sortOrder) {
        case 'az':
          filtered = [...filtered].sort((a, b) => 
            a.nombre_empresa.localeCompare(b.nombre_empresa)
          );
          break;
        case 'za':
          filtered = [...filtered].sort((a, b) => 
            b.nombre_empresa.localeCompare(a.nombre_empresa)
          );
          break;
        default:
          break;
      }
      
      setFilteredEmpresas(filtered);
    }
  }, [searchTerm, empresas, showArchived, sortOrder]);

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
    setLogoArchivoId(null);
    setShowModal(true);
  };

  const handleEditEmpresa = (empresa) => {
    setCurrentEmpresa(empresa);
    setFormData({
      nombre_empresa: empresa.nombre_empresa,
      rif: empresa.rif,
      logo_url: empresa.logo_url || ""
    });
    setLogoArchivoId(null);
    setShowModal(true);
  };

  const handleFileUploaded = (fileId) => {
    setLogoArchivoId(fileId);
    if (fileId) {
      // Actualizar la URL del logo cuando se sube un archivo
      setFormData({
        ...formData,
        logo_url: `/api/archivos/${fileId}`
      });
    } else {
      setFormData({
        ...formData,
        logo_url: ""
      });
    }
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
      <div className="admin-header">
        <h1>Gestión de Empresas</h1>
        <div className="admin-header-buttons">
          <button className="button button--primary" onClick={handleCreateEmpresa}>
            Registrar empresa
          </button>
        </div>
      </div>
      
      <AdminFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Buscar por nombre o RIF..."
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      {mensaje && <div className="success-message">{mensaje}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading-container">Cargando empresas...</div>
      ) : filteredEmpresas.length === 0 ? (
        <div className="no-results">No se encontraron empresas</div>
      ) : (
        <div className="empresas-table-container">
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
                <tr key={empresa.id_empresa} className={!empresa.is_active ? 'inactive-row' : ''}>
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
                    <span className={`status-badge ${empresa.is_active ? 'status-activo' : 'status-inactivo'}`}>
                      {empresa.is_active ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="button button--subtle button--small" 
                      onClick={() => handleEditEmpresa(empresa)}
                      title="Editar"
                    >
                      ✏️ Editar
                    </button>
                    {empresa.is_active ? (
                      <button
                        className="button button--neutral button--small"
                        onClick={() => cambiarEstadoEmpresa(empresa.id_empresa, false)}
                        title="Desactivar"
                      >
                        🚫 Desactivar
                      </button>
                    ) : (
                      <button
                        className="button button--neutral button--small"
                        onClick={() => cambiarEstadoEmpresa(empresa.id_empresa, true)}
                        title="Activar"
                      >
                        ✓ Activar
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
              <button className="button button--subtle button--icon-only" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <FormField
                  id="nombre_empresa"
                  label="Nombre de la empresa"
                  type="text"
                  name="nombre_empresa"
                  value={formData.nombre_empresa}
                  onChange={handleInputChange}
                  required
                />

                <FormField
                  id="rif"
                  label="RIF"
                  type="text"
                  name="rif"
                  value={formData.rif}
                  onChange={handleInputChange}
                  required
                />

                <div className="form-group">
                  <label>Logo de la empresa</label>
                  <ArchivoAdjuntoForm 
                    onFileUploaded={handleFileUploaded} 
                    requiereArchivo={false} 
                  />
                </div>

                {formData.logo_url && !logoArchivoId && (
                  <div className="logo-preview">
                    <p>Logo actual:</p>
                    <img 
                      src={formData.logo_url} 
                      alt="Logo actual" 
                      className="logo-preview-image" 
                    />
                  </div>
                )}
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="button button--neutral" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="button" className="button button--primary" onClick={handleSubmit}>
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
