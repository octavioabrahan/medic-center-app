import { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import { BuildingOffice2Icon, CheckIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import api from '../../../api';
import CrearConvenio from './CrearConvenio';
import EditarConvenio from './EditarConvenio';
import './AdminConvenios.css';

/**
 * AdminConvenios component for managing healthcare agreements with companies
 * Displays a list of companies with healthcare agreements and allows filtering, sorting, and adding new agreements
 */
const AdminConvenios = () => {
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);
  
  // State for API data
  const [convenios, setConvenios] = useState([]);
  const [filteredConvenios, setFilteredConvenios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modals
  const [showAddConvenioModal, setShowAddConvenioModal] = useState(false);
  const [showEditConvenioModal, setShowEditConvenioModal] = useState(false);
  const [currentConvenio, setCurrentConvenio] = useState(null);

  // Fetch convenios when component loads
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const conveniosRes = await api.get('/convenios');
        console.log('Convenios data:', conveniosRes.data); // Debug to see actual data structure
        setConvenios(conveniosRes.data);
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

  // Apply filters and sorting to the list of convenios
  useEffect(() => {
    if (convenios.length > 0) {
      let filtered = [...convenios];
      
      if (searchTerm) {
        const termLower = searchTerm.toLowerCase();
        filtered = filtered.filter(convenio => {
          // Check if nombre_empresa exists before using toLowerCase
          const convenioNombre = convenio.nombre_empresa || '';
          return convenioNombre.toLowerCase().includes(termLower);
        });
      }
      
      // Filter by archived status if needed
      if (!showArchived) {
        filtered = filtered.filter(convenio => convenio.is_active !== false);
      }
      
      // Sort with proper null checks
      if (sortAZ) {
        filtered.sort((a, b) => {
          const nameA = (a.nombre_empresa || '').toLowerCase();
          const nameB = (b.nombre_empresa || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      } else {
        // Sort by creation date if not A→Z
        filtered.sort((a, b) => {
          // Extract creation date or default to now
          const dateA = a.created_at ? new Date(a.created_at) : new Date();
          const dateB = b.created_at ? new Date(b.created_at) : new Date();
          return dateB - dateA; // Most recent first
        });
      }
      
      setFilteredConvenios(filtered);
    } else {
      setFilteredConvenios([]);
    }
  }, [searchTerm, convenios, showArchived, sortAZ]);

  // Change active/inactive status of the convenio
  const cambiarEstadoConvenio = async (convenioId, activo) => {
    try {
      if (!convenioId) {
        console.error("Error: ID de convenio no definido");
        setError("Error: ID de convenio no definido");
        return false;
      }
      
      console.log(`Cambiando estado del convenio ID: ${convenioId} a ${activo ? 'activo' : 'inactivo'}`);
      
      // Define endpoint for activate/deactivate
      const endpoint = activo ? 
        `/convenios/${convenioId}/desarchivar` : 
        `/convenios/${convenioId}/archivar`;
      
      await api.put(endpoint);
      
      // Update the list after change
      const res = await api.get('/convenios');
      
      // Update the local list to reflect the change
      setConvenios(res.data);
      setError(null);
      setCurrentConvenio(null);
      return true;
    } catch (err) {
      console.error("Error al cambiar estado del convenio:", err);
      setError(`Error al cambiar el estado del convenio: ${err.response?.data?.error || err.message}`);
      return false;
    }
  };

  // Handle opening edit modal
  const handleEditConvenio = (convenio) => {
    setCurrentConvenio(convenio);
    setShowEditConvenioModal(true);
  };
  
  // Handle convenio update
  const handleConvenioUpdated = async () => {
    try {
      // Get updated convenio list
      const res = await api.get('/convenios');
      console.log("Updated convenios:", res.data); // Debug
      setConvenios(res.data);
      setCurrentConvenio(null);
    } catch (err) {
      console.error("Error al actualizar lista de convenios:", err);
      setError("Error al actualizar la lista de convenios");
    }
  };

  // Handle creating new convenio
  const handleCrearConvenio = () => {
    setShowAddConvenioModal(true);
  };
  
  // Confirm archive convenio
  const confirmarArchivarConvenio = async (convenio) => {
    try {
      if (!convenio) {
        console.error('Error: Convenio no definido');
        setError('Error: Convenio no definido');
        return false;
      }
      
      console.log('AdminConvenios -> confirmarArchivarConvenio -> convenio recibido:', convenio);
      
      // Get convenio ID
      const convenioId = convenio?.id_convenio || convenio?.convenio_id;
      
      if (!convenioId) {
        console.error('Error: No se puede archivar, ID de convenio no válido', convenio);
        setError('Error: ID de convenio no válido');
        return false;
      }
      
      console.log(`Intentando archivar convenio con ID: ${convenioId}`);
      const result = await cambiarEstadoConvenio(convenioId, false);
      console.log('Resultado de cambiarEstadoConvenio:', result);
      
      if (result) {
        // Close modal only if operation was successful
        setShowEditConvenioModal(false);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error al archivar convenio:', err);
      setError('Error al archivar el convenio: ' + (err.message || err));
      return false;
    }
  };

  // Format RIF with Venezuelan format J-XXXXXXXX-X
  const formatRIF = (rif) => {
    if (!rif) return 'N/A';
    
    // If RIF already has the format, return it
    if (/^[JGVE]-\d{8}-\d$/.test(rif)) {
      return rif;
    }
    
    // If it's just numbers, try to format it
    if (/^\d{9}$/.test(rif)) {
      return `J-${rif.substring(0, 8)}-${rif.substring(8)}`;
    }
    
    // Return as is if it doesn't match known patterns
    return rif;
  };

  return (
    <AdminLayout activePage="convenios">
      <div className="admin-convenios">
        <div className="admin-convenios__page-header">
          <div className="admin-convenios__menu-header">
            <div className="admin-convenios__text-strong">
              <div className="admin-convenios__title">Convenios</div>
            </div>
          </div>
          <div className="admin-convenios__button-group">
            <Button
              variant="primary"
              onClick={handleCrearConvenio}
            >
              <BuildingOffice2Icon className="btn__icon" />
              <span>Agregar empresas con convenio</span>
            </Button>
          </div>
        </div>
        
        <div className="admin-convenios__filter-bar">
          <div className="admin-convenios__search-container">
            <SearchField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar por nombre"
              className="admin-convenios__search-filter"
            />
          </div>
          
          <div className="admin-convenios__filter-options">
            <div className="admin-convenios__checkbox-field">
              <CheckboxField
                label="Mostrar archivados"
                checked={showArchived}
                onChange={(checked) => setShowArchived(checked)}
              />
            </div>
            
            <div className="admin-convenios__tag-toggle-group">
              <div className={sortAZ ? "admin-convenios__tag-toggle state-on" : "admin-convenios__tag-toggle state-off"} onClick={() => setSortAZ(true)}>
                {sortAZ && <CheckIcon className="admin-convenios__check-icon" />}
                <div className="admin-convenios__title">A → Z</div>
              </div>
              <div className={!sortAZ ? "admin-convenios__tag-toggle state-on" : "admin-convenios__tag-toggle state-off"} onClick={() => setSortAZ(false)}>
                {!sortAZ && <CheckIcon className="admin-convenios__check-icon" />}
                <div className="admin-convenios__title">Más reciente</div>
              </div>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="admin-convenios__loading">Cargando convenios...</div>
        ) : error ? (
          <div className="admin-convenios__error">
            <div className="admin-convenios__error-message">{error}</div>
            <Button 
              variant="neutral" 
              onClick={() => setError(null)}
              className="admin-convenios__error-dismiss"
            >
              Cerrar
            </Button>
          </div>
        ) : filteredConvenios.length === 0 ? (
          <div className="admin-convenios__empty-state">
            <div className="admin-convenios__empty-title">
              Aún no has agregado ninguna empresa con convenio
            </div>
          </div>
        ) : (
          <div className="admin-convenios__body">
            <div className="admin-convenios__table">
              <Table
                headers={[
                  'Empresa',
                  'RIF',
                  'Teléfono',
                  'Estado',
                  'Acciones'
                ]}
                data={filteredConvenios.map(convenio => ({
                  empresa: convenio.nombre_empresa || 'N/A',
                  rif: convenio.rif || 'N/A',
                  telefono: convenio.telefono || 'N/A',
                  estado: convenio.is_active !== undefined ? convenio.is_active : true,
                  acciones: convenio.id_convenio || convenio.convenio_id,
                  id_convenio: convenio.id_convenio || convenio.convenio_id,
                  convenio_completo: convenio // To access the complete object
                }))}
                columns={['empresa', 'rif', 'telefono', 'estado', 'acciones']}
                renderCustomCell={(row, column) => {
                  if (column === 'estado') {
                    const isActive = row.estado;
                    let scheme = isActive ? 'positive' : 'neutral';
                    let variant = 'secondary';
                    let text = isActive ? 'Activo' : 'Archivado';
                    
                    return (
                      <div className="admin-convenios__status">
                        <Tag 
                          text={text}
                          scheme={scheme}
                          variant={variant}
                          closeable={false}
                        />
                      </div>
                    );
                  }
                  
                  if (column === 'rif') {
                    return (
                      <div className="admin-convenios__rif">
                        {formatRIF(row.rif)}
                      </div>
                    );
                  }
                  
                  if (column === 'acciones') {
                    const isActive = row.estado;
                    return (
                      <div className="admin-convenios__actions">
                        {isActive ? (
                          <button
                            className="admin-convenios__action-btn edit"
                            onClick={() => handleEditConvenio(row.convenio_completo)}
                            aria-label="Editar convenio"
                          >
                            <PencilIcon width={16} height={16} />
                          </button>
                        ) : (
                          <button
                            className="admin-convenios__action-btn activate"
                            onClick={() => cambiarEstadoConvenio(row.id_convenio, true)}
                            aria-label="Activar convenio"
                          >
                            <ArrowPathIcon width={16} height={16} />
                          </button>
                        )}
                      </div>
                    );
                  }
                  // For other columns, use default rendering
                  return null;
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      <CrearConvenio 
        isOpen={showAddConvenioModal}
        onClose={() => setShowAddConvenioModal(false)}
        onConvenioCreated={setConvenios}
      />
      <EditarConvenio 
        isOpen={showEditConvenioModal}
        onClose={() => setShowEditConvenioModal(false)}
        convenio={currentConvenio}
        onConvenioUpdated={handleConvenioUpdated}
        onConfirmArchive={confirmarArchivarConvenio}
      />
    </AdminLayout>
  );
};

export default AdminConvenios;
