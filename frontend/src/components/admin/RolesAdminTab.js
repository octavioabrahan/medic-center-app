import React, { useState, useEffect } from "react";
import axios from "axios";

function RolesAdminTab() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentRole, setCurrentRole] = useState(null);

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
        const filtered = roles.filter(role => 
          role.nombre_rol.toLowerCase().includes(term) ||
          role.descripcion?.toLowerCase().includes(term)
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

  const handleEditRole = (role) => {
    setCurrentRole(role);
    setShowModal(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este rol? Esta acción podría afectar a los usuarios que lo tienen asignado.')) {
      try {
        await axios.delete(`/api/roles/${roleId}`);
        fetchRoles();
      } catch (err) {
        console.error('Error eliminando rol:', err);
        alert('Hubo un error al eliminar el rol');
      }
    }
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (currentRole) {
        // Actualizar rol existente
        await axios.put(`/api/roles/${currentRole.id_rol}`, roleData);
      } else {
        // Crear nuevo rol
        await axios.post("/api/roles", roleData);
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      console.error('Error guardando rol:', err);
      alert('Hubo un error al guardar el rol');
    }
  };

  const renderRoleForm = () => {
    const initialData = currentRole ? {
      nombre_rol: currentRole.nombre_rol,
      descripcion: currentRole.descripcion || "",
    } : {
      nombre_rol: "",
      descripcion: "",
    };

    const [formData, setFormData] = useState(initialData);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSaveRole(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="role-form">
        <div className="form-group">
          <label htmlFor="nombre_rol">Nombre del Rol *</label>
          <input
            type="text"
            id="nombre_rol"
            name="nombre_rol"
            value={formData.nombre_rol}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            {currentRole ? 'Actualizar' : 'Crear'} Rol
          </button>
        </div>
      </form>
    );
  };

  const renderRolesTable = () => {
    if (loading) return <div className="loading">Cargando roles...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredRoles.length === 0) return <div className="no-results">No se encontraron roles</div>;

    return (
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre del Rol</th>
              <th>Descripción</th>
              <th>Usuarios Asignados</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredRoles.map((role) => (
              <tr key={role.id_rol}>
                <td>{role.nombre_rol}</td>
                <td>{role.descripcion || 'Sin descripción'}</td>
                <td>{role.usuarios_count || 0}</td>
                <td className="actions-cell">
                  <button 
                    className="btn-action btn-edit" 
                    title="Editar"
                    onClick={() => handleEditRole(role)}
                  >
                    <span className="icon-edit">✏️</span>
                  </button>
                  
                  {/* No permitir eliminar roles críticos del sistema como superadmin */}
                  {!['superadmin', 'admin'].includes(role.nombre_rol) && (
                    <button 
                      className="btn-action btn-delete" 
                      title="Eliminar"
                      onClick={() => handleDeleteRole(role.id_rol)}
                    >
                      <span className="icon-delete">🗑️</span>
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
    <div>
      <div className="admin-actions">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="btn-agregar" onClick={() => {
          setCurrentRole(null);
          setShowModal(true);
        }}>
          <span className="icon-plus">+</span> Agregar rol
        </button>
      </div>
      
      {renderRolesTable()}
      
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>{currentRole ? "Editar rol" : "Agregar rol"}</h2>
              <button className="admin-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              {renderRoleForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesAdminTab;