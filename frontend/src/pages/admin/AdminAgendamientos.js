// frontend/src/pages/admin/AdminAgendamientosModificado.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
// Eliminada la importación CSS redundante que ahora está en main.css
// import "./CitasAgendadas.css";
import { 
  startOfWeek, endOfWeek, format, startOfDay, endOfDay,
  startOfToday, endOfToday, startOfMonth, endOfMonth, 
} from "date-fns";
import Calendar from "../../components/common/Calendar";
// No necesitamos importar AdminCommon.css ya que lo importamos en AdminLayout.js

const TODOS_LOS_ESTADOS = ["pendiente", "confirmada", "cancelada"];

const CitasAgendadas = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [profesionales, setProfesionales] = useState([]);
  const [filtroProfesional, setFiltroProfesional] = useState("todos");
  
  const status = searchParams.get("status")?.trim() || TODOS_LOS_ESTADOS.join(",");
  const desde = searchParams.get("desde") || null;
  const hasta = searchParams.get("hasta") || null;
  
  const [dateRange, setDateRange] = useState({
    from: desde ? new Date(desde) : startOfWeek(new Date()),
    to: hasta ? new Date(hasta) : endOfWeek(new Date())
  });
  const [startDate, setStartDate] = useState(dateRange?.from);
  const [endDate, setEndDate] = useState(dateRange?.to);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [historialDe, setHistorialDe] = useState(null);

  const [agendamientos, setAgendamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgendamientos = async () => {
      try {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (desde) params.append("desde", desde);
        if (hasta) params.append("hasta", hasta);

        const url = `${process.env.REACT_APP_API_URL}/api/agendamiento?${params.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        setAgendamientos(data);
        
        // Extraer lista de profesionales únicos
        const uniqueProfesionales = [...new Set(data.map(a => `${a.profesional_nombre} ${a.profesional_apellido}`))];
        setProfesionales(uniqueProfesionales);
      } catch (err) {
        console.error("Error al obtener agendamientos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgendamientos();
  }, [status, desde, hasta]);

  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/agendamiento/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nuevoEstado }),
      });
      setAgendamientos((prev) =>
        prev.map((a) =>
          a.agendamiento_id === id ? { ...a, status: nuevoEstado } : a
        )
      );
    } catch (err) {
      alert("Error al actualizar estado");
    }
  };

  const handleFiltro = (e) => {
    const newParams = new URLSearchParams(searchParams);

    if (e.target.name === "status" && e.target.value === "") {
      newParams.set("status", TODOS_LOS_ESTADOS.join(","));
    } else {
      newParams.set(e.target.name, e.target.value);
    }

    setSearchParams(newParams);
  };

  const cerrarHistorial = () => {
    setMostrarHistorial(false);
    setHistorial([]);
    setHistorialDe(null);
  };

  // Filtrar agendamientos según el término de búsqueda y profesional seleccionado
  const agendamientosFiltrados = agendamientos.filter(a => {
    const matchesSearch = searchTerm === "" || 
      `${a.paciente_nombre} ${a.paciente_apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cedula?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesProfesional = filtroProfesional === "todos" || 
      `${a.profesional_nombre} ${a.profesional_apellido}` === filtroProfesional;
    
    // Filtrar por rango de fechas
    const fechaCita = new Date(a.fecha_agendada);
    const matchesFecha = !startDate || !endDate || 
      (fechaCita >= startOfDay(startDate) && fechaCita <= endOfDay(endDate));
      
    return matchesSearch && matchesProfesional && matchesFecha;
  });

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  // Update startDate and endDate when dateRange changes
  useEffect(() => {
    if (dateRange?.from) {
      setStartDate(dateRange.from);
    }
    if (dateRange?.to) {
      setEndDate(dateRange.to);
    }
  }, [dateRange]);

  // Update dateRange and URL params when dates are selected
  useEffect(() => {
    if (startDate && endDate) {
      const fromFormatted = format(startDate, "yyyy-MM-dd");
      const toFormatted = format(endDate, "yyyy-MM-dd");
      
      // Only update URL parameters if they have changed
      if (fromFormatted !== desde || toFormatted !== hasta) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("desde", fromFormatted);
        newParams.set("hasta", toFormatted);
        setSearchParams(newParams);
      }
    }
  }, [startDate, endDate, searchParams, setSearchParams, desde, hasta]);

  const formatDateRange = () => {
    if (!startDate || !endDate) return "Seleccionar fechas";
    return `${format(startDate, "dd-MM-yyyy")} ${format(endDate, "dd-MM-yyyy")}`;
  };

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
    return { fecha: `${diaSemana} ${dia} ${mes}`, hora: `${horas}:${minutos} ${ampm}` };
  };

  // Handle date range change from the Calendar component
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    setShowDatePicker(false); // Cerrar el calendario después de seleccionar fechas
  };

  // Definir clases para los estados de las citas
  const getStatusClass = (status) => {
    switch(status) {
      case 'confirmada': return 'status-confirmed';
      case 'cancelada': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Citas agendadas</h1>
      
      <div className="appointments-filter-panel">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="filter-group">
          <select 
            name="status"
            value={status || ""}
            onChange={handleFiltro}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            {TODOS_LOS_ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="date-range-picker">
          <div className="date-input-container" onClick={toggleDatePicker}>
            <div className="date-display">
              {formatDateRange()}
            </div>
            <div className="date-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          {showDatePicker && (
            <div className="calendar-popup">
              <Calendar
                initialDateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onClose={() => setShowDatePicker(false)}
                showPresets={true}
              />
            </div>
          )}
        </div>
        
        <div className="filter-group">
          <select 
            value={filtroProfesional} 
            onChange={(e) => setFiltroProfesional(e.target.value)}
            className="filter-select"
          >
            <option value="todos">Todos los profesionales</option>
            {profesionales.map((prof, index) => (
              <option key={index} value={prof}>{prof}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Cargando citas...</div>
        </div>
      ) : agendamientosFiltrados.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Aún no hay citas agendadas</h3>
          <p>Las citas que los pacientes registren desde el sitio de agendamiento aparecerán aquí.</p>
          <p>Una vez se genere la primera cita, podrás gestionarla, filtrar por estado, y ver todos los detalles asociados.</p>
        </div>
      ) : (
        <div className="appointments-table-container">
          <table className="appointments-table">
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
              {agendamientosFiltrados.map((a) => {
                const formatoFecha = formatearFecha(a.fecha_agendada);
                
                return (
                  <tr key={a.agendamiento_id}>
                    <td className="appointment-date-cell">
                      <div className="appointment-date-container">
                        <div className="appointment-date-icon">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#4A5568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="appointment-date-text">
                          <div className="appointment-day">{formatoFecha.fecha}</div>
                          <div className="appointment-time">{formatoFecha.hora}</div>
                        </div>
                      </div>
                    </td>
                    <td>{a.paciente_nombre} {a.paciente_apellido}</td>
                    <td>{a.cedula}</td>
                    <td>{a.tipo_atencion}</td>
                    <td>{a.profesional_nombre} {a.profesional_apellido}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => actualizarEstado(a.agendamiento_id, "confirmada")}
                        className="action-button confirm-button"
                        title="Confirmar"
                        disabled={a.status === "confirmada"}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => actualizarEstado(a.agendamiento_id, "cancelada")}
                        className="action-button cancel-button"
                        title="Cancelar"
                        disabled={a.status === "cancelada"}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal historial */}
      {mostrarHistorial && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Historial de Agendamiento #{historialDe}</h2>
              <button className="close-btn" onClick={cerrarHistorial}>×</button>
            </div>
            <div className="modal-body">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Estado anterior</th>
                    <th>Nuevo estado</th>
                    <th>Modificado por</th>
                    <th>Fecha de cambio</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h) => (
                    <tr key={h.historial_id}>
                      <td>
                        <span className={`status-badge ${getStatusClass(h.estado_anterior)}`}>
                          {h.estado_anterior}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(h.estado_nuevo)}`}>
                          {h.estado_nuevo}
                        </span>
                      </td>
                      <td>{h.cambiado_por}</td>
                      <td>{new Date(h.fecha).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button onClick={cerrarHistorial} className="btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasAgendadas;