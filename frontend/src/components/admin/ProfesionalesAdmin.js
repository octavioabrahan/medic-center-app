import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfesionalesAdmin.css';
import './AdminCommon.css'; // Importamos los estilos comunes
import AdminFilterBar from './AdminFilterBar'; // Importamos el nuevo componente

function ProfesionalesAdmin() {
  // Estados para datos
  const [profesionales, setProfesionales] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfesionales, setFilteredProfesionales] = useState([]);
  const [especialidadFiltro, setEspecialidadFiltro] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortOrder, setSortOrder] = useState('az');

  // Estados para modales
  const [showAddEspecialidadModal, setShowAddEspecialidadModal] = useState(false);
  const [showAddProfesionalModal, setShowAddProfesionalModal] = useState(false);
  const [showEditProfesionalModal, setShowEditProfesionalModal] = useState(false);
  const [showConfirmArchiveModal, setShowConfirmArchiveModal] = useState(false);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: '' });
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
          // Siempre obtenemos todos los profesionales (activos e inactivos)
          axios.get(`/api/profesionales?soloActivos=false`),
          axios.get('/api/especialidades')
        ]);
        
        setProfesionales(profesionalesRes.data);
        setFilteredProfesionales(profesionalesRes.data);
        setEspecialidades(especialidadesRes.data);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros y ordenamiento a la lista de profesionales
  useEffect(() => {
    if (profesionales.length > 0) {
      let results = [...profesionales];
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        results = results.filter(profesional =>
          `${profesional.nombre} ${profesional.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profesional.cedula?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filtrar por especialidad
      if (especialidadFiltro) {
        results = results.filter(
          profesional => profesional.nombre_especialidad === especialidadFiltro
        );
      }
      
      // Filtrar por estado (archivado/activo)
      if (!showArchived) {
        results = results.filter(profesional => profesional.is_active);
      }
      
      // Aplicar ordenamiento
      switch (sortOrder) {
        case 'az':
          results = [...results].sort((a, b) => 
            `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)
          );
          break;
        case 'za':
          results = [...results].sort((a, b) => 
            `${b.nombre} ${b.apellido}`.localeCompare(`${a.nombre} ${a.apellido}`)
          );
          break;
        default:
          break;
      }
      
      setFilteredProfesionales(results);
    }
  }, [searchTerm, profesionales, especialidadFiltro, showArchived, sortOrder]);

  // Fetch de servicios para los modales
  useEffect(() => {
    if (showAddProfesionalModal || showEditProfesionalModal) {
      const fetchServicios = async () => {
        try {
          const response = await axios.get('/api/servicios');
          setServicios(response.data);
        } catch (err) {
          console.error('Error al cargar servicios:', err);
        }
      };
      
      fetchServicios();
    }
  }, [showAddProfesionalModal, showEditProfesionalModal]);

  // Cargar servicios del profesional cuando se edita
  useEffect(() => {
    if (showEditProfesionalModal && currentProfesional?.profesional_id) {
      const fetchProfesionalServicios = async () => {
        try {
          const response = await axios.get(`/api/profesionales/relaciones/${currentProfesional.profesional_id}`);
          setServiciosSeleccionados(response.data.servicios || []);
        } catch (err) {
          console.error('Error al cargar servicios del profesional:', err);
        }
      };
      
      fetchProfesionalServicios();
    }
  }, [showEditProfesionalModal, currentProfesional]);

  // Cambiar estado activo/inactivo del profesional
  const cambiarEstadoProfesional = async (profesionalId, activo) => {
    try {
      await axios.put(`/api/profesionales/estado/${profesionalId}`, { activo });
      
      // Actualizar la lista de profesionales (siempre mostrando todos)
      const response = await axios.get(`/api/profesionales?soloActivos=false`);
      setProfesionales(response.data);
      setFilteredProfesionales(response.data);
      
      // Si estamos en el modal de edición, cerrarlo
      if (showEditProfesionalModal) {
        setShowEditProfesionalModal(false);
      }
      
      // Si estamos en el modal de confirmación, cerrarlo
      if (showConfirmArchiveModal) {
        setShowConfirmArchiveModal(false);
      }
      
      setCurrentProfesional(null);
      
    } catch (err) {
      console.error('Error al cambiar el estado del profesional:', err);
      alert('Error al cambiar el estado del profesional. Por favor, intenta de nuevo.');
    }
  };

  // Mostrar modal de confirmación para archivar
  const confirmarArchivarProfesional = () => {
    setShowConfirmArchiveModal(true);
    setShowEditProfesionalModal(false);
  };

  // Crear nueva especialidad
  const handleCreateEspecialidad = async (e) => {
    e.preventDefault();
    if (!nuevaEspecialidad.nombre.trim()) {
      alert('El nombre de la especialidad es obligatorio');
      return;
    }

    try {
      await axios.post('/api/especialidades', nuevaEspecialidad);
      const response = await axios.get('/api/especialidades');
      setEspecialidades(response.data);
      setShowAddEspecialidadModal(false);
      setNuevaEspecialidad({ nombre: '' });
    } catch (err) {
      console.error('Error al crear especialidad:', err);
      alert('Error al crear la especialidad. Por favor, intenta de nuevo.');
    }
  };

  // Crear nuevo profesional
  const handleCreateProfesional = async (e) => {
    e.preventDefault();
    
    if (!nuevoProfesional.cedula || 
        !nuevoProfesional.nombre || 
        !nuevoProfesional.apellido || 
        !nuevoProfesional.especialidad_id) {
      alert('Los campos Cédula, Nombre, Apellido y Especialidad son obligatorios');
      return;
    }

    try {
      // 1. Crear el profesional
      await axios.post('/api/profesionales', {
        cedula: nuevoProfesional.cedula,
        nombre: nuevoProfesional.nombre,
        apellido: nuevoProfesional.apellido,
        especialidad_id: nuevoProfesional.especialidad_id,
        telefono: nuevoProfesional.telefono,
        correo: nuevoProfesional.correo
      });

      // Actualizar la lista de profesionales (siempre mostrando todos)
      const updatedProfesionales = await axios.get(`/api/profesionales?soloActivos=false`);
      setProfesionales(updatedProfesionales.data);
      setFilteredProfesionales(updatedProfesionales.data);
      
      // Cerrar modal y resetear formulario
      setShowAddProfesionalModal(false);
      setNuevoProfesional({
        cedula: '',
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        especialidad_id: '',
        servicios: []
      });

      // Mostrar mensaje de éxito
      const messageElement = document.querySelector('.profesional-agregado-message');
      if (messageElement) {
        messageElement.style.display = 'block';
        setTimeout(() => {
          messageElement.style.display = 'none';
        }, 3000);
      }
      
    } catch (err) {
      console.error('Error al crear profesional:', err);
      alert('Error al crear el profesional. Por favor, intenta de nuevo.');
    }
  };

  // Editar profesional
  const handleEditProfesional = (profesional) => {
    setCurrentProfesional(profesional);
    setShowEditProfesionalModal(true);
  };

  // Guardar edición de profesional
  const handleUpdateProfesional = async (e) => {
    e.preventDefault();
    
    if (!currentProfesional.nombre || 
        !currentProfesional.apellido || 
        !currentProfesional.especialidad_id) {
      alert('Los campos Nombre, Apellido y Especialidad son obligatorios');
      return;
    }

    try {
      // 1. Actualizar datos básicos del profesional
      await axios.put(`/api/profesionales/${currentProfesional.profesional_id}`, {
        nombre: currentProfesional.nombre,
        apellido: currentProfesional.apellido,
        especialidad_id: currentProfesional.especialidad_id,
        telefono: currentProfesional.telefono,
        correo: currentProfesional.correo
      });

      // 2. Actualizar servicios del profesional
      await axios.post("/api/profesionales/asignar-servicios", {
        profesional_id: currentProfesional.profesional_id,
        servicios: serviciosSeleccionados
      });

      // Actualizar la lista de profesionales (siempre mostrando todos)
      const updatedProfesionales = await axios.get(`/api/profesionales?soloActivos=false`);
      setProfesionales(updatedProfesionales.data);
      setFilteredProfesionales(updatedProfesionales.data);
      
      // Cerrar modal
      setShowEditProfesionalModal(false);
      setCurrentProfesional(null);
      setServiciosSeleccionados([]);
      
    } catch (err) {
      console.error('Error al actualizar profesional:', err);
      alert('Error al actualizar el profesional. Por favor, intenta de nuevo.');
    }
  };

  // Modal para añadir especialidad
  const renderAddEspecialidadModal = () => {
    if (!showAddEspecialidadModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Crear especialidad</h2>
            <button className="close-btn" onClick={() => setShowAddEspecialidadModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleCreateEspecialidad}>
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
            <button type="button" className="btn-secondary" onClick={() => setShowAddEspecialidadModal(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-primary" onClick={handleCreateEspecialidad}>
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Modal para confirmar archivar profesional
  const renderConfirmArchiveModal = () => {
    if (!showConfirmArchiveModal || !currentProfesional) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content-confirm">
          <div className="modal-header">
            <h2>Confirmar acción</h2>
            <button className="close-btn" onClick={() => setShowConfirmArchiveModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <p className="confirm-message">
              ¿Está seguro que desea archivar al profesional <strong>{currentProfesional.nombre} {currentProfesional.apellido}</strong>?
              <br />
              <small>El profesional no podrá recibir nuevas citas pero se mantendrán sus registros históricos.</small>
            </p>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancelar" 
                onClick={() => {
                  setShowConfirmArchiveModal(false);
                  setShowEditProfesionalModal(true);
                }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-archivar"
                onClick={() => cambiarEstadoProfesional(currentProfesional.profesional_id, false)}
              >
                Confirmar archivo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal para añadir profesional
  const renderAddProfesionalModal = () => {
    if (!showAddProfesionalModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content-profesionales">
          <div className="modal-header">
            <h2>Agregar nuevo profesional</h2>
            <button className="close-btn" onClick={() => setShowAddProfesionalModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleCreateProfesional}>
              <div className="form-group">
                <label htmlFor="cedula">Cédula</label>
                <input
                  id="cedula"
                  type="text"
                  value={nuevoProfesional.cedula}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, cedula: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  value={nuevoProfesional.nombre}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  value={nuevoProfesional.apellido}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, apellido: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="text"
                  value={nuevoProfesional.telefono}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, telefono: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  id="correo"
                  type="email"
                  value={nuevoProfesional.correo}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, correo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="especialidad">Especialidad</label>
                <select
                  id="especialidad"
                  value={nuevoProfesional.especialidad_id}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, especialidad_id: e.target.value })}
                  required
                >
                  <option value="">Selecciona una especialidad</option>
                  {especialidades.map((esp) => (
                    <option key={esp.especialidad_id} value={esp.especialidad_id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group servicio-group">
                <label>Servicio</label>
                <div className="profesionales-checkbox-group">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox"
                      id="eco-doppler"
                      name="servicios"
                      value="ECO-DOPPLER CAROTIDEO"
                      onChange={(e) => {
                        const { value } = e.target;
                        if (e.target.checked) {
                          setNuevoProfesional({
                            ...nuevoProfesional,
                            servicios: [...nuevoProfesional.servicios, value]
                          });
                        } else {
                          setNuevoProfesional({
                            ...nuevoProfesional,
                            servicios: nuevoProfesional.servicios.filter(s => s !== value)
                          });
                        }
                      }}
                    />
                    <label htmlFor="eco-doppler">ECO-DOPPLER CAROTIDEO</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox"
                      id="triplex-arterial"
                      name="servicios"
                      value="TRIPLEX ARTERIAL DE MIEMBROS INFERIOR"
                      onChange={(e) => {
                        const { value } = e.target;
                        if (e.target.checked) {
                          setNuevoProfesional({
                            ...nuevoProfesional,
                            servicios: [...nuevoProfesional.servicios, value]
                          });
                        } else {
                          setNuevoProfesional({
                            ...nuevoProfesional,
                            servicios: nuevoProfesional.servicios.filter(s => s !== value)
                          });
                        }
                      }}
                    />
                    <label htmlFor="triplex-arterial">TRIPLEX ARTERIAL DE MIEMBROS INFERIOR</label>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={() => setShowAddProfesionalModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Modal para editar profesional
  const renderEditProfesionalModal = () => {
    if (!showEditProfesionalModal || !currentProfesional) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content-profesionales">
          <div className="modal-header">
            <h2>Editar profesional</h2>
            <button className="close-btn" onClick={() => setShowEditProfesionalModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleUpdateProfesional}>
              <div className="detail-section">
                <h3>Información personal</h3>
                <div className="form-group">
                  <label htmlFor="edit-cedula">Cédula</label>
                  <input
                    id="edit-cedula"
                    type="text"
                    value={currentProfesional.cedula || ''}
                    onChange={(e) => setCurrentProfesional({...currentProfesional, cedula: e.target.value})}
                    disabled
                  />
                  <small className="form-text text-muted">La cédula no se puede modificar.</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-nombre">Nombre</label>
                    <input
                      id="edit-nombre"
                      type="text"
                      value={currentProfesional.nombre || ''}
                      onChange={(e) => setCurrentProfesional({...currentProfesional, nombre: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-apellido">Apellido</label>
                    <input
                      id="edit-apellido"
                      type="text"
                      value={currentProfesional.apellido || ''}
                      onChange={(e) => setCurrentProfesional({...currentProfesional, apellido: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="edit-telefono">Teléfono</label>
                    <input
                      id="edit-telefono"
                      type="text"
                      value={currentProfesional.telefono || ''}
                      onChange={(e) => setCurrentProfesional({...currentProfesional, telefono: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-correo">Correo electrónico</label>
                    <input
                      id="edit-correo"
                      type="email"
                      value={currentProfesional.email || ''}
                      onChange={(e) => setCurrentProfesional({...currentProfesional, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-especialidad">Especialidad</label>
                  <select
                    id="edit-especialidad"
                    value={currentProfesional.especialidad_id || ''}
                    onChange={(e) => setCurrentProfesional({...currentProfesional, especialidad_id: e.target.value})}
                    required
                  >
                    <option value="">Selecciona una especialidad</option>
                    {especialidades.map((esp) => (
                      <option key={esp.especialidad_id} value={esp.especialidad_id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Servicios que ofrece el profesional</h3>
                <div className="servicios-container">
                  {servicios.length > 0 ? (
                    <div className="profesionales-checkbox-group">
                      {servicios.map(servicio => (
                        <div key={servicio.id_servicio} className="checkbox-item">
                          <input
                            type="checkbox"
                            id={`servicio-${servicio.id_servicio}`}
                            checked={serviciosSeleccionados.includes(servicio.id_servicio)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setServiciosSeleccionados([...serviciosSeleccionados, servicio.id_servicio]);
                              } else {
                                setServiciosSeleccionados(
                                  serviciosSeleccionados.filter(id => id !== servicio.id_servicio)
                                );
                              }
                            }}
                          />
                          <label htmlFor={`servicio-${servicio.id_servicio}`}>
                            {servicio.nombre_servicio}
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-servicios">No hay servicios disponibles</div>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={() => setShowEditProfesionalModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar cambios
                </button>
                <button 
                  type="button" 
                  className="btn-archivar"
                  onClick={confirmarArchivarProfesional}
                >
                  Archivar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Preparar opciones para el filtro de especialidades
  const especialidadesOptions = especialidades.map(esp => ({
    value: esp.nombre,
    label: esp.nombre
  }));

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <h1>Gestión de Profesionales</h1>
        <div className="admin-header-buttons">
          <button 
            className="btn-secondary" 
            onClick={() => setShowAddEspecialidadModal(true)}
          >
            Crear especialidad
          </button>
          
          <button 
            className="btn-add-main" 
            onClick={() => setShowAddProfesionalModal(true)}
          >
            Agregar profesional
          </button>
        </div>
      </div>
      
      <AdminFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Buscar por nombre o cédula"
        filterOptions={especialidadesOptions}
        filterValue={especialidadFiltro}
        setFilterValue={setEspecialidadFiltro}
        filterLabel="Todas las especialidades"
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      
      {loading ? (
        <div className="loading-container">Cargando profesionales...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredProfesionales.length === 0 ? (
        <div className="no-results">No se encontraron profesionales</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
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
                  className={profesional.is_active === false ? 'row-inactive' : ''}
                >
                  <td>{profesional.cedula}</td>
                  <td>{profesional.nombre} {profesional.apellido}</td>
                  <td>{profesional.nombre_especialidad}</td>
                  <td>
                    <span className={`status-badge ${profesional.is_active ? 'status-active' : 'status-inactive'}`}>
                      {profesional.is_active ? 'Activo' : 'Archivado'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {profesional.is_active ? (
                      <button 
                        className="btn-action btn-edit" 
                        title="Editar profesional"
                        onClick={() => handleEditProfesional(profesional)}
                      >
                        ✏️
                      </button>
                    ) : (
                      <button 
                        className="btn-action btn-activate" 
                        title="Activar profesional"
                        onClick={() => cambiarEstadoProfesional(profesional.profesional_id, true)}
                      >
                        ↩️
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {renderAddEspecialidadModal()}
      {renderAddProfesionalModal()}
      {renderEditProfesionalModal()}
      {renderConfirmArchiveModal()}
      
      <div className="profesional-agregado-message" style={{display: 'none'}}>
        <div className="message-content">
          <span className="icon-check">✓</span>
          Profesional agregado
        </div>
      </div>
    </div>
  );
}

export default ProfesionalesAdmin;