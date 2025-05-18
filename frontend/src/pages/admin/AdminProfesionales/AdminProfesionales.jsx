import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import SelectField from '../../../components/Inputs/SelectField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import { UserPlusIcon, CheckIcon, PencilIcon, ArrowPathIcon, TrashIcon } from '@heroicons/react/20/solid';
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
  const confirmarArchivarProfesional = async (profesional) => {
    console.log('Profesional a archivar:', profesional);
    if (profesional && profesional.profesional_id) {
      try {
        await cambiarEstadoProfesional(profesional.profesional_id, false);
        setShowEditProfesionalModal(false);
      } catch (err) {
        console.error('Error al archivar profesional:', err);
        setError('Error al archivar el profesional');
      }
    } else {
      console.error('Error: No se puede archivar, ID de profesional no válido');
      setError('Error: ID de profesional no válido');
    }
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

  // La funcionalidad de añadir profesional ahora se maneja en el componente CrearProfesionales

  return (
    <AdminLayout activePage="/admin/profesionales">
      <div className="admin-profesionales">
        <div className="admin-profesionales__page-header">
          <div className="admin-profesionales__menu-header">
            <div className="admin-profesionales__text-strong">
              <div className="admin-profesionales__title">Profesionales</div>
            </div>
          </div>
          <div className="admin-profesionales__button-group">
            <Button variant="neutral" onClick={() => setShowAddEspecialidadModal(true)}>
              Crear especialidad
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddProfesionalModal(true)}
            >
              <UserPlusIcon className="btn__icon" />
              <span style={{ marginLeft: '.5rem' }}>Agregar nuevo profesional</span>
            </Button>
          </div>
        </div>
        
        <div className="admin-profesionales__filter-bar">
          <div className="admin-profesionales__search-container">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar por nombre"
              className="admin-profesionales__search-filter"
            />
          </div>
          
          <div className="admin-profesionales__filter-options">
            <div className="admin-profesionales__select-container">
              <SelectField
                options={especialidadesOptions}
                value={selectedEspecialidad}
                onChange={setSelectedEspecialidad}
                className="admin-profesionales__select-field"
                fillContainer={true}
              />
            </div>
            
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
          <div className="admin-profesionales__body">
            <div className="admin-profesionales__table">
              <Table
                headers={[
                  'Cédula',
                  'Profesional',
                  'Especialidad',
                  'Estado',
                  'Acciones'
                ]}
                data={filteredProfesionales.map(profesional => ({
                  cedula: profesional.cedula || 'N/A',
                  profesional: `${profesional.nombre || ''} ${profesional.apellido || ''}`.trim(),
                  especialidad: profesional.nombre_especialidad || 'N/A',
                  estado: profesional.is_active,
                  acciones: profesional.profesional_id,
                  profesional_id: profesional.profesional_id,
                  profesional_completo: profesional // Para poder acceder al objeto completo
                }))}
                columns={['cedula', 'profesional', 'especialidad', 'estado', 'acciones']}
                renderCustomCell={(row, column) => {
                  if (column === 'estado') {
                    const isActive = row.estado;
                    let scheme = isActive ? 'positive' : 'neutral';
                    let variant = 'secondary';
                    let text = isActive ? 'Activo' : 'Archivado';
                    
                    return (
                      <div className="text">
                        <Tag 
                          text={text}
                          scheme={scheme}
                          variant={variant}
                          closeable={false}
                        />
                      </div>
                    );
                  }
                  
                  if (column === 'acciones') {
                    const isActive = row.estado;
                    return (
                      <div className="admin-profesionales__actions">
                        {isActive ? (
                          <button
                            className="admin-profesionales__action-btn edit"
                            onClick={() => handleEditProfesional(row.profesional_completo)}
                            aria-label="Editar profesional"
                          >
                            <PencilIcon width={16} height={16} />
                          </button>
                        ) : (
                          <button
                            className="admin-profesionales__action-btn activate"
                            onClick={() => cambiarEstadoProfesional(row.profesional_id, true)}
                            aria-label="Activar profesional"
                          >
                            <ArrowPathIcon width={16} height={16} />
                          </button>
                        )}
                      </div>
                    );
                  }
                  // Para otras columnas, usar el renderizado por defecto
                  return null;
                }}
              />
            </div>
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
    </AdminLayout>
  );
};

export default AdminProfesionales;
