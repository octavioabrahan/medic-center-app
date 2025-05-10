import React, { useState, useEffect } from "react";
import axios from "axios";
// Eliminada la importación CSS redundante que ahora está en main.css
// import "../../components/admin/AdminCommon.css";
import AdminFilterBar from "../../components/admin/AdminFilterBar"; // Importamos el nuevo componente

function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState([]);
  const [filteredEspecialidades, setFilteredEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentEspecialidad, setCurrentEspecialidad] = useState(null);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: "" });
  const [showArchived, setShowArchived] = useState(false);
  const [sortOrder, setSortOrder] = useState("az");

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  // Filtrar especialidades cuando cambia el término de búsqueda o los filtros
  useEffect(() => {
    if (especialidades.length > 0) {
      let filtered = [...especialidades];
      
      // Filtrar por término de búsqueda
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(esp => 
          esp.nombre.toLowerCase().includes(term)
        );
      }
      
      // Filtrar por estado (archivado/activo)
      // Si se implementa la funcionalidad de archivado en el futuro
      if (!showArchived) {
        filtered = filtered.filter(esp => !esp.archivado);
      }
      
      // Aplicar ordenamiento
      switch (sortOrder) {
        case 'az':
          filtered = [...filtered].sort((a, b) => 
            a.nombre.localeCompare(b.nombre)
          );
          break;
        case 'za':
          filtered = [...filtered].sort((a, b) => 
            b.nombre.localeCompare(a.nombre)
          );
          break;
        default:
          break;
      }
      
      setFilteredEspecialidades(filtered);
    }
  }, [searchTerm, especialidades, showArchived, sortOrder]);

  const fetchEspecialidades = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/especialidades");
      setEspecialidades(response.data);
      setFilteredEspecialidades(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar las especialidades. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEspecialidad = (especialidad) => {
    setCurrentEspecialidad(especialidad);
    setNuevaEspecialidad({ nombre: especialidad.nombre });
    setShowModal(true);
  };

  const handleCreateEspecialidad = () => {
    setCurrentEspecialidad(null);
    setNuevaEspecialidad({ nombre: "" });
    setShowModal(true);
  };

  const handleDeleteEspecialidad = async (especialidadId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta especialidad?')) {
      try {
        await axios.delete(`/api/especialidades/${especialidadId}`);
        fetchEspecialidades();
      } catch (err) {
        console.error('Error eliminando especialidad:', err);
        alert('Hubo un error al eliminar la especialidad');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nuevaEspecialidad.nombre.trim()) {
      alert('El nombre de la especialidad es obligatorio');
      return;
    }

    try {
      if (currentEspecialidad) {
        // Actualizar especialidad existente
        await axios.put(`/api/especialidades/${currentEspecialidad.especialidad_id}`, nuevaEspecialidad);
      } else {
        // Crear nueva especialidad
        await axios.post('/api/especialidades', nuevaEspecialidad);
      }
      
      setShowModal(false);
      setNuevaEspecialidad({ nombre: '' });
      fetchEspecialidades();
      
    } catch (err) {
      console.error('Error:', err);
      alert(`Error al ${currentEspecialidad ? 'actualizar' : 'crear'} la especialidad.`);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1>Gestión de Especialidades</h1>
        <div className="admin-header-buttons">
          <button className="btn-add-main" onClick={handleCreateEspecialidad}>
            Agregar especialidad
          </button>
        </div>
      </div>
      
      <AdminFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Buscar especialidad..."
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      {loading ? (
        <div className="loading-container">Cargando especialidades...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredEspecialidades.length === 0 ? (
        <div className="no-results">No se encontraron especialidades</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEspecialidades.map((especialidad) => (
                <tr key={especialidad.especialidad_id}>
                  <td>{especialidad.nombre}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action btn-edit" 
                      title="Editar"
                      onClick={() => handleEditEspecialidad(especialidad)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-action btn-delete" 
                      title="Eliminar"
                      onClick={() => handleDeleteEspecialidad(especialidad.especialidad_id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal para añadir/editar especialidad */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentEspecialidad ? "Editar especialidad" : "Agregar especialidad"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre de la especialidad</label>
                  <input
                    id="nombre"
                    type="text"
                    value={nuevaEspecialidad.nombre}
                    onChange={(e) => setNuevaEspecialidad({ ...nuevaEspecialidad, nombre: e.target.value })}
                    required
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit}>
                {currentEspecialidad ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EspecialidadesPage;
