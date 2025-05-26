import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import { UserPlusIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/20/solid';
import CrearUsuario from './CrearUsuario';
import EditarUsuario from './EditarUsuario';
import api, { auth } from '../../../api';
import './AdminUsuarios.css';

/**
 * AdminUsuarios component for managing users in the admin dashboard
 * Displays the list of users and allows filtering, sorting and adding new users
 * Only accessible to users with superadmin role
 */
const AdminUsuarios = () => {
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);

  // State for API data
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch users and roles on component mount
  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  // Check if user has superadmin role (after all hooks)
  const authenticatedUser = auth.getCurrentUser();
  const userRoles = authenticatedUser?.roles || [];
  const isSuperAdmin = userRoles.includes('superadmin');

  // If user is not superadmin, show access denied
  if (!isSuperAdmin) {
    return (
      <AdminLayout activePage="/admin/usuarios">
        <div className="admin-usuarios">
          <div className="admin-usuarios__access-denied">
            <h2>Acceso Denegado</h2>
            <p>Solo los usuarios con rol de superadmin pueden acceder a la administración de usuarios.</p>
            <p>Su rol actual: {userRoles.length > 0 ? userRoles.join(', ') : 'Sin roles asignados'}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-users');
      console.log('Usuarios obtenidos:', response.data);
      setUsuarios(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles');
      console.log('Roles obtenidos:', response.data);
      setRoles(response.data);
    } catch (err) {
      console.error('Error al obtener roles:', err);
    }
  };

  // Filter and sort users
  const filteredUsuarios = usuarios
    .filter(user => {
      // Filter by search term
      const matchesSearch = !searchTerm || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by active status
      const matchesStatus = showInactive || user.is_active;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const nameA = `${a.name || ''} ${a.last_name || ''}`.toLowerCase();
      const nameB = `${b.name || ''} ${b.last_name || ''}`.toLowerCase();
      
      if (sortAZ) {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

  // Handle user creation success
  const handleUserCreated = (newUser) => {
    setUsuarios(prev => [newUser, ...prev]);
    setShowAddUserModal(false);
  };

  // Handle user update success
  const handleUserUpdated = (updatedUser) => {
    setUsuarios(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setShowEditUserModal(false);
    setCurrentUser(null);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowEditUserModal(true);
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await api.delete(`/admin-users/${userId}`);
        setUsuarios(prev => prev.filter(user => user.id !== userId));
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        alert('Error al eliminar usuario');
      }
    }
  };

  // Format user roles for display
  const formatRoles = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return 'Sin roles';
    return userRoles.map(role => role.nombre_rol).join(', ');
  };

  // Get role color for tags
  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'superadmin':
        return 'red';
      case 'admin':
        return 'blue';
      case 'asistente':
        return 'green';
      case 'medico':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <AdminLayout activePage="/admin/usuarios">
      <div className="admin-usuarios">
        <div className="admin-usuarios__page-header">
          <div className="admin-usuarios__menu-header">
            <div className="admin-usuarios__text-strong">
              <div className="admin-usuarios__title">Usuarios y roles</div>
            </div>
          </div>
          <div className="admin-usuarios__button-group">
            <Button
              variant="primary"
              onClick={() => setShowAddUserModal(true)}
            >
              <UserPlusIcon className="btn__icon" />
              <span style={{ marginLeft: '.5rem' }}>Agregar nuevo usuario</span>
            </Button>
          </div>
        </div>
        
        <div className="admin-usuarios__filter-bar">
          <div className="admin-usuarios__search-container">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar por nombre, apellido o email"
              className="admin-usuarios__search-filter"
            />
          </div>
          
          <div className="admin-usuarios__filter-options">
            <div className="admin-usuarios__checkbox-field">
              <CheckboxField
                label="Mostrar inactivos"
                checked={showInactive}
                onChange={setShowInactive}
              />
            </div>
            
            <div className="admin-usuarios__tag-toggle-group">
              <div className={sortAZ ? "admin-usuarios__tag-toggle state-on" : "admin-usuarios__tag-toggle state-off"} onClick={() => setSortAZ(true)}>
                {sortAZ && <CheckIcon className="heroicons-mini-check" />}
                <div className="title">A → Z</div>
              </div>
              <div className={!sortAZ ? "admin-usuarios__tag-toggle state-on" : "admin-usuarios__tag-toggle state-off"} onClick={() => setSortAZ(false)}>
                {!sortAZ && <CheckIcon className="heroicons-mini-check" />}
                <div className="title">Z → A</div>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="admin-usuarios__loading">Cargando usuarios...</div>
        ) : error ? (
          <div className="admin-usuarios__error">{error}</div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="admin-usuarios__empty-state">
            <div className="admin-usuarios__empty-title">
              {searchTerm ? 'No se encontraron usuarios' : 'Aún no hay usuarios'}
            </div>
            <div className="admin-usuarios__empty-description">
              {searchTerm ? 
                'Intenta ajustar los filtros de búsqueda.' :
                'Agrega usuarios administradores para gestionar el sistema.'
              }
            </div>
          </div>
        ) : (
          <div className="admin-usuarios__body">
            <div className="admin-usuarios__table">
              <Table
                headers={[
                  "Nombre",
                  "Email", 
                  "Roles",
                  "Estado",
                  "Último acceso",
                  "Acciones"
                ]}
                data={filteredUsuarios}
                columns={["nombre", "email", "roles", "estado", "ultimo_acceso", "acciones"]}
                renderCustomCell={(row, column) => {
                  if (column === "nombre") {
                    return (
                      <div className="admin-usuarios__user-name">
                        <div className="admin-usuarios__name-primary">
                          {row.name} {row.last_name}
                        </div>
                      </div>
                    );
                  }
                  
                  if (column === "email") {
                    return (
                      <div className="admin-usuarios__email">
                        {row.email}
                      </div>
                    );
                  }
                  
                  if (column === "roles") {
                    return (
                      <div className="admin-usuarios__roles">
                        {row.roles && row.roles.length > 0 ? (
                          row.roles.map((role, index) => (
                            <Tag 
                              key={index}
                              label={role.nombre_rol}
                              scheme={getRoleColor(role.nombre_rol)}
                              size="small"
                            />
                          ))
                        ) : (
                          <span className="admin-usuarios__no-roles">Sin roles</span>
                        )}
                      </div>
                    );
                  }
                  
                  if (column === "estado") {
                    return (
                      <Tag 
                        label={row.is_active ? "Activo" : "Inactivo"}
                        scheme={row.is_active ? "success" : "neutral"}
                        size="small"
                      />
                    );
                  }
                  
                  if (column === "ultimo_acceso") {
                    return (
                      <div className="admin-usuarios__last-login">
                        {row.last_login ? 
                          new Date(row.last_login).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          'Nunca'
                        }
                      </div>
                    );
                  }
                  
                  if (column === "acciones") {
                    return (
                      <div className="admin-usuarios__actions">
                        <button
                          className="admin-usuarios__action-btn edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(row);
                          }}
                          title="Editar usuario"
                        >
                          <PencilIcon className="admin-usuarios__action-icon" />
                        </button>
                        
                        {row.roles && !row.roles.some(role => role.nombre_rol === 'superadmin') && (
                          <button
                            className="admin-usuarios__action-btn delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(row.id);
                            }}
                            title="Eliminar usuario"
                          >
                            <TrashIcon className="admin-usuarios__action-icon" />
                          </button>
                        )}
                      </div>
                    );
                  }
                  
                  return null;
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      <CrearUsuario 
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        roles={roles}
        onUserCreated={handleUserCreated}
      />
      
      {showEditUserModal && currentUser && (
        <EditarUsuario 
          usuario={currentUser}
          roles={roles}
          onClose={() => {
            setShowEditUserModal(false);
            setCurrentUser(null);
          }}
          onUpdate={handleUserUpdated}
        />
      )}
    </AdminLayout>
  );
};

export default AdminUsuarios;
