import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import SearchField from '../../../components/Inputs/SearchField';
import SelectField from '../../../components/Inputs/SelectField';
import TagToggleGroup from '../../../components/Tag/TagToggleGroup';
import TagToggle from '../../../components/Tag/TagToggle';
import Table from '../../../components/Tables/Table';
import styles from './AdminCotizaciones.module.css';
import { CheckIcon } from '@heroicons/react/20/solid';

/**
 * AdminCotizaciones component for managing quotes in the admin dashboard
 */
const AdminCotizaciones = () => {
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortRecent, setSortRecent] = useState(true);
  
  // Mock data - In real application this would come from an API
  const [cotizaciones, setCotizaciones] = useState([]);
  const [filteredCotizaciones, setFilteredCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtro
  const estadosOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'processed', label: 'Procesadas' },
    { value: 'canceled', label: 'Canceladas' }
  ];

  // Simulating API call (would be replaced with actual API)
  useEffect(() => {
    // Simulate API loading delay
    setTimeout(() => {
      setLoading(false);
      // This would normally be fetched from an API
      setCotizaciones([]); // Empty array for the initial state
    }, 500);
  }, []);

  // Filter and sort based on user selections
  useEffect(() => {
    let results = [...cotizaciones];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(c => 
        c.folio?.toLowerCase().includes(term) || 
        c.cliente?.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      results = results.filter(c => c.status === filterStatus);
    }
    
    // Sort by date
    results = results.sort((a, b) => {
      if (sortRecent) {
        return new Date(b.fecha) - new Date(a.fecha);
      } else {
        return new Date(a.fecha) - new Date(b.fecha);
      }
    });
    
    setFilteredCotizaciones(results);
  }, [cotizaciones, searchTerm, filterStatus, sortRecent]);

  return (
    <AdminLayout activePage="/admin/cotizaciones">
      <div className={styles.pageHeader}>
        <div className={styles.menuHeader}>
          <div className={styles.textStrong}>Cotizaciones recibidas</div>
        </div>
      </div>
      
      <div className={styles.filterBar}>
        <div className={styles.searchFilter}>
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm('')}
            placeholder="Buscar por nombre"
            className={styles.searchField}
          />
        </div>
        
        <div className={styles.selectField}>
          <SelectField
            value={filterStatus}
            onChange={setFilterStatus}
            options={estadosOptions}
            label=""
            placeholder="Todos los estados"
          />
        </div>
        
        <TagToggleGroup className={styles.tagToggleGroup}>
          <TagToggle
            label="Más reciente"
            active={sortRecent}
            onChange={() => setSortRecent(true)}
            scheme="brand"
          />
          <TagToggle
            label="Más antigüo"
            active={!sortRecent}
            onChange={() => setSortRecent(false)}
            scheme="brand"
          />
        </TagToggleGroup>
      </div>
      
      <div className={styles.body}>
        {loading ? (
          <div className={styles.text}>Cargando cotizaciones...</div>
        ) : cotizaciones.length === 0 ? (
          <div className={styles.text}>
            <div className={styles.emptyMessage}>
              Aún no has recibido una cotización
            </div>
          </div>
        ) : (
          <Table
            headers={["Folio", "Cliente", "Fecha", "Estado", "Acciones"]}
            data={filteredCotizaciones}
            columns={["folio", "cliente", "fecha_formateada", "estado_tag", "acciones"]}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCotizaciones;
