import React, { useState, useEffect } from "react";
import api, { auth } from "../../api";

// Componente principal para la administración de usuarios
function UsuariosAdminTab() {
  // Estado para la lista de usuarios y filtrado
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para el modal y la edición
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);

  // Formulario con valores iniciales consistentes
  const initialFormState = {
    email: "",
    name: "",
    last_name: "",
    password: "",
    roles: [],
    is_active: true
  };
  
  const [formData, setFormData] = useState({...initialFormState});

  // Cargar los usuarios y roles al inicio
  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (!usuarios.length) return;
    
    if (!searchTerm.trim()) {
      setFilteredUsuarios([...usuarios]);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = usuarios.filter(usuario => 
        usuario.email?.toLowerCase().includes(term) ||
        (usuario.name + " " + usuario.last_name)?.toLowerCase().includes(term)
      );
      setFilteredUsuarios(filtered);
    }
  }, [searchTerm, usuarios]);

  // Función para cargar usuarios
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth");
      setUsuarios(response.data || []);
      setFilteredUsuarios(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar roles
  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles");
      setAvailableRoles(response.data || []);
    } catch (err) {
      console.error('Error cargando roles:', err);
    }
  };

  // Manejo de apertura del modal para crear usuario
  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({...initialFormState});
    setShowModal(true);
  };

  // Manejo de apertura del modal para editar usuario
  const handleEditUser = (user) => {
    // Procesar los roles para asegurarnos que sean un array de IDs
    const processedRoles = Array.isArray(user.roles)
      ? user.roles.map(role => typeof role === 'object' ? role.id_rol : role)
      : [];

    setCurrentUser(user);
    
    // Establecer los valores del formulario sin incluir contraseña para edición
    setFormData({
      email: user.email || "",
      name: user.name || "",
      last_name: user.last_name || "",
      roles: processedRoles,
      is_active: user.is_active !== false
    });
    
    setShowModal(true);
  };

  // Manejo de cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejo de cambios en los roles (radio buttons en lugar de checkboxes)
  const handleRoleChange = (roleId) => {
    setFormData(prev => ({
      ...prev,
      roles: [roleId] // Asignar un único rol seleccionado
    }));
  };

  // Función para guardar un usuario (crear o actualizar)
  const handleSaveUser = async (e) => {
    e.preventDefault();
    
    // Validación simple
    if (!formData.email || !formData.name || !formData.last_name) {
      alert("Por favor complete todos los campos requeridos");
      return;
    }
    
    // Validar que al menos un rol esté seleccionado
    if (!formData.roles.length) {
      alert("Debe seleccionar un rol para el usuario");
      return;
    }
    
    // Validar que se ingresó una contraseña para usuarios nuevos
    if (!currentUser && !formData.password) {
      alert("Debe ingresar una contraseña para el nuevo usuario");
      return;
    }

    try {
      console.log("Datos que se envían al servidor:", JSON.stringify(formData, null, 2));
      
      if (currentUser) {
        // Actualizar usuario existente
        console.log(`Actualizando usuario ${currentUser.id}...`);
        const response = await api.put(`/auth/${currentUser.id}`, formData);
        console.log("Respuesta del servidor (actualización):", response.data);
      } else {
        // Crear nuevo usuario
        console.log("Creando nuevo usuario...");
        const response = await api.post("/auth", formData);
        console.log("Respuesta del servidor (creación):", response.data);
      }
      
      // Cerrar modal y refrescar la lista
      setShowModal(false);
      fetchUsuarios();
    } catch (err) {
      console.error('Error detallado al guardar usuario:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        formData: formData
      });
      
      // Mostrar un mensaje más informativo basado en el error
      const errorMessage = err.response?.data?.error || 
                          (err.response?.status === 409 ? 'El correo ya está registrado' : 
                           err.response?.status === 400 ? 'Datos inválidos' : 
                           'Error desconocido al guardar el usuario');
      
      alert(`Error: ${errorMessage}. Por favor revise los datos e intente nuevamente.`);
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Está seguro que desea eliminar este usuario?')) return;
    
    try {
      await api.delete(`/auth/${userId}`);
      fetchUsuarios();
    } catch (err) {
      console.error('Error eliminando usuario:', err);
      alert('Error al eliminar el usuario');
    }
  };

  // Renderizado del formulario de usuario
  const renderUserForm = () => (
    <form onSubmit={handleSaveUser} className="user-form">
      <div className="form-group">
        <label htmlFor="email">Correo electrónico *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email || ""}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="name">Nombre *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ""}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="last_name">Apellido *</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name || ""}
          onChange={handleInputChange}
          required
        />
      </div>

      {!currentUser && (
        <div className="form-group">
          <label htmlFor="password">Contraseña *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password || ""}
            onChange={handleInputChange}
            required={!currentUser}
          />
          <small>La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.</small>
        </div>
      )}

      <div className="form-group">
        <label>Roles *</label>
        <div style={{ marginTop: '10px' }}>
          {availableRoles.map(role => (
            <div key={role.id_rol} style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <div 
                onClick={() => handleRoleChange(role.id_rol)}
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
                  type="radio"
                  id={`role-${role.id_rol}`}
                  name="user-role"
                  checked={formData.roles?.includes(role.id_rol) || false}
                  onChange={() => handleRoleChange(role.id_rol)}
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
                  borderRadius: '50%',
                  display: 'block',
                  boxSizing: 'border-box'
                }}></span>
                {formData.roles?.includes(role.id_rol) && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: '#3182ce',
                    display: 'block'
                  }}></span>
                )}
              </div>
              <label 
                htmlFor={`role-${role.id_rol}`} 
                onClick={() => handleRoleChange(role.id_rol)}
                style={{ 
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'inline-block'
                }}
              >
                {role.nombre_rol}
              </label>
            </div>
          ))}
        </div>
        {!availableRoles.length && <p>Cargando roles...</p>}
      </div>

      <div className="form-group">
        <label className="checkbox-container">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active || false}
            onChange={handleInputChange}
          />
          <span className="checkbox-text">Usuario activo</span>
        </label>
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
          {currentUser ? 'Actualizar' : 'Crear'} Usuario
        </button>
      </div>
    </form>
  );

  // Renderizado de la tabla de usuarios
  const renderUsuariosTable = () => {
    if (loading) return <div className="loading">Cargando usuarios...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!filteredUsuarios.length) return <div className="no-results">No se encontraron usuarios</div>;

    // Obtener el usuario actual para verificar permisos
    const loggedUser = auth.getCurrentUser();
    const isSuperAdmin = loggedUser?.roles?.includes('superadmin');

    return (
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Correo electrónico</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Roles</th>
              <th>Estado</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map(usuario => (
              <tr key={usuario.id}>
                <td>{usuario.email}</td>
                <td>{usuario.name}</td>
                <td>{usuario.last_name}</td>
                <td>
                  {Array.isArray(usuario.roles) 
                    ? usuario.roles
                        .map(r => typeof r === 'object' ? r.nombre_rol : r)
                        .join(', ')
                    : ''}
                </td>
                <td>{usuario.is_active ? 'Activo' : 'Inactivo'}</td>
                <td>{usuario.last_login ? new Date(usuario.last_login).toLocaleString() : 'Nunca'}</td>
                <td className="actions-cell">
                  <button 
                    className="btn-action btn-edit" 
                    title="Editar"
                    onClick={() => handleEditUser(usuario)}
                  >
                    <span className="icon-edit">✏️</span>
                  </button>
                  
                  {/* Solo permitir eliminar si el usuario es superadmin y no se está intentando eliminar a sí mismo */}
                  {isSuperAdmin && 
                   usuario.id !== loggedUser.id && 
                   !usuario.roles?.includes('superadmin') && (
                    <button 
                      className="btn-action btn-delete" 
                      title="Eliminar"
                      onClick={() => handleDeleteUser(usuario.id)}
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

  // Renderizado del componente principal
  return (
    <div>
      <div className="admin-actions">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="btn-agregar" onClick={handleAddUser}>
          <span className="icon-plus">+</span> Agregar usuario
        </button>
      </div>
      
      {renderUsuariosTable()}
      
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>{currentUser ? "Editar usuario" : "Agregar usuario"}</h2>
              <button className="admin-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              {renderUserForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosAdminTab;