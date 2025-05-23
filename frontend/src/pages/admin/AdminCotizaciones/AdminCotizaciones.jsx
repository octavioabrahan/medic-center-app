import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../../components/AdminDashboard';
import SearchField from '../../../components/Inputs/SearchField';
import SelectField from '../../../components/Inputs/SelectField';
import TagToggleGroup from '../../../components/Tag/TagToggleGroup';
import TagToggle from '../../../components/Tag/TagToggle';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import Button from '../../../components/Button/Button';
import styles from './AdminCotizaciones.module.css';
import { PencilSquareIcon } from '@heroicons/react/20/solid';
import axios from 'axios';
import SeguimientoCotizaciones from './SeguimientoCotizaciones';

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
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [showSeguimiento, setShowSeguimiento] = useState(false);
  
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

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    fetchCotizaciones();
  }, []);

  // Obtener cotizaciones desde la API
  const fetchCotizaciones = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/cotizaciones`);
      setCotizaciones(res.data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar las cotizaciones.');
      console.error('Error al cargar cotizaciones:', err);
    } finally {
      setLoading(false);
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
          `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase().includes(term) ||
          c.cedula_cliente?.toLowerCase().includes(term)
        );
      }
      
      // Filtrar por estado
      if (filterStatus !== 'todos') {
        results = results.filter(c => c.estado === filterStatus);
      }
      
      // Ordenar por fecha
      results = results.sort((a, b) => {
        const dateA = new Date(a.fecha_creacion || a.fecha || Date.now());
        const dateB = new Date(b.fecha_creacion || b.fecha || Date.now());
        return sortRecent ? dateB - dateA : dateA - dateB;
      });
      
      // Mapear datos para la tabla con formato
      const formattedResults = results.map(cot => {
        // Formatear fecha
        const fecha = new Date(cot.fecha_creacion || cot.fecha || Date.now());
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit'
        });
        
        // Formatear total USD
        const totalUsd = typeof cot.total_usd === 'number' ? cot.total_usd : 
                       parseFloat(cot.total_usd) || 0;
        
        // Crear etiqueta de estado
        const estado = cot.estado || 'pendiente';
        const estadoTag = (
          <Tag 
            text={estado.charAt(0).toUpperCase() + estado.slice(1)}
            scheme={
              estado === 'pendiente' ? 'warning' : 
              estado === 'confirmado' ? 'brand' : 
              estado === 'completado' ? 'positive' : 
              estado === 'cancelado' ? 'danger' :
              'neutral'
            }
            variant="secondary"
            closeable={false}
          />
        );
        
        // Crear acción con botón de editar
        const accion = (
          <button 
            className="btn btn--icon btn--subtle btn--medium"
            title="Procesar cotización"
            onClick={(e) => {
              e.stopPropagation(); // Evitar que el evento se propague
              handleProcessCotizacion(cot);
            }}
          >
            <PencilSquareIcon width={20} height={20} className="btn__icon" />
          </button>
        );
        
        return {
          ...cot,
          cliente: `${cot.nombre || ''} ${cot.apellido || ''}`.trim(),
          fecha_formateada: fechaFormateada,
          estado_tag: estadoTag,
          total_usd: totalUsd.toFixed(2) + ' $',
          accion: accion
        };
      });
      
      setFilteredCotizaciones(formattedResults);
    } else {
      setFilteredCotizaciones([]);
    }
  }, [cotizaciones, searchTerm, filterStatus, sortRecent]);

  // Manejador para procesar cotización
  const handleProcessCotizacion = async (cotizacion) => {
    try {
      // Obtener los detalles completos de la cotización
      const response = await axios.get(`${API_URL}/cotizaciones/${cotizacion.id_cotizacion || cotizacion.id_unico}`);
      if (response.data) {
        setSelectedCotizacion(response.data);
        setShowSeguimiento(true);
      }
    } catch (err) {
      console.error('Error al cargar detalles de la cotización:', err);
      // Si hay error, intentar mostrar con los datos disponibles
      setSelectedCotizacion(cotizacion);
      setShowSeguimiento(true);
    }
  };

  // Cerrar modal de seguimiento y refrescar datos
  const handleCloseSeguimiento = () => {
    setShowSeguimiento(false);
    // Refrescar la lista de cotizaciones para mostrar cambios de estado
    fetchCotizaciones();
  };

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
        ) : filteredCotizaciones.length === 0 ? (
          <div className={styles.text}>
            <div className={styles.emptyMessage}>
              No se encontraron cotizaciones que coincidan con los criterios de búsqueda
            </div>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <Table
              headers={["Folio", "Cliente", "Cédula", "Fecha", "Total USD", "Estado", "Acción"]}
              data={filteredCotizaciones}
              columns={["folio", "cliente", "cedula_cliente", "fecha_formateada", "total_usd", "estado_tag", "accion"]}
              className={styles.horizontalScrollTable}
            />
          </div>
        )}
      </div>

      {showSeguimiento && selectedCotizacion && (
        <SeguimientoCotizaciones 
          cotizacion={selectedCotizacion} 
          onClose={handleCloseSeguimiento} 
        />
      )}
    </AdminLayout>
  );
};

export default AdminCotizaciones;
