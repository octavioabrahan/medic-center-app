import { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import TagToggle from '../../../components/Tag/TagToggle';
import MenuHeader from '../../../components/Menu/MenuHeader';
import { BuildingOffice2Icon, PencilIcon, ArchiveBoxIcon } from '@heroicons/react/20/solid';
import api from '../../../api';
import CrearConvenio from './CrearConvenio';
import EditarConvenioModal from './EditarConvenioModal';
import ArchivarConvenioModal from './ArchivarConvenioModal';
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
  const [showArchivarConvenioModal, setShowArchivarConvenioModal] = useState(false);
  const [currentConvenio, setCurrentConvenio] = useState(null);
  const [archivarLoading, setArchivarLoading] = useState(false);
  
  // Fetch convenios al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Replace with the actual endpoint when available
        const conveniosRes = await api.get('/empresas');
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
  }, []);

  // Filter and sort convenios based on search term and sort state
  useEffect(() => {
    let result = [...convenios];
    
    // Apply archived filter
    if (!showArchived) {
      result = result.filter(convenio => !convenio.archivado);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(convenio => 
        convenio.nombre?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortAZ) {
        return a.nombre?.localeCompare(b.nombre);
      } else {
        // Sort by creation date or ID if available
        return b.id_empresa - a.id_empresa;
      }
    });
    
    setFilteredConvenios(result);
  }, [convenios, searchTerm, showArchived, sortAZ]);

  // Handlers
  const handleSortChange = (sortType) => {
    if (sortType === 'az') {
      setSortAZ(true);
    } else if (sortType === 'recent') {
      setSortAZ(false);
    }
  };

  const handleArchivarConvenio = async (convenio) => {
    setArchivarLoading(true);
    try {
      // Replace with actual API endpoint when available
      await api.put(`/empresas/${convenio.id_empresa}/archivar`, { archivado: true });
      
      // Update the local state
      setConvenios(prevConvenios => prevConvenios.map(item => 
        item.id_empresa === convenio.id_empresa 
          ? { ...item, archivado: true } 
          : item
      ));
      
      setArchivarLoading(false);
      setShowArchivarConvenioModal(false);
      
    } catch (error) {
      console.error("Error al archivar convenio:", error);
      setArchivarLoading(false);
      alert("Error al archivar la empresa. Por favor intente nuevamente.");
    }
  };

  const handleRestoreConvenio = async (convenio) => {
    try {
      // Replace with actual API endpoint when available
      await api.put(`/empresas/${convenio.id_empresa}/archivar`, { archivado: false });
      
      // Update the local state
      setConvenios(prevConvenios => prevConvenios.map(item => 
        item.id_empresa === convenio.id_empresa 
          ? { ...item, archivado: false } 
          : item
      ));
      
    } catch (error) {
      console.error("Error al restaurar convenio:", error);
      alert("Error al restaurar la empresa. Por favor intente nuevamente.");
    }
  };

  // Table headers and custom cell rendering
  const tableHeaders = ["Empresa", "Teléfono", "Email", "Sitio web", "Estado", "Acciones"];
  const tableColumns = ["nombre", "telefono", "email", "sitio_web", "archivado"];
  
  const renderCustomCell = (item, column, index) => {
    if (column === "archivado") {
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tag 
            text={item.archivado ? "Archivado" : "Activo"}
            scheme={item.archivado ? "neutral" : "positive"}
          />
        </div>
      );
    }
    
    // Render the actions column
    if (column === "actions") {
      return (
        <div className="table-actions">
          <Button 
            variant="icon" 
            onClick={() => {
              setCurrentConvenio(item);
              setShowEditConvenioModal(true);
            }}
            aria-label="Editar"
            tooltip="Editar"
          >
            <PencilIcon className="icon-sm" />
          </Button>
          
          {item.archivado ? (
            <Button 
              variant="icon" 
              onClick={() => handleRestoreConvenio(item)}
              aria-label="Restaurar"
              tooltip="Restaurar"
            >
              <ArchiveBoxIcon className="icon-sm" />
            </Button>
          ) : (
            <Button 
              variant="icon" 
              onClick={() => {
                setCurrentConvenio(item);
                setShowArchivarConvenioModal(true);
              }}
              aria-label="Archivar"
              tooltip="Archivar"
            >
              <ArchiveBoxIcon className="icon-sm" />
            </Button>
          )}
        </div>
      );
    }
    
    return item[column] || "-";
  };

  return (
    <AdminLayout 
      activePage="convenios"
      username="Administrador"
    >
      <div className="admin-convenios-container">
        <div className="page-header">
          <MenuHeader
            heading="Convenios"
            subheading="Administración de empresas con convenio"
          />
          <Button 
            variant="primary" 
            onClick={() => setShowAddConvenioModal(true)}
            iconStart={<BuildingOffice2Icon className="icon-sm" />}
          >
            Agregar empresas con convenio
          </Button>
        </div>
        
        <div className="filter-bar">
          <div className="search-filter">
            <SearchField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre"
              onClear={() => setSearchTerm('')}
            />
          </div>
          
          <CheckboxField
            label="Mostrar archivados"
            checked={showArchived}
            onChange={(checked) => setShowArchived(checked)}
          />
          
          <div className="tag-toggle-group">
            <TagToggle
              label="Más reciente"
              active={!sortAZ}
              onChange={() => handleSortChange('recent')}
            />
            <TagToggle
              label="A → Z"
              active={sortAZ}
              onChange={() => handleSortChange('az')}
            />
          </div>
        </div>
        
        {/* Content area - Show empty state if no data */}
        <div className="body">
          {loading ? (
            <p className="loading-text">Cargando convenios...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : filteredConvenios.length === 0 ? (
            <div className="empty-state">
              <p className="empty-message">
                Aún no has agregado ninguna empresa con convenio
              </p>
            </div>
          ) : (
            <div className="convenios-list">
              <Table 
                headers={tableHeaders}
                data={filteredConvenios}
                columns={[...tableColumns, "actions"]}
                renderCustomCell={renderCustomCell}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Modal for adding new convenio */}
      {showAddConvenioModal && (
        <CrearConvenio
          isOpen={showAddConvenioModal}
          onClose={() => setShowAddConvenioModal(false)}
          onSuccess={(newConvenio) => {
            setConvenios([...convenios, newConvenio]);
            setShowAddConvenioModal(false);
          }}
        />
      )}
      
      {/* Modal for editing convenio */}
      {showEditConvenioModal && currentConvenio && (
        <EditarConvenioModal
          isOpen={showEditConvenioModal}
          onClose={() => {
            setShowEditConvenioModal(false);
            setCurrentConvenio(null);
          }}
          convenio={currentConvenio}
          onSuccess={(updatedConvenio) => {
            setConvenios(prevConvenios => 
              prevConvenios.map(item => 
                item.id_empresa === updatedConvenio.id_empresa 
                  ? updatedConvenio 
                  : item
              )
            );
            setShowEditConvenioModal(false);
            setCurrentConvenio(null);
          }}
        />
      )}
      
      {/* Modal for archiving convenio */}
      {showArchivarConvenioModal && currentConvenio && (
        <ArchivarConvenioModal
          isOpen={showArchivarConvenioModal}
          onClose={() => {
            setShowArchivarConvenioModal(false);
            setCurrentConvenio(null);
          }}
          convenio={currentConvenio}
          onConfirmArchive={handleArchivarConvenio}
          loading={archivarLoading}
        />
      )}
    </AdminLayout>
  );
};

export default AdminConvenios;
