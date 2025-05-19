import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminDashboard/AdminLayout';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import TagToggleGroup from '../../../components/Tag/TagToggleGroup';
import TagToggle from '../../../components/Tag/TagToggle';
import styles from './AdminExamenes.module.css';
import axios from 'axios';

// Plus icon for the Add button
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.59995 3.8002C8.59995 3.46882 8.33132 3.2002 7.99995 3.2002C7.66858 3.2002 7.39995 3.46882 7.39995 3.8002V7.4002H3.79995C3.46858 7.4002 3.19995 7.66882 3.19995 8.0002C3.19995 8.33157 3.46858 8.6002 3.79995 8.6002L7.39995 8.6002V12.2002C7.39995 12.5316 7.66858 12.8002 7.99995 12.8002C8.33132 12.8002 8.59995 12.5316 8.59995 12.2002V8.6002L12.2 8.6002C12.5313 8.6002 12.8 8.33157 12.8 8.0002C12.8 7.66883 12.5313 7.4002 12.2 7.4002H8.59995V3.8002Z" fill="var(--sds-color-icon-brand-on-brand, #F0F3FF)" />
  </svg>
);

const API_URL = `${process.env.REACT_APP_API_URL || ''}/api/exams`;

const AdminExamenes = () => {
  // State for exams data
  const [examenes, setExamenes] = useState([]);
  const [filteredExamenes, setFilteredExamenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);

  // Load exams on component mount
  useEffect(() => {
    cargarExamenes();
  }, []);

  // Apply filters when data or filter settings change
  useEffect(() => {
    applyFilters();
  }, [examenes, searchTerm, showArchived, sortAZ]);

  // Fetch exams from API
  const cargarExamenes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setExamenes(res.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar exámenes:", err);
      setError('No se pudieron cargar los exámenes y servicios.');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting to the exam list
  const applyFilters = () => {
    let results = [...examenes];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(e => 
        (e.nombre_examen?.toLowerCase().includes(term) || 
         e.codigo?.toLowerCase().includes(term))
      );
    }
    
    // Filter by archived status
    if (!showArchived) {
      results = results.filter(e => e.is_active !== false);
    }
    
    // Sort by name
    results = results.sort((a, b) => sortAZ
      ? (a.nombre_examen || '').localeCompare(b.nombre_examen || '')
      : (b.nombre_examen || '').localeCompare(a.nombre_examen || '')
    );
    
    setFilteredExamenes(results);
  };

  // Handle "Add" button click
  const handleAgregarClick = () => {
    // This will be implemented in future tasks when modal components are created
    console.log("Agregar examen clicked");
  };

  return (
    <AdminLayout activePage="/admin/examenes">
      <div className={styles.adminExamenesContent}>
        {/* Page header with title and add button */}
        <div className={styles.adminExamenesPageHeader}>
          <div className={styles.adminExamenesMenuHeader}>
            <div className={styles.adminExamenesTitle}>Exámenes y servicios</div>
          </div>
          <Button variant="primary" onClick={handleAgregarClick}>
            <PlusIcon />
            <span>Agregar</span>
          </Button>
        </div>
        
        {/* Filter bar with search, checkbox, and sorting options */}
        <div className={styles.adminExamenesFilterBar}>
          <div className={styles.adminExamenesSearchFilter}>
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar por nombre"
              className={styles.adminExamenesSearchField}
            />
          </div>
          <div className={styles.adminExamenesFilterControls}>
            <div className={styles.adminExamenesCheckboxField}>
              <CheckboxField
                label="Mostrar archivados"
                checked={showArchived}
                onChange={setShowArchived}
              />
            </div>
            <TagToggleGroup className={styles.adminExamenesTagToggleGroup}>
              <TagToggle
                label="A → Z"
                active={sortAZ}
                onChange={() => setSortAZ(true)}
                icon={sortAZ ? "check" : null}
                scheme="brand"
              />
              <TagToggle
                label="Z → A"
                active={!sortAZ}
                onChange={() => setSortAZ(false)}
                scheme="brand"
              />
            </TagToggleGroup>
          </div>
        </div>
        
        {/* Main content area - empty state or list of exams */}
        <div className={styles.adminExamenesBody}>
          {loading ? (
            <div className={styles.adminExamenesEmptyState}>
              <div className={styles.adminExamenesEmptyStateTitleStrong}>Cargando exámenes y servicios...</div>
            </div>
          ) : error ? (
            <div className={styles.adminExamenesEmptyState}>
              <div className={styles.adminExamenesEmptyStateTitleStrong}>{error}</div>
            </div>
          ) : filteredExamenes.length === 0 ? (
            <div className={styles.adminExamenesEmptyState}>
              <div className={styles.adminExamenesEmptyStateTitleStrong}>Aún no has agregado exámenes y/o servicios</div>
              <div className={styles.adminExamenesEmptyStateSubtitle}>Los items que agregues se mostrarán en el cotizador.</div>
            </div>
          ) : (
            <div className={styles.adminExamenesTableContainer}>
              {/* Table will be implemented when required */}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminExamenes;
