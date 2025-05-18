import React, { useState } from 'react';
import { AdminLayout } from '../../../../components/AdminDashboard';
import Button from '../../../../components/Button/Button';
import SearchField from '../../../../components/Inputs/SearchField';
import CheckboxField from '../../../../components/Inputs/CheckboxField';
import Tag from '../../../../components/Tag/Tag';
// Assuming a Table component exists as per the prompt
// import Table from '../../../../components/Tables/Table'; 
import { BuildingOffice2Icon, CheckIcon as CheckIconSolid } from '@heroicons/react/20/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import styles from './AdminConvenios.module.css';
import '../../../../styles/tokens.css'; // Ensure tokens are loaded

const AdminConvenios = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortOrder, setSortOrder] = useState('az'); // 'az' or 'za'
  const [convenios, setConvenios] = useState([]); // Placeholder for convenios data

  // TODO: Fetch convenios data from API and update the `convenios` state

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  // Placeholder for icon components if not directly available
  const BuildingOffice2IconComponent = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M0.800049 2.2001C0.800049 1.86873 1.06868 1.6001 1.40005 1.6001H9.80005C10.1314 1.6001 10.4 1.86873 10.4 2.2001C10.4 2.53147 10.1314 2.8001 9.80005 2.8001H9.60005V13.8001C9.60005 14.1315 9.33142 14.4001 9.00005 14.4001H7.80005C7.46868 14.4001 7.20005 14.1315 7.20005 13.8001V11.8001C7.20005 11.4687 6.93142 11.2001 6.60005 11.2001H4.60005C4.26868 11.2001 4.00005 11.4687 4.00005 11.8001V13.8001C4.00005 14.1315 3.73142 14.4001 3.40005 14.4001H1.40005C1.06868 14.4001 0.800049 14.1315 0.800049 13.8001C0.800049 13.4687 1.06868 13.2001 1.40005 13.2001H1.60005V2.8001H1.40005C1.06868 2.8001 0.800049 2.53147 0.800049 2.2001ZM3.20005 4.4001C3.20005 4.17918 3.37913 4.0001 3.60005 4.0001H4.40005C4.62096 4.0001 4.80005 4.17918 4.80005 4.4001V5.2001C4.80005 5.42101 4.62096 5.6001 4.40005 5.6001H3.60005C3.37913 5.6001 3.20005 5.42101 3.20005 5.2001V4.4001ZM3.60005 7.2001C3.37913 7.2001 3.20005 7.37918 3.20005 7.6001V8.4001C3.20005 8.62101 3.37913 8.8001 3.60005 8.8001H4.40005C4.62096 8.8001 4.80005 8.62101 4.80005 8.4001V7.6001C4.80005 7.37918 4.62096 7.2001 4.40005 7.2001H3.60005ZM6.40005 4.4001C6.40005 4.17918 6.57913 4.0001 6.80005 4.0001H7.60005C7.82096 4.0001 8.00005 4.17918 8.00005 4.4001V5.2001C8.00005 5.42101 7.82096 5.6001 7.60005 5.6001H6.80005C6.57913 5.6001 6.40005 5.42101 6.40005 5.2001V4.4001ZM6.80005 7.2001C6.57913 7.2001 6.40005 7.37918 6.40005 7.6001V8.4001C6.40005 8.62101 6.57913 8.8001 6.80005 8.8001H7.60005C7.82096 8.8001 8.00005 8.62101 8.00005 8.4001V7.6001C8.00005 7.37918 7.82096 7.2001 7.60005 7.2001H6.80005Z" fill="var(--sds-color-icon-brand-on-brand)"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.4 4.8001C11.0687 4.8001 10.8 5.06873 10.8 5.4001V13.6001C10.8 14.0419 11.1582 14.4001 11.6 14.4001H14.6C14.9314 14.4001 15.2 14.1315 15.2 13.8001C15.2 13.4687 14.9314 13.2001 14.6 13.2001H14.4V6.0001H14.6C14.9314 6.0001 15.2 5.73147 15.2 5.4001C15.2 5.06873 14.9314 4.8001 14.6 4.8001H11.4ZM11.8 7.6001C11.8 7.37918 11.9791 7.2001 12.2 7.2001H13C13.221 7.2001 13.4 7.37918 13.4 7.6001V8.4001C13.4 8.62101 13.221 8.8001 13 8.8001H12.2C11.9791 8.8001 11.8 8.62101 11.8 8.4001V7.6001ZM12.2 10.4001C11.9791 10.4001 11.8 10.5792 11.8 10.8001V11.6001C11.8 11.821 11.9791 12.0001 12.2 12.0001H13C13.221 12.0001 13.4 11.821 13.4 11.6001V10.8001C13.4 10.5792 13.221 10.4001 13 10.4001H12.2Z" fill="var(--sds-color-icon-brand-on-brand)"/>
    </svg>
  );
  
  const SearchIconComponent = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 14L11.1 11.1M12.6667 7.33333C12.6667 10.2789 10.2789 12.6667 7.33333 12.6667C4.38781 12.6667 2 10.2789 2 7.33333C2 4.38781 4.38781 2 7.33333 2C10.2789 2 12.6667 4.38781 12.6667 7.33333Z" stroke="var(--sds-color-icon-default-default)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CheckIconComponent = () => (
    <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.8334 4L6.50008 11.3333L3.16675 8" stroke="var(--sds-color-icon-brand-on-brand-secondary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );


  return (
    <AdminLayout activePage="/admin/convenios">
      <div className={styles.adminConveniosPage}>
        <main className={styles.mainContent}>
          <div className={styles.pageHeader}>
            <div className={styles.headerTitle}>Convenios</div>
            <Button
              variant="primary"
              size="medium"
              icon={<BuildingOffice2IconComponent />}
              onClick={() => console.log('Agregar empresa')}
            >
              Agregar empresas con convenio
            </Button>
          </div>

          <div className={styles.filterBar}>
            <div className={styles.searchFilter}>
              <SearchField
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre"
                icon={<SearchIconComponent />}
                className={styles.searchInput}
              />
            </div>
            <CheckboxField
              label="Mostrar archivados"
              checked={showArchived}
              onChange={setShowArchived}
              className={styles.checkboxField}
            />
            <div className={styles.tagToggleGroup}>
              <Tag
                text="A → Z"
                icon={sortOrder === 'az' ? <CheckIconComponent /> : null}
                state={sortOrder === 'az' ? 'on' : 'off'}
                onClick={() => handleSortChange('az')}
                variant={sortOrder === 'az' ? 'brandSecondary' : 'brandTertiary'}
              />
              <Tag
                text="Z → A"
                icon={sortOrder === 'za' ? <CheckIconComponent /> : null}
                state={sortOrder === 'za' ? 'on' : 'off'}
                onClick={() => handleSortChange('za')}
                variant={sortOrder === 'za' ? 'brandSecondary' : 'brandTertiary'}
              />
            </div>
          </div>

          <div className={styles.body}>
            {convenios.length === 0 ? (
              <div className={styles.emptyStateText}>
                Aún no has agregado ningun empresa con convenio
              </div>
            ) : (
              // TODO: Implement Table component to display convenios
              // <Table data={convenios} columns={...} />
              <div>Tabla de convenios aquí</div>
            )}
          </div>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AdminConvenios;
