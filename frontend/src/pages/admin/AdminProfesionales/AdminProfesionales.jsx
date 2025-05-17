import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import SelectField from '../../../components/Inputs/SelectField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import { UserPlusIcon, CheckIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import api from '../../../api';
import CrearEspecialidades from './CrearEspecialidades';
import CrearProfesionales from './CrearProfesionales';
import EditarProfesionales from './EditarProfesionales';
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
  
  // Los servicios se manejan ahora en el componente EditarProfesionales
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  // Fetch de profesionales y especialidades al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profesionalesRes, especialidadesRes] = await Promise.all([
          api.get('/profesionales', { params: { soloActivos: !showArchived } }),
          api.get('/especialidades')
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
      if (!profesionalId) {
        console.error("Error: ID de profesional no definido");
        setError("Error: ID de profesional no definido");
        return;
      }
      
      console.log(`Cambiando estado del profesional ID: ${profesionalId} a ${activo ? 'activo' : 'inactivo'}`);
      
      await api.put(`/profesionales/estado/${profesionalId}`, { activo });
      
      // Actualizar la lista después del cambio
      const res = await api.get('/profesionales', { params: { soloActivos: !showArchived } });
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

  // La funcionalidad de crear profesional se ha movido al componente CrearProfesionales

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
  
  // La funcionalidad de actualizar profesional se ha movido al componente EditarProfesionales
  const handleProfesionalUpdated = async () => {
    try {
      // Obtener la lista actualizada de profesionales
      const res = await api.get('/profesionales', { params: { soloActivos: !showArchived } });
      setProfesionales(res.data);
      setCurrentProfesional(null);
    } catch (err) {
      console.error("Error al actualizar lista de profesionales:", err);
      setError("Error al actualizar la lista de profesionales");
    }
  };
  
  // Mostrar modal de confirmación para archivar
  const confirmarArchivarProfesional = (profesional) => {
    setCurrentProfesional(profesional);
    setShowConfirmArchiveModal(true);
    setShowEditProfesionalModal(false);
  };

  // Los efectos relacionados con el modal de edición se han trasladado al componente EditarProfesionales

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
            </p>
            <p className="admin-profesionales__confirm-description">
              El profesional no podrá recibir nuevas citas pero se mantendrán sus registros históricos.
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
              onClick={() => {
                console.log('Profesional a archivar:', currentProfesional);
                if (currentProfesional && currentProfesional.profesional_id) {
                  cambiarEstadoProfesional(currentProfesional.profesional_id, false);
                } else {
                  console.error('Error: No se puede archivar, ID de profesional no válido');
                  setError('Error: ID de profesional no válido');
                }
              }}
            >
              Sí, quiero archivar
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // La funcionalidad de añadir profesional ahora se maneja en el componente CrearProfesionales

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
      <CrearProfesionales 
        isOpen={showAddProfesionalModal}
        onClose={() => setShowAddProfesionalModal(false)}
        especialidades={especialidades}
        onProfesionalCreated={setProfesionales}
        showArchived={showArchived}
      />
      <EditarProfesionales 
        isOpen={showEditProfesionalModal}
        onClose={() => setShowEditProfesionalModal(false)}
        profesional={currentProfesional}
        especialidades={especialidades}
        onConfirmArchive={confirmarArchivarProfesional}
        onProfesionalUpdated={handleProfesionalUpdated}
        showArchived={showArchived}
      />
      {renderConfirmArchiveModal()}
    </AdminLayout>
  );
};

export default AdminProfesionales;
