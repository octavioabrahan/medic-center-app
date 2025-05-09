import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format } from 'date-fns';
import { AdminLayout } from '../../components/layouts';
import Calendar from '../../components/common/Calendar';
import styles from './CitasPage.module.css';

/**
 * Página para gestionar las citas agendadas en el área administrativa
 */
const CitasPage = () => {
  // Estados para almacenar los datos
  const [agendamientos, setAgendamientos] = useState([]);
  const [filteredAgendamientos, setFilteredAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [profesionales, setProfesionales] = useState([]);
  const [filtroProfesional, setFiltroProfesional] = useState("todos");
  const [sortOrder, setSortOrder] = useState("az");

  // Referencia para el selector de fechas
  const datePickerRef = useRef(null);

  // Estados para el calendario
  const [dateRange, setDateRange] = useState(() => {
    // Obtener la fecha del lunes de la semana actual
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    
    // Obtener el domingo de la semana actual
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return {
      from: monday,
      to: sunday
    };
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados para modales
  const [currentAgendamiento, setCurrentAgendamiento] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Detectar clics fuera del selector de fechas para cerrarlo
  useEffect(() => {
    function handleClickOutside(event) {
      if (!showDatePicker) return;
      
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  // Obtener agendamientos desde la API
  const fetchAgendamientos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('desde', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.append('hasta', format(dateRange.to, 'yyyy-MM-dd'));
      
      const response = await axios.get(`/api/agendamiento?${params.toString()}`);
      
      setAgendamientos(response.data);
      applyFilters(response.data);
      
    } catch (err) {
      if (err.response && err.response.status === 429) {
        setTimeout(fetchAgendamientos, 2000);
        return;
      }
      
      setError('No se pudieron cargar los agendamientos. Por favor, intenta de nuevo.');
      setAgendamientos([]);
      setFilteredAgendamientos([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar profesionales al montar el componente
  const fetchProfesionales = async () => {
    try {
      const profData = await axios.get("/api/profesionales");
      setProfesionales(profData.data);
    } catch (err) {
      console.error('Error cargando profesionales:', err);
    }
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    fetchAgendamientos();
    fetchProfesionales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aplicar filtros cuando cambian los criterios
  const applyFilters = (data = agendamientos) => {
    if (!data || data.length === 0) {
      setFilteredAgendamientos([]);
      return;
    }
    
    let results = [...data];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(agendamiento => 
        `${agendamiento.paciente_nombre || ''} ${agendamiento.paciente_apellido || ''}`.toLowerCase().includes(term) ||
        (agendamiento.cedula || '').toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    if (filterStatus !== 'todos') {
      results = results.filter(agendamiento => {
        return agendamiento.status && agendamiento.status.toLowerCase() === filterStatus.toLowerCase();
      });
    }
    
    // Filtrar por profesional
    if (filtroProfesional !== 'todos') {
      results = results.filter(agendamiento => 
        agendamiento.profesional_id === filtroProfesional
      );
    }
    
    // Aplicar ordenamiento alfabético por nombre de paciente
    if (sortOrder === 'az') {
      results.sort((a, b) => {
        const nameA = `${a.paciente_nombre || ''} ${a.paciente_apellido || ''}`.toLowerCase();
        const nameB = `${b.paciente_nombre || ''} ${b.paciente_apellido || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortOrder === 'za') {
      results.sort((a, b) => {
        const nameA = `${a.paciente_nombre || ''} ${a.paciente_apellido || ''}`.toLowerCase();
        const nameB = `${b.paciente_nombre || ''} ${b.paciente_apellido || ''}`.toLowerCase();
        return nameB.localeCompare(nameA);
      });
    }
    
    setFilteredAgendamientos(results);
  };

  // Reaccionar a cambios en los filtros
  useEffect(() => {
    if (agendamientos.length > 0) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filtroProfesional, sortOrder]);

  // Obtener datos nuevamente cuando cambia el rango de fechas
  useEffect(() => {
    let timeoutId;
    
    if (dateRange.from && dateRange.to) {
      timeoutId = setTimeout(() => {
        fetchAgendamientos();
      }, 300);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [dateRange.from, dateRange.to]);

  // Cambiar estado de agendamiento
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`/api/agendamiento/${id}`, { status: nuevoEstado });
      
      const updatedAgendamientos = agendamientos.map(agendamiento => 
        agendamiento.agendamiento_id === id ? { ...agendamiento, status: nuevoEstado } : agendamiento
      );
      
      setAgendamientos(updatedAgendamientos);
      applyFilters(updatedAgendamientos);

      if (currentAgendamiento && currentAgendamiento.agendamiento_id === id) {
        setCurrentAgendamiento({...currentAgendamiento, status: nuevoEstado});
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar el estado del agendamiento.');
    }
  };

  // Manejar clic en el input de fecha
  const handleDateInputClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDatePicker(prevState => !prevState);
  };

  // Manejar cambio de rango de fechas desde el calendario
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  // Formatear fecha para mostrar en la tabla
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const diaSemana = diasSemana[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    let horas = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const ampm = horas >= 12 ? 'PM' : 'AM';
    horas = horas % 12 || 12;
    return { 
      fecha: `${diaSemana} ${dia} ${mes}`, 
      hora: `${horas}:${minutos} ${ampm}` 
    };
  };

  // Formatear rango de fechas para mostrar en el botón
  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) return "Seleccionar fechas";
    return `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`;
  };

  // Mostrar detalles del agendamiento
  const mostrarDetalles = (agendamiento) => {
    setCurrentAgendamiento(agendamiento);
    setShowDetailModal(true);
  };

  // Renderizar tabla de agendamientos
  const renderAgendamientosTable = () => {
    if (loading) return <div className={styles.loadingContainer}>Cargando citas...</div>;
    if (error) return <div className={styles.errorMessage}>{error}</div>;
    if (filteredAgendamientos.length === 0) return <div className={styles.noResults}>No se encontraron citas</div>;

    return (
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th> {/* Columna para icono de maletín */}
              <th>Fecha cita</th>
              <th>Paciente</th>
              <th>Cédula</th>
              <th>Categoría</th>
              <th>Profesional</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgendamientos.map(agendamiento => {
              const fecha = new Date(agendamiento.fecha_agendada);
              const formatoFecha = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              
              return (
                <tr key={agendamiento.agendamiento_id}>
                  <td className={styles.empresaCell}>
                    {agendamiento.id_empresa && (
                      <div className={styles.tooltip}>
                        <div className={styles.empresaIcon}>💼</div>
                        <span className={styles.tooltipText}>Agendamiento con convenio</span>
                      </div>
                    )}
                  </td>
                  <td>{formatoFecha}</td>
                  <td>{agendamiento.paciente_nombre} {agendamiento.paciente_apellido}</td>
                  <td>{agendamiento.cedula}</td>
                  <td>{agendamiento.tipo_atencion}</td>
                  <td>{agendamiento.profesional_nombre} {agendamiento.profesional_apellido}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${agendamiento.status ? agendamiento.status.charAt(0).toUpperCase() + agendamiento.status.slice(1) : 'Pendiente'}`]}`}>
                      {agendamiento.status || 'Sin estado'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button 
                      className={`${styles.btnAction} ${styles.btnView}`} 
                      onClick={() => mostrarDetalles(agendamiento)}
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    {agendamiento.status && agendamiento.status.toLowerCase() === 'pendiente' && (
                      <button
                        onClick={() => actualizarEstado(agendamiento.agendamiento_id, "confirmada")}
                        className={`${styles.btnAction} ${styles.btnConfirm}`}
                        title="Confirmar"
                      >
                        ✓
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderizar modal con detalles del agendamiento
  const renderDetailModal = () => {
    if (!showDetailModal || !currentAgendamiento) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>Detalles del Agendamiento</h2>
            <button className={styles.closeBtn} onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.detailSection}>
              <h3>Información General</h3>
              <div className={styles.detailGrid}>
                <div>
                  <strong>ID:</strong> {currentAgendamiento.agendamiento_id}
                </div>
                <div>
                  <strong>Fecha:</strong> {formatearFecha(currentAgendamiento.fecha_agendada).fecha}
                </div>
                <div>
                  <strong>Hora:</strong> {formatearFecha(currentAgendamiento.fecha_agendada).hora}
                </div>
                <div>
                  <strong>Estado:</strong> 
                  <span className={`${styles.statusBadge} ${styles[`status${currentAgendamiento.status ? currentAgendamiento.status.charAt(0).toUpperCase() + currentAgendamiento.status.slice(1) : 'Pendiente'}`]}`}>
                    {currentAgendamiento.status || 'Sin estado'}
                  </span>
                </div>
                <div>
                  <strong>Tipo:</strong> {currentAgendamiento.tipo_atencion}
                </div>
                {currentAgendamiento.id_empresa && (
                  <div>
                    <strong>Empresa:</strong> {currentAgendamiento.nombre_empresa || 'Convenio empresarial'}
                  </div>
                )}
                {currentAgendamiento.id_empresa && currentAgendamiento.archivo_adjunto_id && (
                  <div>
                    <strong>Orden médica:</strong>
                    <div className={styles.ordenMedicaContainer}>
                      <div>
                        <a 
                          href={`${process.env.REACT_APP_API_URL || ''}/api/archivos/${currentAgendamiento.archivo_adjunto_id}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={styles.documentLink}
                        >
                          Ver documento
                        </a>
                        <a 
                          href={`${process.env.REACT_APP_API_URL || ''}/api/archivos/${currentAgendamiento.archivo_adjunto_id}?download=true`}
                          download
                          className={styles.documentLink}
                        >
                          Descargar documento
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Información del Paciente</h3>
              <div className={styles.detailGrid}>
                <div>
                  <strong>Nombre:</strong> {currentAgendamiento.paciente_nombre} {currentAgendamiento.paciente_apellido}
                </div>
                <div>
                  <strong>Cédula:</strong> {currentAgendamiento.cedula}
                </div>
                <div>
                  <strong>Email:</strong> {currentAgendamiento.paciente_email || 'No disponible'}
                </div>
                <div>
                  <strong>Teléfono:</strong> {currentAgendamiento.paciente_telefono || 'No disponible'}
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Profesional</h3>
              <div className={styles.detailGrid}>
                <div>
                  <strong>Nombre:</strong> {currentAgendamiento.profesional_nombre} {currentAgendamiento.profesional_apellido}
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3>Servicios</h3>
              <p>{currentAgendamiento.observaciones || 'No se especificaron servicios'}</p>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <div className={styles.estadoSelector}>
              <label>Cambiar estado:</label>
              <div className={styles.estadoButtons}>
                <button 
                  className={`${styles.estadoBtn} ${styles.estadoPendiente} ${currentAgendamiento.status === 'pendiente' ? styles.active : ''}`}
                  onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "pendiente")}
                >
                  Pendiente
                </button>
                <button 
                  className={`${styles.estadoBtn} ${styles.estadoConfirmada} ${currentAgendamiento.status === 'confirmada' ? styles.active : ''}`}
                  onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "confirmada")}
                >
                  Confirmada
                </button>
                <button 
                  className={`${styles.estadoBtn} ${styles.estadoCancelada} ${currentAgendamiento.status === 'cancelada' ? styles.active : ''}`}
                  onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "cancelada")}
                >
                  Cancelada
                </button>
              </div>
            </div>
            <button className={styles.btnSecondary} onClick={() => setShowDetailModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Datos para las migas de pan
  const breadcrumbs = [
    { label: 'Citas agendadas' }
  ];

  return (
    <AdminLayout 
      title="Citas agendadas" 
      breadcrumbs={breadcrumbs}
    >
      <div className={styles.filterSection}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
        
        <div className={styles.filterControls}>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          
          <select 
            value={filtroProfesional}
            onChange={(e) => setFiltroProfesional(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="todos">Todos los profesionales</option>
            {profesionales.map((prof) => (
              <option key={prof.profesional_id} value={prof.profesional_id}>
                {prof.nombre} {prof.apellido}
              </option>
            ))}
          </select>
          
          <div className={styles.datePickerWrapper} ref={datePickerRef}>
            <div 
              className={styles.dateInputWrapper}
              onClick={handleDateInputClick}
            >
              <span className={styles.calendarIcon}>📅</span>
              <span className={styles.dateInput}>{formatDateRange()}</span>
            </div>
            
            {showDatePicker && (
              <div 
                className={styles.calendarDropdown}
                onClick={e => e.stopPropagation()}
              >
                <Calendar
                  initialDateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  onClose={() => setShowDatePicker(false)}
                  showPresets={true}
                />

                <div className={styles.calendarActions}>
                  <button 
                    className={styles.btnPrimary}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      fetchAgendamientos();
                      setShowDatePicker(false);
                    }}
                  >
                    Aplicar
                  </button>
                  <button 
                    className={styles.btnSecondary}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDatePicker(false);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.sortButtons}>
            <button 
              className={`${styles.sortBtn} ${sortOrder === 'az' ? styles.active : ''}`}
              onClick={() => setSortOrder('az')}
              title="Ordenar de A a Z"
            >
              A → Z
            </button>
            <button 
              className={`${styles.sortBtn} ${sortOrder === 'za' ? styles.active : ''}`}
              onClick={() => setSortOrder('za')}
              title="Ordenar de Z a A"
            >
              Z → A
            </button>
          </div>
        </div>
      </div>
      
      {renderAgendamientosTable()}
      {renderDetailModal()}
    </AdminLayout>
  );
};

export default CitasPage;