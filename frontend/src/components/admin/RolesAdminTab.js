import React, { useState, useEffect } from "react";
import api from "../../api"; // Cambiamos axios por nuestra instancia api configurada

function RolesAdminTab() {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentRole, setCurrentRole] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' o 'pantallas'
  const [screens, setScreens] = useState([]);
  const [roleScreens, setRoleScreens] = useState([]);
  const [loadingScreens, setLoadingScreens] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_rol: "",
    descripcion: ""
  });

  useEffect(() => {
    fetchRoles();
  }, []);
  
  // Actualizar el formulario cuando cambia el rol seleccionado
  useEffect(() => {
    if (currentRole) {
      setFormData({
        nombre_rol: currentRole.nombre_rol || "",
        descripcion: currentRole.descripcion || ""
      });
      // Si estamos editando un rol, cargar sus pantallas asignadas
      if (currentRole.id_rol) {
        fetchRoleScreens(currentRole.id_rol);
      }
    } else {
      setFormData({
        nombre_rol: "",
        descripcion: ""
      });
      setRoleScreens([]);
    }
  }, [currentRole]);

  // Cargar todas las pantallas disponibles
  useEffect(() => {
    if (showModal && activeTab === 'pantallas') {
      fetchScreens();
    }
  }, [showModal, activeTab]);

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
      const response = await api.get("/roles"); // Usamos api en lugar de axios
      setRoles(response.data);
      setFilteredRoles(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los roles. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar todas las pantallas disponibles en el sistema
  const fetchScreens = async () => {
    setLoadingScreens(true);
    try {
      const response = await api.get("/screens");
      // Combinar con los permisos existentes
      if (currentRole && currentRole.id_rol) {
        try {
          const permissionsResponse = await api.get(`/role-screen-permissions/rol/${currentRole.id_rol}`);
          const rolePermissions = permissionsResponse.data;
          
          // Crear un mapa de permisos por id_screen
          const permissionsMap = {};
          rolePermissions.forEach(perm => {
            permissionsMap[perm.id_screen] = perm.can_view;
          });
          
          // Aplicar los permisos al listado de pantallas
          const screensWithPermissions = response.data.map(screen => ({
            ...screen,
            can_view: permissionsMap[screen.id_screen] || false
          }));
          
          setScreens(screensWithPermissions);
        } catch (error) {
          // Si no hay permisos, simplemente usar las pantallas sin permisos
          setScreens(response.data.map(screen => ({
            ...screen,
            can_view: false
          })));
        }
      } else {
        // Si no hay rol seleccionado, inicializar todas las pantallas sin permisos
        setScreens(response.data.map(screen => ({
          ...screen,
          can_view: false
        })));
      }
    } catch (err) {
      console.error('Error al cargar pantallas:', err);
      alert('Error al cargar las pantallas disponibles');
    } finally {
      setLoadingScreens(false);
    }
  };

  // Cargar los permisos de pantalla asignados a un rol específico
  const fetchRoleScreens = async (roleId) => {
    setLoadingScreens(true);
    try {
      const response = await api.get(`/role-screen-permissions/rol/${roleId}`);
      setRoleScreens(response.data);
    } catch (err) {
      console.error('Error al cargar permisos de pantallas:', err);
      // Si no hay permisos asignados, simplemente inicializamos vacío
      setRoleScreens([]);
    } finally {
      setLoadingScreens(false);
    }
  };

  const handleEditRole = (role) => {
    setCurrentRole(role);
    setActiveTab('info'); // Mostrar la pestaña de información por defecto
    setShowModal(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este rol? Esta acción podría afectar a los usuarios que lo tienen asignado.')) {
      try {
        await api.delete(`/roles/${roleId}`); // Usamos api en lugar de axios
        fetchRoles();
      } catch (err) {
        console.error('Error eliminando rol:', err);
        alert('Hubo un error al eliminar el rol');
      }
    }
  };

  const handleSaveRole = async () => {
    try {
      if (currentRole) {
        // Actualizar rol existente
        await api.put(`/roles/${currentRole.id_rol}`, formData); // Usamos api en lugar de axios
      } else {
        // Crear nuevo rol
        await api.post("/roles", formData); // Usamos api en lugar de axios
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      console.error('Error guardando rol:', err);
      alert('Hubo un error al guardar el rol');
    }
  };

  const handleSavePermissions = async () => {
    if (!currentRole || !currentRole.id_rol) {
      alert('Por favor, guarda el rol primero antes de asignar permisos de pantallas.');
      return;
    }

    try {
      const permissionsData = {
        id_rol: currentRole.id_rol,
        pantallas: screens.map(screen => ({
          id_screen: screen.id_screen,
          can_view: screen.can_view || false
        })),
        created_by: 'admin' // Idealmente usar el usuario actual
      };

      await api.post('/role-screen-permissions', permissionsData);
      alert('Permisos de pantallas actualizados correctamente');
    } catch (err) {
      console.error('Error guardando permisos:', err);
      alert('Error al guardar los permisos de pantallas');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleScreenPermissionChange = (screenId, checked) => {
    // Actualizar el estado de pantallas con la nueva selección
    setScreens(prevScreens => 
      prevScreens.map(screen => 
        screen.id_screen === screenId 
          ? { ...screen, can_view: checked }
          : screen
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveRole();
  };

  const renderRoleForm = () => {
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

  const renderScreenPermissionsForm = () => {
    if (loadingScreens) {
      return <div className="loading">Cargando pantallas...</div>;
    }

    const assignedScreensMap = {};
    roleScreens.forEach(item => {
      assignedScreensMap[item.id_screen] = { can_view: item.can_view };
    });

    // Combinar y actualizar las pantallas con sus permisos asignados
    const screensWithPermissions = screens.map(screen => ({
      ...screen,
      can_view: assignedScreensMap[screen.id_screen]?.can_view || false
    }));

    return (
      <div className="screen-permissions-form">
        <p className="permissions-info">
          Seleccione las pantallas a las que este rol tendrá acceso:
        </p>

        <div className="screens-list">
          {screensWithPermissions.map(screen => (
            <div key={screen.id_screen} className="screen-item">
              <label className="screen-label">
                <input
                  type="checkbox"
                  checked={screen.can_view}
                  onChange={(e) => handleScreenPermissionChange(screen.id_screen, e.target.checked)}
                />
                <span className="screen-name">{screen.name}</span>
              </label>
            </div>
          ))}
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => setActiveTab('info')} className="btn-cancel">
            Volver
          </button>
          <button type="button" onClick={handleSavePermissions} className="btn-save">
            Guardar Permisos
          </button>
        </div>
      </div>
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
            <div className="admin-modal-tabs">
              <button
                className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                Información
              </button>
              {currentRole && currentRole.id_rol && (
                <button
                  className={`tab-button ${activeTab === 'pantallas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('pantallas')}
                >
                  Permisos de Pantallas
                </button>
              )}
            </div>
            <div className="admin-modal-body">
              {activeTab === 'info' ? renderRoleForm() : renderScreenPermissionsForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesAdminTab;