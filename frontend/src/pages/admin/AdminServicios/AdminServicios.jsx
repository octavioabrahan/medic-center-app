import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import { PlusIcon, CheckIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import api from '../../../api';
import CrearServicio from './CrearServicio';
import EditarServicio from './EditarServicio';
import './AdminServicios.css';

/**
 * AdminServicios component for managing services in the admin dashboard
 * Displays the list of services and allows filtering, sorting and adding new services
 */
const AdminServicios = () => {
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);

  // State for API data
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for modals
  const [showAddServicioModal, setShowAddServicioModal] = useState(false);
  const [showEditServicioModal, setShowEditServicioModal] = useState(false);
  const [currentServicio, setCurrentServicio] = useState(null);

  // Fetch servicios al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const serviciosRes = await api.get('/servicios', { params: { soloActivos: !showArchived } });
        setServicios(serviciosRes.data);
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

  // Aplicar filtros y ordenamiento a la lista de servicios
  useEffect(() => {
    if (servicios.length > 0) {
      let filtered = [...servicios];
      
      if (searchTerm) {
        const termLower = searchTerm.toLowerCase();
        filtered = filtered.filter(servicio => 
          servicio.nombre?.toLowerCase().includes(termLower)
        );
      }
      
      if (sortAZ) {
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
      } else {
        filtered.sort((a, b) => b.nombre.localeCompare(a.nombre));
      }
      
      setFilteredServicios(filtered);
    } else {
      setFilteredServicios([]);
    }
  }, [searchTerm, servicios, showArchived, sortAZ]);

  // Cambiar estado activo/inactivo del servicio
  const cambiarEstadoServicio = async (servicioId, activo) => {
    try {
      if (!servicioId) {
        console.error("Error: ID de servicio no definido");
        setError("Error: ID de servicio no definido");
        return;
      }
      
      console.log(`Cambiando estado del servicio ID: ${servicioId} a ${activo ? 'activo' : 'inactivo'}`);
      
      await api.put(`/servicios/estado/${servicioId}`, { activo });
      
      // Actualizar la lista después del cambio
      const res = await api.get('/servicios', { params: { soloActivos: !showArchived } });
      setServicios(res.data);
      
      setCurrentServicio(null);
    } catch (err) {
      console.error("Error al cambiar estado del servicio:", err);
      setError("Error al cambiar el estado del servicio");
    }
  };

  // Editar servicio
  const handleEditServicio = (servicio) => {
    setCurrentServicio(servicio);
    setShowEditServicioModal(true);
  };
  
  // Actualizar servicio
  const handleServicioUpdated = async () => {
    try {
      // Obtener la lista actualizada de servicios
      const res = await api.get('/servicios', { params: { soloActivos: !showArchived } });
      setServicios(res.data);
      setCurrentServicio(null);
    } catch (err) {
      console.error("Error al actualizar lista de servicios:", err);
      setError("Error al actualizar la lista de servicios");
    }
  };

  // Crear servicio
  const handleCrearServicio = () => {
    setShowAddServicioModal(true);
  };
  
  // Confirmar archivar servicio
  const confirmarArchivarServicio = async (servicio) => {
    console.log('Servicio a archivar:', servicio);
    if (servicio && servicio.servicio_id) {
      try {
        await cambiarEstadoServicio(servicio.servicio_id, false);
      } catch (err) {
        console.error('Error al archivar servicio:', err);
        setError('Error al archivar el servicio');
      }
    } else {
      console.error('Error: No se puede archivar, ID de servicio no válido');
      setError('Error: ID de servicio no válido');
    }
  };

  return (
    <AdminLayout activePage="/admin/servicios">
      <div className="admin-servicios">
        <div className="admin-servicios__page-header">
          <div className="admin-servicios__menu-header">
            <div className="admin-servicios__text-strong">
              <div className="admin-servicios__title">Servicios</div>
            </div>
          </div>
          <div className="admin-servicios__button-group">
            <Button
              variant="primary"
              onClick={handleCrearServicio}
            >
              <PlusIcon className="btn__icon" />
              <span>Crear servicio</span>
            </Button>
          </div>
        </div>
        
        <div className="admin-servicios__filter-bar">
          <div className="admin-servicios__search-container">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar por nombre"
              className="admin-servicios__search-filter"
            />
          </div>
          
          <div className="admin-servicios__filter-options">
            <div className="admin-servicios__checkbox-field">
              <CheckboxField
                label="Mostrar archivados"
                checked={showArchived}
                onChange={setShowArchived}
              />
            </div>
            
            <div className="admin-servicios__tag-toggle-group">
              <div className={sortAZ ? "admin-servicios__tag-toggle state-on" : "admin-servicios__tag-toggle state-off"} onClick={() => setSortAZ(true)}>
                {sortAZ && <CheckIcon className="admin-servicios__check-icon" />}
                <div className="admin-servicios__title">A → Z</div>
              </div>
              <div className={!sortAZ ? "admin-servicios__tag-toggle state-on" : "admin-servicios__tag-toggle state-off"} onClick={() => setSortAZ(false)}>
                {!sortAZ && <CheckIcon className="admin-servicios__check-icon" />}
                <div className="admin-servicios__title">Z → A</div>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="admin-servicios__loading">Cargando servicios...</div>
        ) : error ? (
          <div className="admin-servicios__error">{error}</div>
        ) : filteredServicios.length === 0 ? (
          <div className="admin-servicios__empty-state">
            <div className="admin-servicios__empty-title">
              Aún no has creado ningún servicio
            </div>
          </div>
        ) : (
          <div className="admin-servicios__body">
            <div className="admin-servicios__table">
              <Table
                headers={[
                  'Nombre',
                  'Estado',
                  'Acciones'
                ]}
                data={filteredServicios.map(servicio => ({
                  nombre: servicio.nombre || 'N/A',
                  estado: servicio.is_active,
                  acciones: servicio.servicio_id,
                  servicio_id: servicio.servicio_id,
                  servicio_completo: servicio // Para poder acceder al objeto completo
                }))}
                columns={['nombre', 'estado', 'acciones']}
                renderCustomCell={(row, column) => {
                  if (column === 'estado') {
                    const isActive = row.estado;
                    let scheme = isActive ? 'positive' : 'neutral';
                    let variant = 'secondary';
                    let text = isActive ? 'Activo' : 'Archivado';
                    
                    return (
                      <div className="admin-servicios__status">
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
                      <div className="admin-servicios__actions">
                        {isActive ? (
                          <button
                            className="admin-servicios__action-btn edit"
                            onClick={() => handleEditServicio(row.servicio_completo)}
                            aria-label="Editar servicio"
                          >
                            <PencilIcon width={16} height={16} />
                          </button>
                        ) : (
                          <button
                            className="admin-servicios__action-btn activate"
                            onClick={() => cambiarEstadoServicio(row.servicio_id, true)}
                            aria-label="Activar servicio"
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
      <CrearServicio 
        isOpen={showAddServicioModal}
        onClose={() => setShowAddServicioModal(false)}
        onServicioCreated={setServicios}
        showArchived={showArchived}
      />
      <EditarServicio 
        isOpen={showEditServicioModal}
        onClose={() => setShowEditServicioModal(false)}
        servicio={currentServicio}
        onServicioUpdated={handleServicioUpdated}
        onConfirmArchive={confirmarArchivarServicio}
      />
    </AdminLayout>
  );
};

export default AdminServicios;
