// src/pages/admin/AdminCitasAgendadas.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminDashboard';
import SearchField from '../../components/Inputs/SearchField';
import SelectField from '../../components/Inputs/SelectField';
import Calendar from '../../components/common/Calendar';
import Table from '../../components/Tables/Table';
import Tag from '../../components/Tag/Tag';
import Button from '../../components/Button/Button';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import './AdminCitasAgendadas.css';
import './AdminCitasAgendadasModal.css';

/**
 * Componente para la gestión de citas agendadas en el panel de administración
 */
const AdminCitasAgendadas = () => {
  // Estados para almacenar los datos
  const [agendamientos, setAgendamientos] = useState([]);
  const [filteredAgendamientos, setFilteredAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [profesionales, setProfesionales] = useState([]);
  const [sortOrder, setSortOrder] = useState("az"); // Ordenamiento alfabético
  
  // Estados para modales
  const [currentAgendamiento, setCurrentAgendamiento] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Estados para el selector de fechas
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);
  
  // Estados para el calendario
  const [dateRange, setDateRange] = useState(() => {
    // Obtener la fecha del lunes de la semana actual
    const today = new Date();
    const day = today.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    const diff = day === 0 ? -6 : 1 - day; // Si es domingo, retrocedemos 6 días, sino calculamos distancia a lunes
    
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
  
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Opciones para el dropdown de estados
  const statusOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Confirmada', value: 'confirmada' },
    { label: 'Pendiente', value: 'pendiente' },
    { label: 'Cancelada', value: 'cancelada' }
  ];
  
  // Obtener agendamientos desde la API
  const fetchAgendamientos = useCallback(async () => {
    setLoading(true);
    try {
      // Agregar un pequeño retraso para evitar múltiples llamadas
      const params = new URLSearchParams();
      if (dateRange.from) params.append('desde', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.append('hasta', format(dateRange.to, 'yyyy-MM-dd'));
      
      const response = await axios.get(`/api/agendamiento?${params.toString()}`);
      console.log("Datos cargados de la API:", response.data);
      
      // Guardar los datos originales
      setAgendamientos(response.data);
      
      // Inicialmente mostrar todos los datos sin filtrar
      applyFilters(response.data);
      
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.error('Error: Demasiadas solicitudes. Esperando un momento...');
        // Esperar 2 segundos y reintentar
        setTimeout(fetchAgendamientos, 2000);
        return;
      }
      
      console.error('Error:', err);
      setError('No se pudieron cargar los agendamientos. Por favor, intenta de nuevo.');
      // Asegurarse de limpiar los datos cuando hay un error
      setAgendamientos([]);
      setFilteredAgendamientos([]);
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

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
  }, [fetchAgendamientos]);

  // Aplicar filtros cuando cambian los criterios
  const applyFilters = useCallback((data = agendamientos) => {
    // Si no hay datos, establecer una lista vacía y retornar
    if (!data || data.length === 0) {
      setFilteredAgendamientos([]);
      return;
    }
    
    console.log("Aplicando filtros a", data.length, "registros");
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
    if (selectedStatus !== '') {
      results = results.filter(agendamiento => {
        return agendamiento.status && agendamiento.status.toLowerCase() === selectedStatus.toLowerCase();
      });
    }
    
    // Filtrar por profesional
    if (selectedProfessional !== '') {
      results = results.filter(agendamiento => 
        agendamiento.profesional_id === selectedProfessional
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
    
    console.log("Resultados filtrados:", results.length);
    setFilteredAgendamientos(results);
  }, [agendamientos, searchTerm, selectedStatus, selectedProfessional, sortOrder]);

  // Reaccionar a cambios en los filtros
  useEffect(() => {
    // Solo aplicar filtros si ya tenemos datos cargados
    if (agendamientos.length > 0) {
      applyFilters();
    }
  }, [agendamientos, applyFilters]);
  
  // Detectar clics fuera del selector de fechas para cerrarlo
  useEffect(() => {
    function handleClickOutside(event) {
      // Solo ejecutar si el calendario está visible
      if (!showDatePicker) return;
      
      // Verificar si el clic fue dentro del selector de fechas
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }

    // Agregar el event listener cuando el componente se monta o cuando showDatePicker cambia
    document.addEventListener("mousedown", handleClickOutside);
    
    // Limpiar el event listener cuando el componente se desmonta o showDatePicker cambia
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  // Obtener datos nuevamente cuando cambia el rango de fechas
  useEffect(() => {
    let timeoutId;
    
    if (dateRange.from && dateRange.to) {
      // Añadir un retraso para evitar múltiples llamadas rápidas
      timeoutId = setTimeout(() => {
        fetchAgendamientos();
      }, 300);
    }
    
    // Limpieza del timeout si el componente se desmonta o el rango cambia nuevamente
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [dateRange.from, dateRange.to, fetchAgendamientos]);
  
  // Función para manejar el cambio de rango de fechas desde el calendario
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    setShowDatePicker(false); // Cerrar el calendario después de seleccionar
  };
  
  // Cambiar estado de agendamiento
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      // Variable para mostrar mensajes de estado
      let statusMessage;
      
      if (nuevoEstado === 'confirmada') {
        statusMessage = 'Cita confirmada exitosamente';
      } else if (nuevoEstado === 'cancelada') {
        statusMessage = 'Cita cancelada correctamente';
      } else if (nuevoEstado === 'pendiente') {
        statusMessage = 'Cita marcada como pendiente';
      }
      
      await axios.put(`/api/agendamiento/${id}`, { status: nuevoEstado });
      
      // Actualizar estado en la lista local
      const updatedAgendamientos = agendamientos.map(agendamiento => 
        agendamiento.agendamiento_id === id ? { ...agendamiento, status: nuevoEstado } : agendamiento
      );
      
      setAgendamientos(updatedAgendamientos);
      
      // Volver a aplicar filtros para actualizar la vista
      applyFilters(updatedAgendamientos);

      // Si el agendamiento está siendo mostrado en detalle, actualizar su estado
      if (currentAgendamiento && currentAgendamiento.agendamiento_id === id) {
        setCurrentAgendamiento({...currentAgendamiento, status: nuevoEstado});
      }
      
      // Aquí podemos mostrar un mensaje de éxito al usuario (por ejemplo usando un sistema de notificaciones)
      console.log(statusMessage);
      // Si hay un sistema de notificaciones, podríamos usar algo como:
      // toast.success(statusMessage);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar el estado del agendamiento.');
      // Si hay un sistema de notificaciones:
      // toast.error('Error al actualizar el estado del agendamiento.');
    }
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
  
  // Mostrar detalles del agendamiento
  const mostrarDetalles = (agendamiento) => {
    setCurrentAgendamiento(agendamiento);
    setShowDetailModal(true);
  };
  
  return (
    <AdminLayout activePage="/admin/citas-agendadas">
      <div className="admin-citas-agendadas">
        <div className="admin-citas-agendadas__page-header">
          <div className="admin-citas-agendadas__menu-header">
            <div className="admin-citas-agendadas__text-strong">
              <div className="admin-citas-agendadas__title">
                Citas agendadas
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-citas-agendadas__filter-bar">
          <div className="admin-citas-agendadas__search-container">
            <SearchField 
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              placeholder="Buscar por nombre o cédula"
              className="admin-citas-agendadas__search"
            />
          </div>
          
          <div className="admin-citas-agendadas__select-container">
            <SelectField
              options={statusOptions}
              value={selectedStatus}
              placeholder="Todos los estados"
              onChange={(value) => setSelectedStatus(value)}
            />
          </div>
          
          <div className="admin-citas-agendadas__select-container">
            <div className="select-field state-default value-type-value" ref={datePickerRef}>
              <div 
                className="select select-native-wrapper"
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                }}
              >
                <span className="select-native">{format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="heroicons-micro-chevron-down" width="20" height="20">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
              
              {showDatePicker && (
                <div 
                  className="admin-citas-agendadas__calendar-dropdown"
                  onClick={e => e.stopPropagation()}
                >
                  <Calendar
                    initialDateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    onClose={() => setShowDatePicker(false)}
                    showPresets={true}
                    title="Seleccione rango de fechas"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="admin-citas-agendadas__select-container">
            <SelectField
              options={profesionales.map(prof => ({ 
                label: `${prof.nombre} ${prof.apellido}`, 
                value: prof.profesional_id 
              }))}
              value={selectedProfessional}
              placeholder="Todos los profesionales"
              onChange={(value) => setSelectedProfessional(value)}
            />
          </div>
        </div>
        
        <div className="admin-citas-agendadas__body">
          {loading ? (
            <div className="admin-citas-agendadas__loading">Cargando citas...</div>
          ) : error ? (
            <div className="admin-citas-agendadas__error">{error}</div>
          ) : filteredAgendamientos.length === 0 ? (
            <div className="admin-citas-agendadas__text">
              <div className="admin-citas-agendadas__no-citas">
                Aún no hay citas agendadas
              </div>
              <div className="admin-citas-agendadas__description">
                Las citas que los pacientes registren desde el sitio de agendamiento aparecerán aquí.
                <br />
                Una vez se genere la primera cita, podrás gestionarla, filtrar por estado, y ver todos los detalles asociados.
              </div>
            </div>
          ) : (
            <div className="admin-citas-agendadas__table-container">
              <Table 
                headers={["", "Fecha cita", "Paciente", "Cédula", "Categoría", "Profesional", "Estado", "Acciones"]} 
                data={filteredAgendamientos.map(agendamiento => ({
                  ...agendamiento,
                  onRowClick: () => mostrarDetalles(agendamiento)
                }))}
                columns={["iconoEmpresa", "fecha", "paciente", "cedula", "categoria", "profesional", "estado", "acciones"]}
                renderCustomCell={(row, column, colIndex) => {
                  // Formatear la fecha según especificaciones
                  if (column === "fecha") {
                    const fecha = formatearFecha(row.fecha_agendada);
                    return (
                      <div className="fecha-hora-container">
                        <div className="fecha">{fecha.fecha}</div>
                        <div className="hora">{fecha.hora}</div>
                      </div>
                    );
                  }
                  
                  // Columna de icono de empresa (primera columna)
                  if (column === "iconoEmpresa") {
                    return (
                      <div className="empresa-cell">
                        {row.id_empresa && (
                          <div className="empresa-icon" title="Agendamiento con convenio">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="building-icon">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // Columna de paciente
                  if (column === "paciente") {
                    return (
                      <div className="text">
                        <div className="text2">{row.paciente_nombre} {row.paciente_apellido}</div>
                      </div>
                    );
                  }
                  
                  // Columna de cédula
                  if (column === "cedula") {
                    return (
                      <div className="text">
                        <div className="text2">{row.cedula}</div>
                      </div>
                    );
                  }
                  
                  // Columna de categoría
                  if (column === "categoria") {
                    return (
                      <div className="text">
                        <div className="text2">{row.tipo_atencion}</div>
                      </div>
                    );
                  }
                  
                  // Columna de profesional
                  if (column === "profesional") {
                    return (
                      <div className="text">
                        <div className="text2">{row.profesional_nombre} {row.profesional_apellido}</div>
                      </div>
                    );
                  }
                  
                  // Columna de estado
                  if (column === "estado") {
                    const status = row.status?.toLowerCase() || 'pendiente';
                    let scheme = 'neutral';
                    
                    if (status === 'confirmada') scheme = 'positive';
                    else if (status === 'cancelada') scheme = 'danger';
                    else if (status === 'pendiente') scheme = 'warning';
                    
                    return (
                      <div className="text">
                        <Tag 
                          text={row.status || 'Sin estado'} 
                          scheme={scheme}
                          closeable={false}
                        />
                      </div>
                    );
                  }
                  
                  // Columna de acciones
                  if (column === "acciones") {
                    return (
                      <div className="actions-container">
                        <Button
                          variant="icon" 
                          size="small"
                          onClick={() => mostrarDetalles(row)}
                          title="Ver detalles"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </Button>
                        
                        {row.status?.toLowerCase() !== 'cancelada' && (
                          <Button
                            variant="icon" 
                            size="small"
                            onClick={() => actualizarEstado(row.agendamiento_id, "confirmada")}
                            title="Confirmar cita"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </Button>
                        )}
                        
                        {row.status?.toLowerCase() !== 'cancelada' && (
                          <Button
                            variant="icon" 
                            size="small"
                            onClick={() => actualizarEstado(row.agendamiento_id, "cancelada")}
                            title="Cancelar cita"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    );
                  }
                  
                  return <div>{row[column]}</div>;
                }}
                className="admin-citas-table"
              />
            </div>
          )}
          
          {/* Modal para detalles */}
          {showDetailModal && currentAgendamiento && (
            <div className="admin-citas-agendadas__modal-overlay">
              <div className="admin-citas-agendadas__modal-content">
                <div className="admin-citas-agendadas__modal-header">
                  <h2>Detalles del Agendamiento</h2>
                  <button className="admin-citas-agendadas__close-btn" onClick={() => setShowDetailModal(false)}>×</button>
                </div>
                <div className="admin-citas-agendadas__modal-body">
                  <div className="admin-citas-agendadas__detail-section">
                    <h3>Información General</h3>
                    <div className="admin-citas-agendadas__detail-grid">
                      <div>
                        <strong>ID:</strong> {currentAgendamiento.agendamiento_id}
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '4px', color: 'var(--var-sds-color-text-default-subdued, #707070)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        <strong>Fecha:</strong> {formatearFecha(currentAgendamiento.fecha_agendada).fecha}
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '4px', color: 'var(--var-sds-color-text-default-subdued, #707070)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <strong>Hora:</strong> {formatearFecha(currentAgendamiento.fecha_agendada).hora}
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '4px', color: 'var(--var-sds-color-text-default-subdued, #707070)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <strong>Estado:</strong> 
                        {(() => {
                          const status = currentAgendamiento.status?.toLowerCase() || 'pendiente';
                          let scheme = 'neutral';
                          
                          if (status === 'confirmada') scheme = 'positive';
                          else if (status === 'cancelada') scheme = 'danger';
                          else if (status === 'pendiente') scheme = 'warning';
                          
                          return (
                            <Tag 
                              text={currentAgendamiento.status || 'Sin estado'} 
                              scheme={scheme}
                              closeable={false}
                            />
                          );
                        })()}
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '4px', color: 'var(--var-sds-color-text-default-subdued, #707070)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                        </svg>
                        <strong>Tipo:</strong> {currentAgendamiento.tipo_atencion}
                      </div>
                      {currentAgendamiento.id_empresa && (
                        <div>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '4px', color: 'var(--var-sds-color-text-default-subdued, #707070)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                          </svg>
                          <strong>Empresa:</strong> {currentAgendamiento.nombre_empresa || 'Convenio empresarial'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="admin-citas-agendadas__detail-section">
                    <h3>Información del Paciente</h3>
                    <div className="admin-citas-agendadas__detail-grid">
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

                  <div className="admin-citas-agendadas__detail-section">
                    <h3>Profesional</h3>
                    <div className="admin-citas-agendadas__detail-grid">
                      <div>
                        <strong>Nombre:</strong> {currentAgendamiento.profesional_nombre} {currentAgendamiento.profesional_apellido}
                      </div>
                    </div>
                  </div>

                  <div className="admin-citas-agendadas__detail-section">
                    <h3>Servicios</h3>
                    <p>{currentAgendamiento.observaciones || 'No se especificaron servicios'}</p>
                  </div>
                </div>
                <div className="admin-citas-agendadas__modal-footer">
                  <div className="admin-citas-agendadas__modal-estado-selector">
                    <label>Cambiar estado:</label>
                    <div className="admin-citas-agendadas__estado-buttons">
                      {/* Usar los componentes Button en lugar de botones personalizados */}
                      <Button 
                        variant={currentAgendamiento.status?.toLowerCase() === 'pendiente' ? 'primary' : 'subtle'}
                        onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "pendiente")}
                        size="small"
                      >
                        Pendiente
                      </Button>
                      <Button 
                        variant={currentAgendamiento.status?.toLowerCase() === 'confirmada' ? 'primary' : 'subtle'}
                        onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "confirmada")}
                        size="small"
                      >
                        Confirmada
                      </Button>
                      <Button 
                        variant={currentAgendamiento.status?.toLowerCase() === 'cancelada' ? 'danger' : 'subtle'}
                        onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "cancelada")}
                        size="small"
                      >
                        Cancelada
                      </Button>
                    </div>
                  </div>
                  <Button 
                    variant="neutral" 
                    onClick={() => setShowDetailModal(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCitasAgendadas;
