import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, startOfToday, endOfToday } from 'date-fns';
//import Calendar from '../../components/common/Calendar';
//import './AgendamientoAdmin.css';

function AgendamientoAdmin() {
  // Estados para almacenar los datos
  const [agendamientos, setAgendamientos] = useState([]);
  const [filteredAgendamientos, setFilteredAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [profesionales, setProfesionales] = useState([]);
  const [filtroProfesional, setFiltroProfesional] = useState('todos');

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

  // Cargar agendamientos al montar el componente
  useEffect(() => {
    fetchAgendamientos();
  }, []);

  // Filtrar agendamientos cuando cambian los criterios
  useEffect(() => {
    if (agendamientos.length > 0) {
      let results = [...agendamientos];
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        results = results.filter(agendamiento => 
          `${agendamiento.paciente_nombre} ${agendamiento.paciente_apellido}`.toLowerCase().includes(term) ||
          agendamiento.cedula?.toLowerCase().includes(term)
        );
      }
      
      // Filtrar por estado
      if (filterStatus !== 'todos') {
        results = results.filter(agendamiento => agendamiento.status === filterStatus);
      }
      
      // Filtrar por profesional
      if (filtroProfesional !== 'todos') {
        results = results.filter(agendamiento => 
          `${agendamiento.profesional_nombre} ${agendamiento.profesional_apellido}` === filtroProfesional
        );
      }
      
      // Filtrar por rango de fechas
      results = results.filter(agendamiento => {
        const fechaAgendada = new Date(agendamiento.fecha_agendada);
        return fechaAgendada >= dateRange.from && fechaAgendada <= dateRange.to;
      });
      
      setFilteredAgendamientos(results);
    }
  }, [searchTerm, filterStatus, filtroProfesional, dateRange, agendamientos]);

  // Obtener agendamientos desde la API
  const fetchAgendamientos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('desde', format(dateRange.from, 'yyyy-MM-dd'));
      if (dateRange.to) params.append('hasta', format(dateRange.to, 'yyyy-MM-dd'));
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento?${params.toString()}`);
      if (!response.ok) throw new Error('Error al obtener agendamientos');
      
      const data = await response.json();
      setAgendamientos(data);
      
      // Extraer lista de profesionales únicos
      const uniqueProfesionales = [...new Set(data.map(a => `${a.profesional_nombre} ${a.profesional_apellido}`))];
      setProfesionales(uniqueProfesionales);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los agendamientos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Obtener detalles de un agendamiento
  const fetchAgendamientoDetails = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento/${id}`);
      if (!response.ok) throw new Error('Error al obtener detalles del agendamiento');
      
      const data = await response.json();
      setCurrentAgendamiento(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los detalles del agendamiento.');
    }
  };

  // Obtener historial de un agendamiento
  const fetchHistorial = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento/${id}/historial`);
      if (!response.ok) throw new Error('Error al obtener historial');
      
      const data = await response.json();
      setHistorial(data);
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nuevoEstado }),
      });
      
      if (!response.ok) throw new Error('Error al actualizar estado');
      
      // Actualizar estado en la lista local
      setAgendamientos(prev => prev.map(agendamiento => 
        agendamiento.agendamiento_id === id ? { ...agendamiento, status: nuevoEstado } : agendamiento
      ));
    } catch (err) {
      console.error('Error:', err);
      setError('Error al actualizar el estado del agendamiento.');
    }
  };

  // Toggle para mostrar/ocultar el selector de fechas
  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  // Cerrar el modal de historial
  const cerrarHistorial = () => {
    setMostrarHistorial(false);
    setHistorial([]);
    setHistorialDe(null);
  };

  // Manejar cambio de rango de fechas
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    setShowDatePicker(false);
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

  // Filtros rápidos predefinidos
  const aplicarFiltroRapido = (tipo) => {
    let nuevaFecha = {};
    
    switch (tipo) {
      case 'hoy':
        nuevaFecha = { from: startOfToday(), to: endOfToday() };
        break;
      case 'semana':
        nuevaFecha = { from: startOfWeek(new Date()), to: endOfWeek(new Date()) };
        break;
      default:
        nuevaFecha = { from: startOfWeek(new Date()), to: endOfWeek(new Date()) };
    }
    
    setDateRange(nuevaFecha);
  };

  // Renderizar tabla de agendamientos
  const renderAgendamientosTable = () => {
    if (loading) return <div className="loading">Cargando agendamientos...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredAgendamientos.length === 0) return <div className="no-results">No se encontraron agendamientos</div>;

    return (
      <div className="table-container">
        <table className="agendamientos-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Paciente</th>
              <th>Cédula</th>
              <th>Tipo</th>
              <th>Profesional</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAgendamientos.map(agendamiento => {
              const formatoFecha = formatearFecha(agendamiento.fecha_agendada);
              
              return (
                <tr key={agendamiento.agendamiento_id} className={`cita-row ${agendamiento.status}`}>
                  <td className="fecha-cell">
                    <div className="calendar-icon">📅</div>
                    <div>
                      <div>{formatoFecha.fecha}</div>
                      <div className="hora">{formatoFecha.hora}</div>
                    </div>
                  </td>
                  <td>{agendamiento.paciente_nombre} {agendamiento.paciente_apellido}</td>
                  <td>{agendamiento.cedula}</td>
                  <td>{agendamiento.tipo_atencion}</td>
                  <td>{agendamiento.profesional_nombre} {agendamiento.profesional_apellido}</td>
                  <td>
                    <span className={`status-badge status-${agendamiento.status}`}>
                      {agendamiento.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action btn-view" 
                      onClick={() => fetchAgendamientoDetails(agendamiento.agendamiento_id)}
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-action btn-follow" 
                      onClick={() => fetchHistorial(agendamiento.agendamiento_id)}
                      title="Ver historial"
                    >
                      📋
                    </button>
                    <button
                      onClick={() => actualizarEstado(agendamiento.agendamiento_id, "confirmada")}
                      className="btn-action"
                      title="Confirmar"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => actualizarEstado(agendamiento.agendamiento_id, "cancelada")}
                      className="btn-action"
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
                  <span className={`status-badge status-${currentAgendamiento.status}`}>
                    {currentAgendamiento.status}
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
              <button className="btn-primary" onClick={() => fetchHistorial(currentAgendamiento.agendamiento_id)}>
                Ver Historial
              </button>
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
    <div className="agendamiento-admin">
      <h1>Administración de Agendamientos</h1>
      
      <div className="filters-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por paciente o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <label>Estado:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos</option>
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
            {profesionales.map((prof, index) => (
              <option key={index} value={prof}>{prof}</option>
            ))}
          </select>
        </div>
        
        <div className="date-picker-wrapper">
          <button 
            className="date-picker-input" 
            onClick={toggleDatePicker}
          >
            <span className="calendar-icon">📅</span>
            {formatDateRange()}
          </button>
          {showDatePicker && (
            <div className="admin-calendar-wrapper">
              <Calendar
                initialDateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onClose={() => setShowDatePicker(false)}
                showPresets={true}
              />
            </div>
          )}
        </div>
        
        <button className="refresh-btn" onClick={fetchAgendamientos}>
          Actualizar
        </button>
      </div>
      
      {renderAgendamientosTable()}
      {renderDetailModal()}
      {renderHistorialModal()}
    </div>
  );
}

export default AgendamientoAdmin;