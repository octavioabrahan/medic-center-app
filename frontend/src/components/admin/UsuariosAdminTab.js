import React, { useState, useEffect } from "react";
import api, { auth } from "../../api"; // Cambiamos axios por nuestra instancia api configurada

function UsuariosAdminTab() {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  
  // Inicializar formData con valores por defecto para evitar problemas de input controlado/no controlado
  const defaultFormData = {
    email: "",
    name: "",
    last_name: "",
    password: "",
    roles: [], // Asegurarnos de inicializar siempre como array
    is_active: true
  };
  
  // Estado del formulario
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);
  
  // Efecto para reiniciar el formulario cuando cambia currentUser
  useEffect(() => {
    if (currentUser) {
      // Asegurarse de que todos los campos tengan valores definidos
      const userRoles = Array.isArray(currentUser.roles) 
        ? currentUser.roles.map(r => typeof r === 'object' ? r.id_rol : r) 
        : [];
        
      setFormData({
        email: currentUser.email || "",
        name: currentUser.name || "",
        last_name: currentUser.last_name || "",
        // No incluir password al editar un usuario existente
        roles: userRoles,
        is_active: currentUser.is_active !== false
      });
    } else {
      // Usar valores por defecto para un nuevo usuario
      setFormData({...defaultFormData});
    }
  }, [currentUser]);

  // Filtrar usuarios cuando cambia el término de búsqueda
  useEffect(() => {
    if (usuarios.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredUsuarios(usuarios);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = usuarios.filter(usuario => 
          usuario.email.toLowerCase().includes(term) ||
          `${usuario.name} ${usuario.last_name}`.toLowerCase().includes(term)
        );
        setFilteredUsuarios(filtered);
      }
    }
  }, [searchTerm, usuarios]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth"); // Usamos api en lugar de axios
      setUsuarios(response.data);
      setFilteredUsuarios(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los usuarios. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get("/roles"); // Usamos api en lugar de axios
      setAvailableRoles(response.data);
    } catch (err) {
      console.error('Error cargando roles:', err);
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
      try {
        await api.delete(`/auth/${userId}`); // Usamos api en lugar de axios
        fetchUsuarios();
      } catch (err) {
        console.error('Error eliminando usuario:', err);
        alert('Hubo un error al eliminar el usuario');
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      if (currentUser) {
        // Actualizar usuario existente
        await api.put(`/auth/${currentUser.id}`, formData); // Usamos api en lugar de axios
      } else {
        // Crear nuevo usuario
        await api.post("/auth", formData); // Usamos api en lugar de axios
      }
      setShowModal(false);
      fetchUsuarios();
    } catch (err) {
      console.error('Error guardando usuario:', err);
      alert('Hubo un error al guardar el usuario');
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRoleChange = (roleId) => {
    const currentRoles = Array.isArray(formData.roles) ? [...formData.roles] : [];
    
    if (currentRoles.includes(roleId)) {
      // Eliminar el rol si ya está seleccionado
      setFormData({
        ...formData,
        roles: currentRoles.filter(id => id !== roleId)
      });
    } else {
      // Añadir el rol si no está seleccionado
      setFormData({
        ...formData,
        roles: [...currentRoles, roleId]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveUser();
  };

  const renderUserForm = () => {
    return (
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="email">Correo electrónico *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Nombre *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="last_name">Apellido *</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
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
              value={formData.password}
              onChange={handleChange}
              required={!currentUser}
            />
            <small>La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial.</small>
          </div>
        )}

        <div className="form-group">
          <label>Roles</label>
          <div className="roles-checkboxes">
            {availableRoles.map(role => (
              <div key={role.id_rol} className="role-checkbox">
                <input
                  type="checkbox"
                  id={`role-${role.id_rol}`}
                  checked={Array.isArray(formData.roles) && formData.roles.includes(role.id_rol)}
                  onChange={() => handleRoleChange(role.id_rol)}
                />
                <label htmlFor={`role-${role.id_rol}`}>{role.nombre_rol}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <span className="checkbox-text">Usuario activo</span>
          </label>
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            {currentUser ? 'Actualizar' : 'Crear'} Usuario
          </button>
        </div>
      </form>
    );
  };

  const renderUsuariosTable = () => {
    if (loading) return <div className="loading">Cargando usuarios...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredUsuarios.length === 0) return <div className="no-results">No se encontraron usuarios</div>;

    // Obtener el usuario actual para verificar si puede eliminar otros usuarios
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.email}</td>
                <td>{usuario.name}</td>
                <td>{usuario.last_name}</td>
                <td>{usuario.roles?.map(r => typeof r === 'object' ? r.nombre_rol : r).join(', ')}</td>
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
                  {isSuperAdmin && usuario.id !== loggedUser.id && !usuario.roles?.includes('superadmin') && (
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
        <button className="btn-agregar" onClick={() => {
          setCurrentUser(null);
          setShowModal(true);
        }}>
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