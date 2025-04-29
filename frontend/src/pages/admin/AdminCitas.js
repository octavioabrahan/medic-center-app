import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { format, startOfWeek, endOfWeek, startOfToday, endOfToday } from 'date-fns';
import Calendar from '../../components/common/Calendar';
import "./AdminCitas.css";

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

  // Referencia para el selector de fechas
  const datePickerRef = useRef(null);

  // Estados para el calendario
  const [dateRange, setDateRange] = useState({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados para modales
  const [currentAgendamiento, setCurrentAgendamiento] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [historialDe, setHistorialDe] = useState(null);

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

  // Cargar agendamientos al montar el componente
  useEffect(() => {
    fetchAgendamientos();
  }, []);

  // Filtrar agendamientos cuando cambian los criterios
  useEffect(() => {
    if (agendamientos.length > 0) {
      console.log("Agendamientos cargados:", agendamientos);
      let results = [...agendamientos];
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(agendamiento => 
          `${agendamiento.paciente_nombre || ''} ${agendamiento.paciente_apellido || ''}`.toLowerCase().includes(term) ||
          (agendamiento.cedula || '').toLowerCase().includes(term)
        );
      }
      
      // Filtrar por estado - Corregido para asegurar compatibilidad
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
      
      // Filtrar por rango de fechas
      if (dateRange.from && dateRange.to) {
        results = results.filter(agendamiento => {
          const fechaAgendada = new Date(agendamiento.fecha_agendada);
          return fechaAgendada >= dateRange.from && fechaAgendada <= dateRange.to;
        });
      }
      
      console.log("Resultados filtrados:", results.length);
      setFilteredAgendamientos(results);
      
      // Aplicar los filtros automáticamente a la API
      fetchAgendamientos();
    }
  }, [searchTerm, filterStatus, filtroProfesional, dateRange]);

  // Obtener agendamientos desde la API
  const fetchAgendamientos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('desde', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.append('hasta', format(dateRange.to, 'yyyy-MM-dd'));
      
      const response = await axios.get(`/api/agendamiento?${params.toString()}`);
      console.log("Datos cargados de la API:", response.data);
      setAgendamientos(response.data);
      
      // Extraer lista de profesionales únicos
      const profData = await axios.get("/api/profesionales");
      setProfesionales(profData.data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los agendamientos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener historial de un agendamiento
  const fetchHistorial = async (id) => {
    try {
      const response = await axios.get(`/api/agendamiento/${id}/historial`);
      setHistorial(response.data);
      setHistorialDe(id);
      setMostrarHistorial(true);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudo cargar el historial del agendamiento.');
    }
  };

  // Cambiar estado de agendamiento
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const response = await axios.put(`/api/agendamiento/${id}`, { status: nuevoEstado });
      
      // Actualizar estado en la lista local
      setAgendamientos(prev => prev.map(agendamiento => 
        agendamiento.agendamiento_id === id ? { ...agendamiento, status: nuevoEstado } : agendamiento
      ));

      // Si el agendamiento está siendo mostrado en detalle, actualizar su estado
      if (currentAgendamiento && currentAgendamiento.agendamiento_id === id) {
        setCurrentAgendamiento({...currentAgendamiento, status: nuevoEstado});
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar el estado del agendamiento.');
    }
  };

  // Cerrar el modal de historial
  const cerrarHistorial = () => {
    setMostrarHistorial(false);
    setHistorial([]);
    setHistorialDe(null);
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

  // Mostrar detalles del agendamiento (utilizando el agendamiento directamente)
  const mostrarDetalles = (agendamiento) => {
    setCurrentAgendamiento(agendamiento);
    setShowDetailModal(true);
  };

  // Renderizar tabla de agendamientos
  const renderAgendamientosTable = () => {
    if (loading) return <div className="loading">Cargando citas...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredAgendamientos.length === 0) return <div className="no-results">No se encontraron citas</div>;

    return (
      <div className="table-container">
        <table className="citas-table">
          <thead>
            <tr>
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
                  <td className="fecha-cell">
                    {agendamiento.id_empresa && <div className="empresa-icon">💼</div>}
                    {formatoFecha}
                  </td>
                  <td>{agendamiento.paciente_nombre} {agendamiento.paciente_apellido}</td>
                  <td>{agendamiento.cedula}</td>
                  <td>{agendamiento.tipo_atencion}</td>
                  <td>{agendamiento.profesional_nombre} {agendamiento.profesional_apellido}</td>
                  <td>
                    <span className={`status-badge ${agendamiento.status ? agendamiento.status.toLowerCase() : ''}`}>
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
                    <button
                      onClick={() => actualizarEstado(agendamiento.agendamiento_id, "confirmada")}
                      className="btn-confirm"
                      title="Confirmar"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => actualizarEstado(agendamiento.agendamiento_id, "cancelada")}
                      className="btn-cancel"
                      title="Cancelar"
                    >
                      ✕
                    </button>
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
        <div className="modal-content detail-modal">
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
                  <span className={`status-badge ${currentAgendamiento.status ? currentAgendamiento.status.toLowerCase() : ''}`}>
                    {currentAgendamiento.status || 'Sin estado'}
                  </span>
                </div>
                <div>
                  <strong>Tipo:</strong> {currentAgendamiento.tipo_atencion}
                </div>
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
            
            <div className="action-buttons">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de historial
  const renderHistorialModal = () => {
    if (!mostrarHistorial) return null;

    return (
      <div className="historial-modal">
        <div className="historial-content">
          <h3>Historial de Agendamiento #{historialDe}</h3>
          <table className="historial-table">
            <thead>
              <tr>
                <th>Anterior</th>
                <th>Nuevo</th>
                <th>Quién</th>
                <th>Cuándo</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.historial_id || h.id}>
                  <td>{h.estado_anterior}</td>
                  <td>{h.estado_nuevo}</td>
                  <td>{h.cambiado_por}</td>
                  <td>{new Date(h.fecha).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="historial-actions">
            <button onClick={cerrarHistorial} className="btn-primary">Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-citas-container">
      <h1>Citas agendadas</h1>
      
      <div className="filters-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-container">
          <label>Estado:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        
        <div className="filter-container">
          <label>Profesional:</label>
          <select 
            value={filtroProfesional}
            onChange={(e) => setFiltroProfesional(e.target.value)}
          >
            <option value="todos">Todos los profesionales</option>
            {profesionales.map((prof) => (
              <option key={prof.profesional_id} value={prof.profesional_id}>
                {prof.nombre} {prof.apellido}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-container">
          <label>Fecha:</label>
          <div className="date-input-wrapper" onClick={handleDateInputClick}>
            <span className="calendar-icon">📅</span>
            <input 
              type="text" 
              className="date-input"
              placeholder="dd/mm/yyyy - dd/mm/yyyy"
              value={formatDateRange()}
              readOnly
            />
          </div>
          
          {showDatePicker && (
            <div 
              className="calendar-dropdown"
              onClick={e => e.stopPropagation()}
              ref={datePickerRef}
            >
              <Calendar
                initialDateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onClose={() => setShowDatePicker(false)}
                showPresets={true}
              />

              <div className="calendar-actions">
                <button 
                  className="btn-apply"
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
                  className="btn-cancel"
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
      </div>
      
      {renderAgendamientosTable()}
      {renderDetailModal()}
      {renderHistorialModal()}
    </div>
  );
};

export default AdminCitas;
