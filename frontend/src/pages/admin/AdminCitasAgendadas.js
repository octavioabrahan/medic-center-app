// src/pages/admin/AdminCitasAgendadas.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdminLayout } from '../../components/AdminDashboard';
import SearchField from '../../components/Inputs/SearchField';
import SelectField from '../../components/Inputs/SelectField';
import Calendar from '../../components/common/Calendar';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import './AdminCitasAgendadas.css';

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
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar el estado del agendamiento.');
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
              <table className="admin-citas-agendadas__table">
                <thead>
                  <tr>
                    <th></th>
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
                    // Simplificar formato de fecha para mostrar
                    const fecha = new Date(agendamiento.fecha_agendada);
                    const formatoFecha = fecha.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                    
                    return (
                      <tr key={agendamiento.agendamiento_id}>
                        <td className="admin-citas-agendadas__empresa-cell">
                          {agendamiento.id_empresa && (
                            <div className="admin-citas-agendadas__tooltip">
                              <div className="admin-citas-agendadas__empresa-icon">💼</div>
                              <span className="admin-citas-agendadas__tooltip-text">Agendamiento con convenio</span>
                            </div>
                          )}
                        </td>
                        <td>{formatoFecha}</td>
                        <td>{agendamiento.paciente_nombre} {agendamiento.paciente_apellido}</td>
                        <td>{agendamiento.cedula}</td>
                        <td>{agendamiento.tipo_atencion}</td>
                        <td>{agendamiento.profesional_nombre} {agendamiento.profesional_apellido}</td>
                        <td>
                          <span className={`admin-citas-agendadas__status-badge admin-citas-agendadas__status-${agendamiento.status ? agendamiento.status.toLowerCase() : 'pendiente'}`}>
                            {agendamiento.status || 'Sin estado'}
                          </span>
                        </td>
                        <td className="admin-citas-agendadas__actions-cell">
                          <button 
                            className="admin-citas-agendadas__btn-action admin-citas-agendadas__btn-view" 
                            onClick={() => mostrarDetalles(agendamiento)}
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          {agendamiento.status && agendamiento.status.toLowerCase() === 'pendiente' && (
                            <button
                              onClick={() => actualizarEstado(agendamiento.agendamiento_id, "confirmada")}
                              className="admin-citas-agendadas__btn-action admin-citas-agendadas__btn-confirm"
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
                        <strong>Fecha:</strong> {formatearFecha(currentAgendamiento.fecha_agendada).fecha}
                      </div>
                      <div>
                        <strong>Hora:</strong> {formatearFecha(currentAgendamiento.fecha_agendada).hora}
                      </div>
                      <div>
                        <strong>Estado:</strong> 
                        <span className={`admin-citas-agendadas__status-badge admin-citas-agendadas__status-${currentAgendamiento.status ? currentAgendamiento.status.toLowerCase() : 'pendiente'}`}>
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
                      <button 
                        className={`admin-citas-agendadas__estado-btn admin-citas-agendadas__estado-pendiente ${currentAgendamiento.status === 'pendiente' ? 'active' : ''}`}
                        onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "pendiente")}
                      >
                        Pendiente
                      </button>
                      <button 
                        className={`admin-citas-agendadas__estado-btn admin-citas-agendadas__estado-confirmada ${currentAgendamiento.status === 'confirmada' ? 'active' : ''}`}
                        onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "confirmada")}
                      >
                        Confirmada
                      </button>
                      <button 
                        className={`admin-citas-agendadas__estado-btn admin-citas-agendadas__estado-cancelada ${currentAgendamiento.status === 'cancelada' ? 'active' : ''}`}
                        onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "cancelada")}
                      >
                        Cancelada
                      </button>
                    </div>
                  </div>
                  <button className="admin-citas-agendadas__btn-secondary" onClick={() => setShowDetailModal(false)}>
                    Cerrar
                  </button>
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
