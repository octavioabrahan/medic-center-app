import { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import { BuildingOffice2Icon, CheckIcon } from '@heroicons/react/20/solid';
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
              onClick={() => {}}
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
        
        <div className="admin-convenios__body">
          <div className="admin-convenios__empty-state">
            <div className="admin-convenios__empty-title">
              Aún no has agregado ninguna empresa con convenio
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminConvenios;
