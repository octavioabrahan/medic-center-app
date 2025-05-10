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
    return `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
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
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Citas agendadas</h1>
      
      <div className="admin-filters-bar">
        <div className="admin-search">
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
        
        <div className="admin-filter-container">
          <select 
            name="status"
            value={status || ""}
            onChange={handleFiltro}
          >
            <option value="">Todos los estados</option>
            {TODOS_LOS_ESTADOS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="admin-date-picker">
          <div className="date-input-wrapper" onClick={toggleDatePicker}>
            <span className="calendar-icon">📅</span>
            <span className="date-input">{formatDateRange()}</span>
          </div>
          {showDatePicker && (
            <div className="admin-calendar-wrapper enhanced">
              <Calendar
                initialDateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                onClose={() => setShowDatePicker(false)}
                showPresets={true}
              />
            </div>
          )}
        </div>
        
        <div className="admin-filter-container">
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
      </div>
      
      {loading ? (
        <div className="loading">Cargando citas...</div>
      ) : agendamientosFiltrados.length === 0 ? (
        <div className="no-results">No se encontraron citas con los filtros seleccionados</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha cita</th>
                <th>Paciente</th>
                <th>Cédula</th>
                <th>Categoría</th>
                <th>Profesional</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {agendamientosFiltrados.map((a) => {
                const formatoFecha = formatearFecha(a.fecha_agendada);
                
                return (
                  <tr key={a.agendamiento_id}>
                    <td className="fecha-cell">
                      <div className="calendar-icon">📅</div>
                      <div>
                        <div>{formatoFecha.fecha}</div>
                        <div className="hora">{formatoFecha.hora}</div>
                      </div>
                    </td>
                    <td>{a.paciente_nombre} {a.paciente_apellido}</td>
                    <td>{a.cedula}</td>
                    <td>{a.tipo_atencion}</td>
                    <td>{a.profesional_nombre} {a.profesional_apellido}</td>
                    <td>
                      <span className={`status-badge status-${a.status}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => actualizarEstado(a.agendamiento_id, "confirmada")}
                        className="btn-action btn-view"
                        title="Confirmar"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => actualizarEstado(a.agendamiento_id, "cancelada")}
                        className="btn-action btn-delete"
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
              <table className="admin-table">
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
                    <tr key={h.historial_id}>
                      <td>{h.estado_anterior}</td>
                      <td>{h.estado_nuevo}</td>
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