// frontend/src/pages/admin/AdminAgendamientosModificado.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./CitasAgendadas.css";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { 
  startOfWeek, endOfWeek, format, startOfDay, endOfDay,
  startOfToday, endOfToday, startOfMonth, endOfMonth
} from "date-fns";
import { es } from "date-fns/locale";

const TODOS_LOS_ESTADOS = ["pendiente", "confirmada", "cancelada"];

const CalendarCaption = ({ displayMonth, displayYear, onMonthClick, onYearClick }) => {
  return (
    <div className="rdp-caption">
      <div className="rdp-caption_label">
        <span onClick={onMonthClick} style={{ cursor: 'pointer' }}>
          {format(new Date(displayYear, displayMonth), 'MMMM', { locale: es })}
        </span>
        {' '}
        <span onClick={onYearClick} style={{ cursor: 'pointer' }}>
          {displayYear}
        </span>
      </div>
      <div className="rdp-nav">
        {/* Navigation buttons are handled by DayPicker */}
      </div>
    </div>
  );
};

const MonthSelector = ({ currentMonth, currentYear, onSelect, onCancel }) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    return {
      month: i,
      label: format(new Date(currentYear, i), 'MMM', { locale: es })
    };
  });
  
  return (
    <div className="month-selector">
      <div className="month-grid">
        {months.map(({ month, label }) => (
          <button 
            key={month}
            onClick={() => onSelect(month)}
            className={month === currentMonth ? 'selected' : ''}
          >
            {label}
          </button>
        ))}
      </div>
      <button onClick={onCancel} className="close-btn">Cancelar</button>
    </div>
  );
};

const YearSelector = ({ currentYear, onSelect, onCancel }) => {
  const startYear = currentYear - 5;
  const years = Array.from({ length: 11 }, (_, i) => startYear + i);
  
  return (
    <div className="year-selector">
      <div className="year-grid">
        {years.map((year) => (
          <button 
            key={year}
            onClick={() => onSelect(year)}
            className={year === currentYear ? 'selected' : ''}
          >
            {year}
          </button>
        ))}
      </div>
      <button onClick={onCancel} className="close-btn">Cancelar</button>
    </div>
  );
};

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
  const [showDatePicker, setShowDatePicker] = useState(false); // Toggle for DayPicker visibility
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

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

  // Handle preset date ranges
  const handleDatePreset = (preset) => {
    const today = new Date();
    let newRange;
    
    switch(preset) {
      case 'today':
        newRange = { from: startOfToday(), to: endOfToday() };
        break;
      case 'thisWeek':
        newRange = { from: startOfWeek(today), to: endOfWeek(today) };
        break;
      case 'thisMonth':
        newRange = { from: startOfMonth(today), to: endOfMonth(today) };
        break;
      default:
        return;
    }
    
    setDateRange(newRange);
    setShowDatePicker(false);
  };

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

  return (
    <div className="citas-container">
      <h2 className="page-title">Citas agendadas</h2>
      
      <div className="citas-filters">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
          
          <div className="date-picker-wrapper">
            <button className="date-picker-toggle" onClick={toggleDatePicker}>
              {desde && hasta ? `${format(new Date(desde), "dd/MM/yyyy")} - ${format(new Date(hasta), "dd/MM/yyyy")}` : "Seleccionar fechas"}
            </button>
            {showDatePicker && (
              <div className="date-picker-dropdown">
                {showMonthPicker ? (
                  <MonthSelector
                    currentMonth={calendarMonth}
                    currentYear={calendarYear}
                    onSelect={(month) => {
                      setCalendarMonth(month);
                      setShowMonthPicker(false);
                    }}
                    onCancel={() => setShowMonthPicker(false)}
                  />
                ) : showYearPicker ? (
                  <YearSelector
                    currentYear={calendarYear}
                    onSelect={(year) => {
                      setCalendarYear(year);
                      setShowYearPicker(false);
                    }}
                    onCancel={() => setShowYearPicker(false)}
                  />
                ) : (
                  <>
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={(newRange) => {
                        if (newRange) {
                          setDateRange(newRange);
                        }
                      }}
                      locale={es}
                      month={new Date(calendarYear, calendarMonth)}
                      captionLayout="buttons"
                      onMonthChange={(newMonth) => {
                        setCalendarMonth(newMonth.getMonth());
                        setCalendarYear(newMonth.getFullYear());
                      }}
                      showOutsideDays
                      modifiersClassNames={{
                        today: 'rdp-day_today',
                        selected: 'rdp-day_selected'
                      }}
                      components={{
                        IconLeft: () => <span>&lt;</span>,
                        IconRight: () => <span>&gt;</span>,
                        Caption: ({ displayMonth, displayYear }) => (
                          <div className="rdp-caption">
                            <button 
                              onClick={() => {
                                const prevYear = new Date(calendarYear - 1, calendarMonth);
                                setCalendarMonth(prevYear.getMonth());
                                setCalendarYear(prevYear.getFullYear());
                              }} 
                              className="rdp-nav_button"
                              title="Previous year"
                            >
                              &lt;&lt;
                            </button>
                            <button 
                              onClick={() => {
                                const prevMonth = new Date(calendarYear, calendarMonth - 1);
                                setCalendarMonth(prevMonth.getMonth());
                                setCalendarYear(prevMonth.getFullYear());
                              }} 
                              className="rdp-nav_button"
                              title="Previous month"
                            >
                              &lt;
                            </button>
                            <div 
                              className="rdp-caption_label"
                              onClick={() => setShowMonthPicker(true)}
                            >
                              {format(new Date(calendarYear, calendarMonth), 'MMMM yyyy', { locale: es })}
                            </div>
                            <button 
                              onClick={() => {
                                const nextMonth = new Date(calendarYear, calendarMonth + 1);
                                setCalendarMonth(nextMonth.getMonth());
                                setCalendarYear(nextMonth.getFullYear());
                              }} 
                              className="rdp-nav_button"
                              title="Next month"
                            >
                              &gt;
                            </button>
                            <button 
                              onClick={() => {
                                const nextYear = new Date(calendarYear + 1, calendarMonth);
                                setCalendarMonth(nextYear.getMonth());
                                setCalendarYear(nextYear.getFullYear());
                              }} 
                              className="rdp-nav_button"
                              title="Next year"
                            >
                              &gt;&gt;
                            </button>
                          </div>
                        )
                      }}
                    />
                    <div className="today-button-container">
                      <button 
                        className="today-button" 
                        onClick={() => {
                          const today = new Date();
                          setCalendarMonth(today.getMonth());
                          setCalendarYear(today.getFullYear());
                          setDateRange({ from: today, to: today });
                          setShowDatePicker(false);
                        }}
                      >
                        Today
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
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
        <div className="loading-container">Cargando citas...</div>
      ) : (
        <div className="citas-table-container">
          <table className="citas-table">
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
                  <tr key={a.agendamiento_id} className={`cita-row ${a.status}`}>
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
                      <span className={`estado-badge ${a.status}`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        onClick={() => actualizarEstado(a.agendamiento_id, "confirmada")}
                        className="action-btn confirm-btn"
                        title="Confirmar"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => actualizarEstado(a.agendamiento_id, "cancelada")}
                        className="action-btn cancel-btn"
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
                  <tr key={h.historial_id}>
                    <td>{h.estado_anterior}</td>
                    <td>{h.estado_nuevo}</td>
                    <td>{h.cambiado_por}</td>
                    <td>{new Date(h.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="historial-actions">
              <button onClick={cerrarHistorial} className="close-btn">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CitasAgendadas;