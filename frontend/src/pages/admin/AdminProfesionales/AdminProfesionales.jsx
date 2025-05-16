import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import SelectField from '../../../components/Inputs/SelectField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import { UserPlusIcon, CheckIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import CrearEspecialidades from './CrearEspecialidades';
import './AdminProfesionales.css';

/**
 * AdminProfesionales component for managing professionals in the admin dashboard
 * Displays the list of professionals and allows filtering, sorting and adding new professionals
 */
const AdminProfesionales = () => {
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);

  // State for API data
  const [profesionales, setProfesionales] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [filteredProfesionales, setFilteredProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [showAddEspecialidadModal, setShowAddEspecialidadModal] = useState(false);
  const [showAddProfesionalModal, setShowAddProfesionalModal] = useState(false);
  const [showEditProfesionalModal, setShowEditProfesionalModal] = useState(false);
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false);
  const [currentProfesional, setCurrentProfesional] = useState(null);
  
  // Estado para el nuevo profesional
  const [nuevoProfesional, setNuevoProfesional] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    especialidad_id: '',
    servicios: []
  });
  
  // Estado para servicios y categorías
  const [servicios, setServicios] = useState([]);
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  // Fetch de profesionales y especialidades al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profesionalesRes, especialidadesRes] = await Promise.all([
          axios.get('/api/profesionales', { params: { soloActivos: !showArchived } }),
          axios.get('/api/especialidades')
        ]);
        
        setProfesionales(profesionalesRes.data);
        setEspecialidades(especialidadesRes.data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos. Por favor intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showArchived]);

  // Aplicar filtros y ordenamiento a la lista de profesionales
  useEffect(() => {
    if (profesionales.length > 0) {
      let filtered = [...profesionales];
      
      if (searchTerm) {
        const termLower = searchTerm.toLowerCase();
        filtered = filtered.filter(prof => 
          prof.nombre?.toLowerCase().includes(termLower) || 
          prof.apellido?.toLowerCase().includes(termLower) ||
          prof.cedula?.toLowerCase().includes(termLower)
        );
      }
      
      if (selectedEspecialidad) {
        filtered = filtered.filter(prof => prof.nombre_especialidad === selectedEspecialidad);
      }
      
      if (sortAZ) {
        filtered.sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`));
      } else {
        filtered.sort((a, b) => `${b.nombre} ${b.apellido}`.localeCompare(`${a.nombre} ${a.apellido}`));
      }
      
      setFilteredProfesionales(filtered);
    } else {
      setFilteredProfesionales([]);
    }
  }, [searchTerm, profesionales, selectedEspecialidad, showArchived, sortAZ]);

  // Cambiar estado activo/inactivo del profesional
  const cambiarEstadoProfesional = async (profesionalId, activo) => {
    try {
      await axios.put(`/api/profesionales/${profesionalId}/estado`, { activo });
      
      // Actualizar la lista después del cambio
      const res = await axios.get('/api/profesionales', { params: { soloActivos: !showArchived } });
      setProfesionales(res.data);
      
      // Cerrar modal si está abierto
      setShowConfirmArchiveModal(false);
      setCurrentProfesional(null);
    } catch (err) {
      console.error("Error al cambiar estado del profesional:", err);
      setError("Error al cambiar el estado del profesional");
    }
  };
  
  // Handle specialty creation from child component
  const handleSpecialtyCreated = (updatedEspecialidades) => {
    setEspecialidades(updatedEspecialidades);
  };

  // Crear nuevo profesional
  const handleCreateProfesional = async (e) => {
    e.preventDefault();
    
    if (!nuevoProfesional.cedula || 
        !nuevoProfesional.nombre || 
        !nuevoProfesional.apellido || 
        !nuevoProfesional.especialidad_id) {
      setError("Todos los campos obligatorios deben ser completados");
      return;
    }

    try {
      // 1. Crear profesional
      const res = await axios.post('/api/profesionales', nuevoProfesional);
      const profesionalId = res.data.profesional_id;
      
      // 2. Asignar servicios si existen
      if (serviciosSeleccionados.length > 0) {
        await axios.post('/api/profesionales/asignar-servicios', {
          profesional_id: profesionalId,
          servicios: serviciosSeleccionados
        });
      }
      
      // Actualizar lista de profesionales
      const updatedProfesionales = await axios.get('/api/profesionales', { 
        params: { soloActivos: !showArchived } 
      });
      setProfesionales(updatedProfesionales.data);
      
      // Limpiar formulario y cerrar modal
      setNuevoProfesional({
        cedula: '',
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        especialidad_id: '',
        servicios: []
      });
      setServiciosSeleccionados([]);
      setShowAddProfesionalModal(false);
    } catch (err) {
      console.error("Error al crear profesional:", err);
      setError(err.response?.data?.error || "Error al crear profesional");
    }
  };

  // Editar profesional
  const handleEditProfesional = (profesional) => {
    setCurrentProfesional(profesional);
    setShowEditProfesionalModal(true);
    
    // Cargar servicios del profesional si tiene
    if (profesional.servicios && Array.isArray(profesional.servicios)) {
      // Aquí se podría implementar la lógica para preseleccionar servicios
      // basándonos en la información que viene con el profesional
    }
  };
  
  // Actualizar profesional
  const handleUpdateProfesional = async (e) => {
    e.preventDefault();
    
    if (!currentProfesional.nombre || 
        !currentProfesional.apellido || 
        !currentProfesional.especialidad_id) {
      setError("Todos los campos obligatorios deben ser completados");
      return;
    }

    try {
      await axios.put(`/api/profesionales/${currentProfesional.profesional_id}`, {
        nombre: currentProfesional.nombre,
        apellido: currentProfesional.apellido,
        cedula: currentProfesional.cedula,
        telefono: currentProfesional.telefono,
        correo: currentProfesional.email,
        especialidad_id: currentProfesional.especialidad_id
      });
      
      // Actualizar servicios
      if (serviciosSeleccionados.length > 0) {
        await axios.post('/api/profesionales/asignar-servicios', {
          profesional_id: currentProfesional.profesional_id,
          servicios: serviciosSeleccionados
        });
      }
      
      // Actualizar lista
      const updatedProfesionales = await axios.get('/api/profesionales', { 
        params: { soloActivos: !showArchived } 
      });
      setProfesionales(updatedProfesionales.data);
      
      // Cerrar modal y limpiar estado
      setShowEditProfesionalModal(false);
      setCurrentProfesional(null);
      setServiciosSeleccionados([]);
    } catch (err) {
      console.error("Error al actualizar profesional:", err);
      setError("Error al actualizar el profesional");
    }
  };
  
  // Mostrar modal de confirmación para archivar
  const confirmarArchivarProfesional = (profesional) => {
    setCurrentProfesional(profesional);
    setShowConfirmArchiveModal(true);
    setShowEditProfesionalModal(false);
  };

  // Fetch de servicios para los modales
  useEffect(() => {
    if (showAddProfesionalModal || showEditProfesionalModal) {
      const fetchServicios = async () => {
        try {
          const res = await axios.get('/api/servicios');
          setServicios(res.data);
        } catch (err) {
          console.error("Error al cargar servicios:", err);
          setError("Error al cargar los servicios disponibles");
        }
      };
      
      fetchServicios();
    }
  }, [showAddProfesionalModal, showEditProfesionalModal]);

  // Cargar servicios del profesional cuando se edita
  useEffect(() => {
    if (showEditProfesionalModal && currentProfesional?.profesional_id) {
      const fetchServiciosProfesional = async () => {
        try {
          const res = await axios.get(`/api/profesionales/relaciones/${currentProfesional.profesional_id}`);
          setServiciosSeleccionados(res.data.servicios || []);
        } catch (err) {
          console.error("Error al cargar servicios del profesional:", err);
        }
      };
      
      fetchServiciosProfesional();
    }
  }, [showEditProfesionalModal, currentProfesional]);

  // Preparar los options para el dropdown de especialidades
  const especialidadesOptions = [
    { label: 'Todas las especialidades', value: '' },
    ...especialidades.map(esp => ({
      label: esp.nombre,
      value: esp.nombre
    }))
  ];

  // Modal para confirmar archivar profesional
  const renderConfirmArchiveModal = () => {
    if (!showConfirmArchiveModal || !currentProfesional) return null;

    return (
      <div className="admin-profesionales__modal-overlay">
        <div className="admin-profesionales__modal-content">
          <div className="admin-profesionales__modal-header">
            <h2>Confirmar acción</h2>
            <button className="admin-profesionales__close-btn" onClick={() => setShowConfirmArchiveModal(false)}>×</button>
          </div>
          <div className="admin-profesionales__modal-body">
            <p className="admin-profesionales__confirm-message">
              ¿Está seguro que desea archivar al profesional <strong>{currentProfesional.nombre} {currentProfesional.apellido}</strong>?
              <br />
              <small>El profesional no podrá recibir nuevas citas pero se mantendrán sus registros históricos.</small>
            </p>
          </div>
          <div className="admin-profesionales__modal-footer">
            <Button 
              variant="neutral" 
              onClick={() => setShowConfirmArchiveModal(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="danger"
              onClick={() => cambiarEstadoProfesional(currentProfesional.profesional_id, false)}
            >
              Sí, quiero archivar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Modal para añadir profesional
  const renderAddProfesionalModal = () => {
    if (!showAddProfesionalModal) return null;

    return (
      <div className="admin-profesionales__modal-overlay">
        <div className="admin-profesionales__modal-content">
          <div className="admin-profesionales__modal-header">
            <h2>Agregar Profesional</h2>
            <button className="admin-profesionales__close-btn" onClick={() => setShowAddProfesionalModal(false)}>×</button>
          </div>
          <div className="admin-profesionales__modal-body">
            <form onSubmit={handleCreateProfesional}>
              <div className="admin-profesionales__form-group">
                <label htmlFor="cedula">Cédula *</label>
                <input
                  id="cedula"
                  type="text"
                  value={nuevoProfesional.cedula}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, cedula: e.target.value })}
                  className="admin-profesionales__input"
                  required
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  type="text"
                  value={nuevoProfesional.nombre}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, nombre: e.target.value })}
                  className="admin-profesionales__input"
                  required
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="apellido">Apellido *</label>
                <input
                  id="apellido"
                  type="text"
                  value={nuevoProfesional.apellido}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, apellido: e.target.value })}
                  className="admin-profesionales__input"
                  required
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="text"
                  value={nuevoProfesional.telefono}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, telefono: e.target.value })}
                  className="admin-profesionales__input"
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="correo">Correo Electrónico</label>
                <input
                  id="correo"
                  type="email"
                  value={nuevoProfesional.correo}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, correo: e.target.value })}
                  className="admin-profesionales__input"
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="especialidad">Especialidad *</label>
                <select
                  id="especialidad"
                  value={nuevoProfesional.especialidad_id}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, especialidad_id: e.target.value })}
                  className="admin-profesionales__select"
                  required
                >
                  <option value="">Selecciona una especialidad</option>
                  {especialidades.map(esp => (
                    <option key={esp.especialidad_id} value={esp.especialidad_id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              {servicios.length > 0 && (
                <div className="admin-profesionales__form-group">
                  <label>Servicios</label>
                  <div className="admin-profesionales__servicios-list">
                    {servicios.map(servicio => (
                      <div key={servicio.id_servicio} className="admin-profesionales__servicio-item">
                        <input
                          type="checkbox"
                          id={`servicio-${servicio.id_servicio}`}
                          checked={serviciosSeleccionados.includes(servicio.id_servicio)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setServiciosSeleccionados([...serviciosSeleccionados, servicio.id_servicio]);
                            } else {
                              setServiciosSeleccionados(serviciosSeleccionados.filter(id => id !== servicio.id_servicio));
                            }
                          }}
                        />
                        <label htmlFor={`servicio-${servicio.id_servicio}`}>{servicio.nombre_servicio}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
          <div className="admin-profesionales__modal-footer">
            <Button variant="neutral" onClick={() => setShowAddProfesionalModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateProfesional}>
              Guardar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Modal para editar profesional
  const renderEditProfesionalModal = () => {
    if (!showEditProfesionalModal || !currentProfesional) return null;

    return (
      <div className="admin-profesionales__modal-overlay">
        <div className="admin-profesionales__modal-content">
          <div className="admin-profesionales__modal-header">
            <h2>Editar Profesional</h2>
            <button className="admin-profesionales__close-btn" onClick={() => setShowEditProfesionalModal(false)}>×</button>
          </div>
          <div className="admin-profesionales__modal-body">
            <form onSubmit={handleUpdateProfesional}>
              <div className="admin-profesionales__form-group">
                <label htmlFor="edit-cedula">Cédula *</label>
                <input
                  id="edit-cedula"
                  type="text"
                  value={currentProfesional.cedula || ''}
                  onChange={(e) => setCurrentProfesional({ ...currentProfesional, cedula: e.target.value })}
                  className="admin-profesionales__input"
                  required
                  disabled // La cédula no se debería modificar una vez creado
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="edit-nombre">Nombre *</label>
                <input
                  id="edit-nombre"
                  type="text"
                  value={currentProfesional.nombre || ''}
                  onChange={(e) => setCurrentProfesional({ ...currentProfesional, nombre: e.target.value })}
                  className="admin-profesionales__input"
                  required
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="edit-apellido">Apellido *</label>
                <input
                  id="edit-apellido"
                  type="text"
                  value={currentProfesional.apellido || ''}
                  onChange={(e) => setCurrentProfesional({ ...currentProfesional, apellido: e.target.value })}
                  className="admin-profesionales__input"
                  required
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="edit-telefono">Teléfono</label>
                <input
                  id="edit-telefono"
                  type="text"
                  value={currentProfesional.telefono || ''}
                  onChange={(e) => setCurrentProfesional({ ...currentProfesional, telefono: e.target.value })}
                  className="admin-profesionales__input"
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="edit-correo">Correo Electrónico</label>
                <input
                  id="edit-correo"
                  type="email"
                  value={currentProfesional.email || ''}
                  onChange={(e) => setCurrentProfesional({ ...currentProfesional, email: e.target.value })}
                  className="admin-profesionales__input"
                />
              </div>
              
              <div className="admin-profesionales__form-group">
                <label htmlFor="edit-especialidad">Especialidad *</label>
                <select
                  id="edit-especialidad"
                  value={currentProfesional.especialidad_id || ''}
                  onChange={(e) => setCurrentProfesional({ ...currentProfesional, especialidad_id: e.target.value })}
                  className="admin-profesionales__select"
                  required
                >
                  <option value="">Selecciona una especialidad</option>
                  {especialidades.map(esp => (
                    <option key={esp.especialidad_id} value={esp.especialidad_id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              {servicios.length > 0 && (
                <div className="admin-profesionales__form-group">
                  <label>Servicios</label>
                  <div className="admin-profesionales__servicios-list">
                    {servicios.map(servicio => (
                      <div key={servicio.id_servicio} className="admin-profesionales__servicio-item">
                        <input
                          type="checkbox"
                          id={`edit-servicio-${servicio.id_servicio}`}
                          checked={serviciosSeleccionados.includes(servicio.id_servicio)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setServiciosSeleccionados([...serviciosSeleccionados, servicio.id_servicio]);
                            } else {
                              setServiciosSeleccionados(serviciosSeleccionados.filter(id => id !== servicio.id_servicio));
                            }
                          }}
                        />
                        <label htmlFor={`edit-servicio-${servicio.id_servicio}`}>{servicio.nombre_servicio}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
          <div className="admin-profesionales__modal-footer">
            <Button 
              variant="danger" 
              onClick={() => confirmarArchivarProfesional(currentProfesional)}
            >
              Archivar profesional
            </Button>
            <div>
              <Button variant="neutral" onClick={() => setShowEditProfesionalModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleUpdateProfesional}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout activePage="/admin/profesionales">
      <div className="admin-profesionales">
        <div className="admin-profesionales__page-header">
          <div className="admin-profesionales__menu-header">
            <div className="admin-profesionales__text-strong">Profesionales</div>
          </div>
          <div className="admin-profesionales__button-group">
            <Button variant="neutral" onClick={() => setShowAddEspecialidadModal(true)}>
              Crear especialidad
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddProfesionalModal(true)}
            >
              <UserPlusIcon className="admin-profesionales__icon" />
              Agregar nuevo profesional
            </Button>
          </div>
        </div>
        
        <div className="admin-profesionales__filter-bar">
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre"
            className="admin-profesionales__search-filter"
          />
          
          <SelectField
            options={especialidadesOptions}
            value={selectedEspecialidad}
            onChange={setSelectedEspecialidad}
            className="admin-profesionales__select-field"
          />
          
          <div className="admin-profesionales__checkbox-field">
            <CheckboxField
              label="Mostrar archivados"
              checked={showArchived}
              onChange={setShowArchived}
            />
          </div>
          
          <div className="admin-profesionales__tag-toggle-group">
            <div className={sortAZ ? "admin-profesionales__tag-toggle state-on" : "admin-profesionales__tag-toggle state-off"} onClick={() => setSortAZ(true)}>
              {sortAZ && <CheckIcon className="heroicons-mini-check" />}
              <div className="title">A → Z</div>
            </div>
            <div className={!sortAZ ? "admin-profesionales__tag-toggle state-on" : "admin-profesionales__tag-toggle state-off"} onClick={() => setSortAZ(false)}>
              {!sortAZ && <CheckIcon className="heroicons-mini-check" />}
              <div className="title">Z → A</div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="admin-profesionales__loading">Cargando profesionales...</div>
        ) : error ? (
          <div className="admin-profesionales__error">{error}</div>
        ) : filteredProfesionales.length === 0 ? (
          <div className="admin-profesionales__empty-state">
            <div className="admin-profesionales__empty-title">
              Aún no has agregado profesionales
            </div>
            <div className="admin-profesionales__empty-description">
              Cada profesional debe tener una especialidad asignada y al menos un servicio activo para mostrarse en el sitio de agendamiento.
            </div>
          </div>
        ) : (
          <div className="admin-profesionales__table-container">
            <table className="admin-profesionales__table">
              <thead>
                <tr>
                  <th>Cédula</th>
                  <th>Profesional</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfesionales.map(profesional => (
                  <tr 
                    key={profesional.profesional_id}
                    className={profesional.is_active === false ? 'admin-profesionales__row-inactive' : ''}
                  >
                    <td>{profesional.cedula}</td>
                    <td>{profesional.nombre} {profesional.apellido}</td>
                    <td>{profesional.nombre_especialidad}</td>
                    <td>
                      <span className={`admin-profesionales__status-badge ${profesional.is_active ? 'admin-profesionales__status-active' : 'admin-profesionales__status-inactive'}`}>
                        {profesional.is_active ? 'Activo' : 'Archivado'}
                      </span>
                    </td>
                    <td>
                      {profesional.is_active ? (
                        <Button 
                          variant="subtle"
                          onClick={() => handleEditProfesional(profesional)}
                        >
                          <PencilIcon className="admin-profesionales__icon-small" />
                        </Button>
                      ) : (
                        <Button 
                          variant="subtle"
                          onClick={() => cambiarEstadoProfesional(profesional.profesional_id, true)}
                        >
                          <ArrowPathIcon className="admin-profesionales__icon-small" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CrearEspecialidades 
        isOpen={showAddEspecialidadModal} 
        onClose={() => setShowAddEspecialidadModal(false)} 
        onSpecialtyCreated={handleSpecialtyCreated}
      />
      {renderAddProfesionalModal()}
      {renderEditProfesionalModal()}
      {renderConfirmArchiveModal()}
    </AdminLayout>
  );
};

export default AdminProfesionales;
