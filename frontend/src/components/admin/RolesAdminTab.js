import React, { useState, useEffect } from "react";
import api from "../../api"; // Cambiamos axios por nuestra instancia api configurada
//import "./AdminComponents.css"; // Importamos los nuevos estilos específicos

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
      // Primero obtenemos todas las pantallas disponibles
      const screensResponse = await api.get("/screens");
      const allScreens = screensResponse.data;
      
      // Si hay un rol seleccionado, obtenemos sus permisos actuales
      if (currentRole && currentRole.id_rol) {
        try {
          const permissionsResponse = await api.get(`/role-screen-permissions/rol/${currentRole.id_rol}`);
          const rolePermissions = permissionsResponse.data;
          
          // Creamos un mapa de permisos por id_screen para rápida referencia
          const permissionsMap = {};
          rolePermissions.forEach(perm => {
            permissionsMap[perm.id_screen] = perm.can_view || false;
          });
          
          // Combinamos las pantallas con sus permisos
          const screensWithPermissions = allScreens.map(screen => ({
            ...screen,
            can_view: permissionsMap[screen.id_screen] || false
          }));
          
          setScreens(screensWithPermissions);
          setRoleScreens(rolePermissions);
        } catch (error) {
          console.error('Error al cargar permisos existentes:', error);
          // Si hay un error, inicializamos con todas las pantallas sin permisos
          setScreens(allScreens.map(screen => ({
            ...screen,
            can_view: false
          })));
          setRoleScreens([]);
        }
      } else {
        // Si no hay rol seleccionado, todas las pantallas inician sin permisos
        setScreens(allScreens.map(screen => ({
          ...screen,
          can_view: false
        })));
        setRoleScreens([]);
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
      alert('Por favor, guarde el rol primero antes de asignar permisos de pantallas.');
      return;
    }

    try {
      // Preparar los datos para enviar al servidor
      const permissionsData = {
        id_rol: currentRole.id_rol,
        pantallas: screens.map(screen => ({
          id_screen: screen.id_screen,
          can_view: screen.can_view || false
        })),
        created_by: 'admin' // Idealmente usar el usuario actual del sistema
      };

      // Enviar los permisos al servidor
      await api.post('/role-screen-permissions', permissionsData);
      
      // Mostrar confirmación y actualizar estado local
      alert('Permisos de pantallas actualizados correctamente');
      
      // Refrescar los permisos actualizados
      fetchRoleScreens(currentRole.id_rol);
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
          <button 
            type="button" 
            onClick={() => setShowModal(false)} 
            className="btn-cancel"
            style={{
              padding: '8px 16px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-save"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
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

    return (
      <div className="screen-permissions-form">
        <p className="permissions-info">
          Seleccione las pantallas a las que este rol tendrá acceso:
        </p>

        <div className="screens-list">
          {screens.map(screen => (
            <div key={screen.id_screen} className="admin-screen-item" style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div 
                  onClick={() => handleScreenPermissionChange(screen.id_screen, !screen.can_view)}
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    width: '18px',
                    height: '18px',
                    marginRight: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    id={`screen-${screen.id_screen}`}
                    checked={screen.can_view || false}
                    onChange={(e) => handleScreenPermissionChange(screen.id_screen, e.target.checked)}
                    style={{
                      position: 'absolute',
                      opacity: '0',
                      cursor: 'pointer',
                      height: '0',
                      width: '0'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    height: '18px',
                    width: '18px',
                    backgroundColor: 'white',
                    border: '2px solid #4a5568',
                    borderRadius: '3px',
                    display: 'block',
                    boxSizing: 'border-box'
                  }}></span>
                  {screen.can_view && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#3182ce',
                      borderRadius: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ 
                        color: 'white', 
                        fontSize: '10px', 
                        fontWeight: 'bold',
                        lineHeight: '1'
                      }}>✓</span>
                    </span>
                  )}
                </div>
                <label 
                  htmlFor={`screen-${screen.id_screen}`}
                  onClick={() => handleScreenPermissionChange(screen.id_screen, !screen.can_view)}
                  style={{ 
                    cursor: 'pointer',
                    userSelect: 'none',
                    display: 'inline-block',
                    fontSize: '14px'
                  }}
                >
                  {screen.name}
                </label>
              </div>
            </div>
          ))}
        </div>

        {screens.length === 0 && 
          <div className="no-screens-message">
            No hay pantallas disponibles para asignar permisos.
          </div>
        }

        <div className="form-buttons">
          <button 
            type="button" 
            onClick={() => setActiveTab('info')} 
            className="btn-cancel"
            style={{
              padding: '8px 16px',
              backgroundColor: '#e2e8f0',
              color: '#4a5568',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            Volver
          </button>
          <button 
            type="button" 
            onClick={handleSavePermissions} 
            className="btn-save"
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
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