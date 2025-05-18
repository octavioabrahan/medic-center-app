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
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modals
  const [showAddEmpresaModal, setShowAddEmpresaModal] = useState(false);
  const [showEditEmpresaModal, setShowEditEmpresaModal] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);

  // Fetch empresas when component loads
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Using 'empresas' endpoint instead of 'convenios'
        const empresasRes = await api.get('/empresas');
        console.log('Empresas con convenio data:', empresasRes.data); // Debug to see actual data structure
        setEmpresas(empresasRes.data);
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

  // Apply filters and sorting to the list of empresas
  useEffect(() => {
    if (empresas.length > 0) {
      let filtered = [...empresas];
      
      if (searchTerm) {
        const termLower = searchTerm.toLowerCase();
        filtered = filtered.filter(empresa => {
          // Check if nombre_empresa exists before using toLowerCase
          const nombreEmpresa = empresa.nombre_empresa || '';
          // Also search by RIF
          const rifEmpresa = empresa.rif || '';
          return nombreEmpresa.toLowerCase().includes(termLower) || 
                 rifEmpresa.toLowerCase().includes(termLower);
        });
      }
      
      // Filter by archived status if needed
      if (!showArchived) {
        filtered = filtered.filter(empresa => empresa.is_active !== false);
      }
      
      // Sort with proper null checks
      if (sortAZ) {
        filtered.sort((a, b) => {
          const nameA = (a.nombre_empresa || '').toLowerCase();
          const nameB = (b.nombre_empresa || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      } else {
        // Sort by ID if not A→Z (most recent first, as done in the reference file)
        filtered.sort((a, b) => {
          const idA = a.id_empresa || 0;
          const idB = b.id_empresa || 0;
          return idB - idA; // Most recent first (higher ID)
        });
      }
      
      setFilteredEmpresas(filtered);
    } else {
      setFilteredEmpresas([]);
    }
  }, [searchTerm, empresas, showArchived, sortAZ]);

  // Change active/inactive status of the empresa
  const cambiarEstadoEmpresa = async (empresaId, activo) => {
    try {
      if (!empresaId) {
        console.error("Error: ID de empresa no definido");
        setError("Error: ID de empresa no definido");
        return false;
      }
      
      console.log(`Cambiando estado de la empresa ID: ${empresaId} a ${activo ? 'activo' : 'inactivo'}`);
      
      // Define endpoint based on reference file
      if (activo) {
        // To activate
        await api.patch(`/empresas/${empresaId}/activar`);
      } else {
        // To archive (deactivate)
        await api.delete(`/empresas/${empresaId}`);
      }
      
      // Update the list after change
      const res = await api.get('/empresas');
      
      // Update the local list to reflect the change
      setEmpresas(res.data);
      setError(null);
      setCurrentEmpresa(null);
      return true;
    } catch (err) {
      console.error("Error al cambiar estado de la empresa:", err);
      setError(`Error al cambiar el estado de la empresa: ${err.response?.data?.error || err.message}`);
      return false;
    }
  };

  // Handle opening edit modal
  const handleEditEmpresa = (empresa) => {
    setCurrentEmpresa(empresa);
    setShowEditEmpresaModal(true);
  };
  
  // Handle empresa update
  const handleEmpresaUpdated = async () => {
    try {
      // Get updated company list
      const res = await api.get('/empresas');
      console.log("Updated empresas con convenio:", res.data); // Debug
      setEmpresas(res.data);
      setCurrentEmpresa(null);
    } catch (err) {
      console.error("Error al actualizar lista de empresas con convenio:", err);
      setError("Error al actualizar la lista de empresas con convenio");
    }
  };

  // Handle creating new empresa
  const handleCrearEmpresa = () => {
    setShowAddEmpresaModal(true);
  };
  
  // Confirm archive empresa
  const confirmarArchivarEmpresa = async (empresa) => {
    try {
      if (!empresa) {
        console.error('Error: Empresa no definida');
        setError('Error: Empresa no definida');
        return false;
      }
      
      console.log('AdminConvenios -> confirmarArchivarEmpresa -> empresa recibida:', empresa);
      
      // Get empresa ID
      const empresaId = empresa?.id_empresa;
      
      if (!empresaId) {
        console.error('Error: No se puede archivar, ID de empresa no válido', empresa);
        setError('Error: ID de empresa no válido');
        return false;
      }
      
      console.log(`Intentando archivar empresa con ID: ${empresaId}`);
      const result = await cambiarEstadoEmpresa(empresaId, false);
      console.log('Resultado de cambiarEstadoEmpresa:', result);
      
      if (result) {
        // Close modal only if operation was successful
        setShowEditEmpresaModal(false);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error('Error al archivar empresa:', err);
      setError('Error al archivar la empresa: ' + (err.message || err));
      return false;
    }
  };

  // Format RIF with Venezuelan format J-XXXXXXXX-X
  const formatRIF = (rif) => {
    if (!rif) return 'N/A';
    
    // Clean the RIF (remove non-alphanumeric characters)
    rif = rif.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Check if the cleaned RIF has the right length
    if (rif.length !== 10) return rif;
    
    // Format as X-XXXXXXXX-X
    return `${rif.substring(0, 1)}-${rif.substring(1, 9)}-${rif.substring(9)}`;
  };

  return (
    <AdminLayout activePage="/admin/convenios">
      <div className="admin-convenios">
        <div className="admin-convenios__page-header">
          <div className="admin-convenios__menu-header">
            <div className="admin-convenios__text-strong">
              <div className="admin-convenios__title">Empresas con convenio</div>
            </div>
          </div>
          <div className="admin-convenios__button-group">
            <Button
              variant="primary"
              onClick={handleCrearEmpresa}
            >
              <BuildingOffice2Icon className="btn__icon" />
              <span>Agregar empresas con convenio</span>
            </Button>
          </div>
        </div>
        
        <div className="admin-convenios__filter-bar">
          <div className="admin-convenios__search-container">          <SearchField
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
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
          <div className="admin-convenios__loading">Cargando empresas con convenio...</div>
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
        ) : filteredEmpresas.length === 0 ? (
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
                  'Logo',
                  'Estado',
                  'Acciones'
                ]}
                data={filteredEmpresas.map(empresa => ({
                  empresa: empresa.nombre_empresa || 'N/A',
                  rif: empresa.rif || 'N/A',
                  logo: empresa.logo_url || '',
                  estado: empresa.is_active !== undefined ? empresa.is_active : true,
                  acciones: empresa.id_empresa,
                  id_empresa: empresa.id_empresa,
                  empresa_completa: empresa // To access the complete object
                }))}
                columns={['empresa', 'rif', 'logo', 'estado', 'acciones']}
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
                  
                  if (column === 'logo') {
                    return (
                      <div className="admin-convenios__logo">
                        {row.logo ? (
                          <img
                            src={row.logo.replace(/&#x2F;/g, '/').replace(/&$/, '')}
                            alt={`Logo de ${row.empresa}`}
                            style={{ maxWidth: "40px", maxHeight: "40px" }}
                            onError={(e) => {
                              console.error("Error cargando imagen:", e.target.src);
                              e.target.onerror = null;
                              e.target.alt = "Logo no disponible";
                            }}
                          />
                        ) : (
                          <span className="no-logo">Sin logo</span>
                        )}
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
                            onClick={() => handleEditEmpresa(row.empresa_completa)}
                            aria-label="Editar empresa"
                          >
                            <PencilIcon width={16} height={16} />
                          </button>
                        ) : (
                          <button
                            className="admin-convenios__action-btn activate"
                            onClick={() => cambiarEstadoEmpresa(row.id_empresa, true)}
                            aria-label="Activar empresa"
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
        isOpen={showAddEmpresaModal}
        onClose={() => setShowAddEmpresaModal(false)}
        onEmpresaCreated={setEmpresas}
      />
      <EditarConvenio 
        isOpen={showEditEmpresaModal}
        onClose={() => setShowEditEmpresaModal(false)}
        convenio={currentEmpresa}
        onEmpresaUpdated={handleEmpresaUpdated}
        onConfirmArchive={confirmarArchivarEmpresa}
      />
    </AdminLayout>
  );
};

export default AdminConvenios;
