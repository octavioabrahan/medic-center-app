import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../components/admin/AdminCommon.css"; // Importamos los estilos comunes

function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentRol, setCurrentRol] = useState(null);
  const [nuevoRol, setNuevoRol] = useState({ nombre_rol: "", descripcion: "" });

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filtrar roles cuando cambia el término de búsqueda
  useEffect(() => {
    if (roles.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredRoles(roles);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = roles.filter(rol => 
          rol.nombre_rol.toLowerCase().includes(term) ||
          (rol.descripcion && rol.descripcion.toLowerCase().includes(term))
        );
        setFilteredRoles(filtered);
      }
    }
  }, [searchTerm, roles]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/roles");
      setRoles(response.data);
      setFilteredRoles(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los roles. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRol = (rol) => {
    setCurrentRol(rol);
    setNuevoRol({ nombre_rol: rol.nombre_rol, descripcion: rol.descripcion || "" });
    setShowModal(true);
  };

  const handleCreateRol = () => {
    setCurrentRol(null);
    setNuevoRol({ nombre_rol: "", descripcion: "" });
    setShowModal(true);
  };

  const handleDeleteRol = async (rolId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este rol?')) {
      try {
        await axios.delete(`/api/roles/${rolId}`);
        fetchRoles();
      } catch (err) {
        console.error('Error eliminando rol:', err);
        alert('Hubo un error al eliminar el rol');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nuevoRol.nombre_rol.trim()) {
      alert('El nombre del rol es obligatorio');
      return;
    }

    try {
      if (currentRol) {
        // Actualizar rol existente
        await axios.put(`/api/roles/${currentRol.id_rol}`, nuevoRol);
      } else {
        // Crear nuevo rol
        await axios.post('/api/roles', nuevoRol);
      }
      
      setShowModal(false);
      setNuevoRol({ nombre_rol: "", descripcion: "" });
      fetchRoles();
      
    } catch (err) {
      console.error('Error:', err);
      alert(`Error al ${currentRol ? 'actualizar' : 'crear'} el rol.`);
    }
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Gestión de Roles</h1>
      
      <div className="admin-filters-bar">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <button className="btn-add" onClick={handleCreateRol}>
          Agregar rol
        </button>
      </div>
      
      {loading ? (
        <div className="loading-container">Cargando roles...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredRoles.length === 0 ? (
        <div className="no-results">No se encontraron roles</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoles.map((rol) => (
                <tr key={rol.id_rol}>
                  <td>{rol.nombre_rol}</td>
                  <td>{rol.descripcion || "Sin descripción"}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action btn-edit" 
                      title="Editar"
                      onClick={() => handleEditRol(rol)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-action btn-delete" 
                      title="Eliminar"
                      onClick={() => handleDeleteRol(rol.id_rol)}
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
      
      {/* Modal para añadir/editar rol */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentRol ? "Editar rol" : "Agregar rol"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre_rol">Nombre del rol</label>
                  <input
                    id="nombre_rol"
                    type="text"
                    value={nuevoRol.nombre_rol}
                    onChange={(e) => setNuevoRol({ ...nuevoRol, nombre_rol: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="descripcion">Descripción</label>
                  <textarea
                    id="descripcion"
                    value={nuevoRol.descripcion}
                    onChange={(e) => setNuevoRol({ ...nuevoRol, descripcion: e.target.value })}
                    rows={3}
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit}>
                {currentRol ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPage;
