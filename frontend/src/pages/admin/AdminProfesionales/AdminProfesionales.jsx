import React, { useState } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import SelectField from '../../../components/Inputs/SelectField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import TagToggle from '../../../components/Tag/TagToggle';
import { UserPlusIcon, CheckIcon } from '@heroicons/react/20/solid';
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

  // Dummy data for specialty options
  const especialidadesOptions = [
    { label: 'Todas las especialidades', value: '' },
    { label: 'Cardiología', value: 'cardiologia' },
    { label: 'Dermatología', value: 'dermatologia' },
    { label: 'Medicina General', value: 'medicina-general' }
  ];

  return (
    <AdminLayout activePage="/admin/profesionales">
      <div className="admin-profesionales">
        <div className="admin-profesionales__page-header">
          <div className="admin-profesionales__menu-header">
            <div className="admin-profesionales__text-strong">Profesionales</div>
          </div>
          <div className="admin-profesionales__button-group">
            <Button variant="neutral">
              Crear especialidad
            </Button>
            <Button
              variant="primary"
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
            <TagToggle
              label="A → Z"
              active={sortAZ}
              onChange={() => setSortAZ(true)}
            />
            <TagToggle
              label="Z → A"
              active={!sortAZ}
              onChange={() => setSortAZ(false)}
            />
          </div>
        </div>
        
        <div className="admin-profesionales__empty-state">
          <div className="admin-profesionales__empty-title">
            Aún no has agregado profesionales
          </div>
          <div className="admin-profesionales__empty-description">
            Cada profesional debe tener una especialidad asignada y al menos un servicio activo para mostrarse en el sitio de agendamiento.
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfesionales;
