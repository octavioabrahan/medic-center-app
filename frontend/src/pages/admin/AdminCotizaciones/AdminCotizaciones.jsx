import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import SearchField from '../../../components/Inputs/SearchField';
import SelectField from '../../../components/Inputs/SelectField';
import TagToggleGroup from '../../../components/Tag/TagToggleGroup';
import TagToggle from '../../../components/Tag/TagToggle';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import styles from './AdminCotizaciones.module.css';
import { CheckIcon } from '@heroicons/react/20/solid';
import axios from 'axios';

/**
 * AdminCotizaciones component for managing quotes in the admin dashboard
 */
const AdminCotizaciones = () => {
  // State for filters and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortRecent, setSortRecent] = useState(true);
  
  // API data state
  const [cotizaciones, setCotizaciones] = useState([]);
  const [filteredCotizaciones, setFilteredCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasaCambio, setTasaCambio] = useState(0);
  
  // API URL
  const API_URL = `${process.env.REACT_APP_API_URL || ''}/api`;

  // Estados para filtro
  const estadosOptions = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'confirmado', label: 'Confirmados' },
    { value: 'cancelado', label: 'Cancelados' },
    { value: 'completado', label: 'Completados' }
  ];

  // Cargar cotizaciones y tasa de cambio al montar el componente
  useEffect(() => {
    fetchCotizaciones();
    fetchTasaCambio();
  }, []);

  // Obtener cotizaciones desde la API
  const fetchCotizaciones = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/quotes`);
      setCotizaciones(res.data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar las cotizaciones.');
      console.error('Error al cargar cotizaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener tasa de cambio
  const fetchTasaCambio = async () => {
    try {
      const res = await axios.get(`${API_URL}/exchange-rate/latest`);
      setTasaCambio(res.data.tasa || 0);
    } catch (err) {
      console.error('Error al obtener tasa de cambio:', err);
    }
  };

  // Filtrar cotizaciones cuando cambian los criterios
  useEffect(() => {
    if (cotizaciones.length > 0) {
      let results = [...cotizaciones];
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(c => 
          c.folio?.toLowerCase().includes(term) || 
          `${c.nombre} ${c.apellido}`.toLowerCase().includes(term) ||
          c.cedula_cliente?.toLowerCase().includes(term)
        );
      }
      
      // Filtrar por estado
      if (filterStatus !== 'todos') {
        results = results.filter(c => c.estado === filterStatus);
      }
      
      // Ordenar por fecha
      results = results.sort((a, b) => {
        const dateA = new Date(a.fecha_creacion);
        const dateB = new Date(b.fecha_creacion);
        return sortRecent ? dateB - dateA : dateA - dateB;
      });
      
      // Mapear datos para la tabla con formato
      const formattedResults = results.map(cot => {
        // Formatear fecha
        const fecha = new Date(cot.fecha_creacion);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        
        // Determinar clase de estado para el estilo
        const statusClass = 
          cot.estado === 'pendiente' ? 'pending' : 
          cot.estado === 'confirmado' ? 'confirmed' : 
          cot.estado === 'completado' ? 'completed' : 
          'cancelled';
        
        // Crear etiqueta de estado
        const estadoTag = (
          <Tag 
            text={cot.estado.charAt(0).toUpperCase() + cot.estado.slice(1)}
            scheme={
              cot.estado === 'pendiente' ? 'warning' : 
              cot.estado === 'confirmado' ? 'brand' : 
              cot.estado === 'completado' ? 'positive' : 
              'neutral'
            }
            variant="secondary"
            closeable={false}
          />
        );
        
        return {
          ...cot,
          cliente: `${cot.nombre} ${cot.apellido}`,
          fecha_formateada: fechaFormateada,
          estado_tag: estadoTag,
          total_ves: (cot.total_usd * tasaCambio).toFixed(2) + ' Bs'
        };
      });
      
      setFilteredCotizaciones(formattedResults);
    } else {
      setFilteredCotizaciones([]);
    }
  }, [cotizaciones, searchTerm, filterStatus, sortRecent, tasaCambio]);

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
            placeholder="Buscar por folio, cliente o cédula"
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
        ) : error ? (
          <div className={styles.text}>
            <div className={styles.errorMessage}>{error}</div>
          </div>
        ) : cotizaciones.length === 0 ? (
          <div className={styles.text}>
            <div className={styles.emptyMessage}>
              Aún no has recibido una cotización
            </div>
          </div>
        ) : (
          <Table
            headers={["Folio", "Cliente", "Cédula", "Fecha", "Total USD", "Total VES", "Estado"]}
            data={filteredCotizaciones}
            columns={["folio", "cliente", "cedula_cliente", "fecha_formateada", "total_usd", "total_ves", "estado_tag"]}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCotizaciones;
