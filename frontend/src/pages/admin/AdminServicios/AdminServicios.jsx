import { useState, useEffect } from 'react';
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
        // Using the endpoint from the old code as reference
        const serviciosRes = await api.get('/servicios');
        console.log('Servicios data:', serviciosRes.data); // Debug to see actual data structure
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

  // Debug function to inspect service data format
  const inspectServiceData = (data) => {
    if (!data || data.length === 0) return;
    
    const sampleService = data[0];
    console.log("Sample service data structure:", {
      id: sampleService.id_servicio || sampleService.servicio_id || 'undefined',
      name: sampleService.nombre_servicio || sampleService.nombre || 'undefined',
      isActive: sampleService.is_active,
      fullObject: sampleService
    });
  };

  // Attach to useEffect to inspect data when it loads
  useEffect(() => {
    if (servicios.length > 0) {
      inspectServiceData(servicios);
    }
  }, [servicios]);

  // Aplicar filtros y ordenamiento a la lista de servicios
  useEffect(() => {
    if (servicios.length > 0) {
      let filtered = [...servicios];
      
      if (searchTerm) {
        const termLower = searchTerm.toLowerCase();
        filtered = filtered.filter(servicio => {
          // Check if nombre or nombre_servicio exists before using toLowerCase
          const servicioNombre = servicio.nombre || servicio.nombre_servicio || '';
          return servicioNombre.toLowerCase().includes(termLower);
        });
      }
      
      // Filter by archived status if needed
      if (!showArchived) {
        filtered = filtered.filter(servicio => servicio.is_active !== false);
      }
      
      // Sort with proper null checks
      if (sortAZ) {
        filtered.sort((a, b) => {
          const nameA = (a.nombre || a.nombre_servicio || '').toLowerCase();
          const nameB = (b.nombre || b.nombre_servicio || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      } else {
        filtered.sort((a, b) => {
          const nameA = (a.nombre || a.nombre_servicio || '').toLowerCase();
          const nameB = (b.nombre || b.nombre_servicio || '').toLowerCase();
          return nameB.localeCompare(nameA);
        });
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
        return false;
      }
      
      console.log(`Cambiando estado del servicio ID: ${servicioId} a ${activo ? 'activo' : 'inactivo'}`);
      
      // Use the endpoint format from the old code
      const endpoint = activo ? 
        `/servicios/${servicioId}/desarchivar` : 
        `/servicios/${servicioId}/archivar`;
      
      await api.put(endpoint);
      
      // Update the list after change - use plain endpoint without params like in old code
      const res = await api.get('/servicios');
      
      // Update the local list to reflect the change
      setServicios(res.data);
      setError(null);
      setCurrentServicio(null);
      return true;
    } catch (err) {
      console.error("Error al cambiar estado del servicio:", err);
      setError(`Error al cambiar el estado del servicio: ${err.response?.data?.error || err.message}`);
      return false;
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
      // Get updated service list without params like in old code
      const res = await api.get('/servicios');
      console.log("Updated services:", res.data); // Debug
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
    try {
      if (!servicio) {
        console.error('Error: Servicio no definido');
        setError('Error: Servicio no definido');
        return false;
      }
      
      console.log('AdminServicios -> confirmarArchivarServicio -> servicio recibido:', servicio);
      
      // Asegurar que tenemos un ID válido verificando ambas formas posibles del nombre de propiedad
      const servicioId = servicio?.id_servicio || servicio?.servicio_id;
      
      if (!servicioId) {
        console.error('Error: No se puede archivar, ID de servicio no válido', servicio);
        setError('Error: ID de servicio no válido');
        return false;
      }
      
      console.log(`Intentando archivar servicio con ID: ${servicioId}`);
      const result = await cambiarEstadoServicio(servicioId, false);
      console.log('Resultado de cambiarEstadoServicio:', result);
      
      if (result) {
        // Solo cerrar el modal si la operación fue exitosa
        setShowEditServicioModal(false);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error al archivar servicio:', err);
      setError('Error al archivar el servicio: ' + (err.message || err));
      return false;
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
          <div className="admin-servicios__error">
            <div className="admin-servicios__error-message">{error}</div>
            <Button 
              variant="neutral" 
              onClick={() => setError(null)}
              className="admin-servicios__error-dismiss"
            >
              Cerrar
            </Button>
          </div>
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
                  'Precio (USD)',
                  'Recomendado',
                  'Estado',
                  'Acciones'
                ]}
                data={filteredServicios.map(servicio => ({
                  nombre: servicio.nombre || servicio.nombre_servicio || 'N/A',
                  precio: servicio.price_usd || 0,
                  recomendado: servicio.is_recommended || false,
                  estado: servicio.is_active !== undefined ? servicio.is_active : true,
                  acciones: servicio.servicio_id || servicio.id_servicio,
                  servicio_id: servicio.servicio_id || servicio.id_servicio,
                  servicio_completo: servicio // Para poder acceder al objeto completo
                }))}
                columns={['nombre', 'precio', 'recomendado', 'estado', 'acciones']}
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
                  
                  if (column === 'precio') {
                    return (
                      <div className="admin-servicios__precio">
                        ${parseFloat(row.precio).toFixed(2)}
                      </div>
                    );
                  }
                  
                  if (column === 'recomendado') {
                    return (
                      <div className="admin-servicios__recomendado">
                        {row.recomendado ? 'Sí' : 'No'}
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
                            onClick={() => cambiarEstadoServicio(row.servicio_completo.id_servicio || row.servicio_completo.servicio_id, true)}
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
