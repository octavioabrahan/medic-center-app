import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format } from 'date-fns';
import Calendar from '../../components/common/Calendar';
import AdminFilterBar from "../../components/admin/AdminFilterBar"; // Importamos el componente de barra de filtros
import "./AdminCitas.css";
import "../../components/admin/AdminCommon.css"; // Importamos los estilos comunes

const AdminCitas = () => {
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
  const [sortOrder, setSortOrder] = useState("az"); // Añadido para ordenamiento alfabético

  // Referencia para el selector de fechas
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
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados para modales
  const [currentAgendamiento, setCurrentAgendamiento] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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

  // Obtener agendamientos desde la API
  const fetchAgendamientos = async () => {
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
    
    console.log("Resultados filtrados:", results.length);
    setFilteredAgendamientos(results);
  };

  // Reaccionar a cambios en los filtros
  useEffect(() => {
    // Solo aplicar filtros si ya tenemos datos cargados
    if (agendamientos.length > 0) {
      applyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterStatus, filtroProfesional, sortOrder]);

  // Obtener datos nuevamente cuando cambia el rango de fechas
  // Utilizamos un debounce con useEffect para espaciar las llamadas cuando cambia el rango
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
  }, [dateRange.from, dateRange.to]);

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

  // Manejar clic en el input de fecha
  const handleDateInputClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDatePicker(prevState => !prevState);
  };

  // Manejar cambio de rango de fechas desde el calendario
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    // No llamamos a fetchAgendamientos aquí para evitar llamadas duplicadas
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

  // Mostrar detalles del agendamiento (utilizando el agendamiento directamente)
  const mostrarDetalles = (agendamiento) => {
    setCurrentAgendamiento(agendamiento);
    setShowDetailModal(true);
  };

  // Renderizar tabla de agendamientos
  const renderAgendamientosTable = () => {
    if (loading) return <div className="loading-container">Cargando citas...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredAgendamientos.length === 0) return <div className="no-results">No se encontraron citas</div>;

    return (
      <div className="admin-table-container with-scroll">
        <table className="admin-table">
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
              // Simplificar formato de fecha para mostrar solo la parte necesaria
              const fecha = new Date(agendamiento.fecha_agendada);
              const formatoFecha = fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              
              return (
                <tr key={agendamiento.agendamiento_id}>
                  <td className="empresa-cell">
                    {agendamiento.id_empresa && (
                      <div className="tooltip">
                        <div className="empresa-icon">💼</div>
                        <span className="tooltip-text">Agendamiento con convenio</span>
                      </div>
                    )}
                  </td>
                  <td>
                    {formatoFecha}
                  </td>
                  <td>{agendamiento.paciente_nombre} {agendamiento.paciente_apellido}</td>
                  <td>{agendamiento.cedula}</td>
                  <td>{agendamiento.tipo_atencion}</td>
                  <td>{agendamiento.profesional_nombre} {agendamiento.profesional_apellido}</td>
                  <td>
                    <span className={`status-badge status-${agendamiento.status ? agendamiento.status.toLowerCase() : 'pendiente'}`}>
                      {agendamiento.status || 'Sin estado'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action btn-view" 
                      onClick={() => mostrarDetalles(agendamiento)}
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    {agendamiento.status && agendamiento.status.toLowerCase() === 'pendiente' && (
                      <button
                        onClick={() => actualizarEstado(agendamiento.agendamiento_id, "confirmada")}
                        className="btn-action btn-confirm"
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
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Detalles del Agendamiento</h2>
            <button className="close-btn" onClick={() => setShowDetailModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <div className="detail-section">
              <h3>Información General</h3>
              <div className="detail-grid">
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
                  <span className={`status-badge status-${currentAgendamiento.status ? currentAgendamiento.status.toLowerCase() : 'pendiente'}`}>
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
                    <div className="orden-medica-container" style={{ marginTop: '10px' }}>
                      <img 
                        src={`${process.env.REACT_APP_API_URL || ''}/api/archivos/${currentAgendamiento.archivo_adjunto_id}/thumbnail`} 
                        alt="Vista previa del documento" 
                        style={{ 
                          maxWidth: '150px', 
                          maxHeight: '150px',
                          border: '1px solid #ddd',
                          display: 'block',
                          marginBottom: '10px'
                        }}
                      />
                      <div style={{ marginTop: '8px' }}>
                        <a 
                          href={`${process.env.REACT_APP_API_URL || ''}/api/archivos/${currentAgendamiento.archivo_adjunto_id}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#0066cc', 
                            textDecoration: 'underline',
                            display: 'block',
                            marginBottom: '5px'
                          }}
                        >
                          Ver en nueva pestaña
                        </a>
                        <a 
                          href={`${process.env.REACT_APP_API_URL || ''}/api/archivos/${currentAgendamiento.archivo_adjunto_id}?download=true`}
                          download
                          style={{ 
                            color: '#0066cc', 
                            textDecoration: 'underline' 
                          }}
                        >
                          Descargar archivo
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Información del Paciente</h3>
              <div className="detail-grid">
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

            <div className="detail-section">
              <h3>Profesional</h3>
              <div className="detail-grid">
                <div>
                  <strong>Nombre:</strong> {currentAgendamiento.profesional_nombre} {currentAgendamiento.profesional_apellido}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Servicios</h3>
              <p>{currentAgendamiento.observaciones || 'No se especificaron servicios'}</p>
            </div>
          </div>
          <div className="modal-footer">
            <div className="modal-estado-selector">
              <label>Cambiar estado:</label>
              <div className="estado-buttons">
                <button 
                  className={`estado-btn estado-pendiente ${currentAgendamiento.status === 'pendiente' ? 'active' : ''}`}
                  onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "pendiente")}
                >
                  Pendiente
                </button>
                <button 
                  className={`estado-btn estado-confirmada ${currentAgendamiento.status === 'confirmada' ? 'active' : ''}`}
                  onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "confirmada")}
                >
                  Confirmada
                </button>
                <button 
                  className={`estado-btn estado-cancelada ${currentAgendamiento.status === 'cancelada' ? 'active' : ''}`}
                  onClick={() => actualizarEstado(currentAgendamiento.agendamiento_id, "cancelada")}
                >
                  Cancelada
                </button>
              </div>
            </div>
            <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Citas agendadas</h1>
      
      <div className="admin-filter-section">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="admin-filter-controls">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          
          <select 
            value={filtroProfesional}
            onChange={(e) => setFiltroProfesional(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los profesionales</option>
            {profesionales.map((prof) => (
              <option key={prof.profesional_id} value={prof.profesional_id}>
                {prof.nombre} {prof.apellido}
              </option>
            ))}
          </select>
          
          <div className="date-picker-wrapper" ref={datePickerRef}>
            <div 
              className="date-input-wrapper"
              onClick={handleDateInputClick}
            >
              <span className="calendar-icon">📅</span>
              <span className="date-input">{formatDateRange()}</span>
            </div>
            
            {showDatePicker && (
              <div 
                className="calendar-dropdown calendar-position-right"
                onClick={e => e.stopPropagation()}
              >
                <Calendar
                  initialDateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  onClose={() => setShowDatePicker(false)}
                  showPresets={true}
                />

                <div className="calendar-actions">
                  <button 
                    className="btn-primary"
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
                    className="btn-secondary"
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
          
          <div className="admin-sort-buttons">
            <button 
              className={`sort-btn ${sortOrder === 'az' ? 'active' : ''}`}
              onClick={() => setSortOrder('az')}
              title="Ordenar de A a Z"
            >
              A → Z
            </button>
            <button 
              className={`sort-btn ${sortOrder === 'za' ? 'active' : ''}`}
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
    </div>
  );
};

export default AdminCitas;
