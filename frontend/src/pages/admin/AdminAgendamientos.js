// frontend/src/pages/admin/AdminAgendamientosModificado.js
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./CitasAgendadas.css";
import "./CalendarStyles.css";
import { 
  startOfWeek, endOfWeek, format, startOfDay, endOfDay,
  startOfToday, endOfToday, startOfMonth, endOfMonth, 
  addMonths, subMonths, addYears, subYears, isSameDay, isWithinInterval,
  eachDayOfInterval, getDay, setMonth, setYear, isSameMonth
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
  const monthNames = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];
  
  return (
    <div className="month-selector">
      <div className="month-grid">
        {monthNames.map((name, idx) => (
          <button 
            key={idx}
            onClick={() => onSelect(idx)}
            className={idx === currentMonth ? 'selected' : ''}
          >
            {name}
          </button>
        ))}
      </div>
      <button onClick={onCancel} className="close-btn">Volver</button>
    </div>
  );
};

const YearSelector = ({ currentYear, onSelect, onCancel }) => {
  // Calculate years to display in a 3x4 grid (start with current year - 2 in top-left)
  const baseYear = currentYear - 2;
  const years = [
    2020, 2021, 2022,
    2023, 2024, 2025,
    2026, 2027, 2028,
    2029, 2030
  ];
  
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
      <button onClick={onCancel} className="close-btn">Volver</button>
    </div>
  );
};

// Custom Calendar Component
const CustomCalendar = ({ 
  currentMonth, 
  currentYear, 
  selectedDate, 
  onDateSelect, 
  onMonthChange,
  onYearChange,
  onMonthClick,
  onYearClick
}) => {
  const today = new Date();
  const currentDate = new Date(currentYear, currentMonth, 1);
  
  // Get days for the current month including some from previous/next months to fill calendar
  const getDaysInMonth = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Previous month days to show
    const result = [];
    
    // Current month days
    for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
      result.push(new Date(currentYear, currentMonth, d));
    }
    
    // Next month days to show
    const nextMonthDays = 10; // Show more days from the next month
    for (let d = 1; d <= nextMonthDays; d++) {
      result.push(new Date(currentYear, currentMonth + 1, d));
    }
    
    return result;
  };
  
  const days = getDaysInMonth();
  
  // Navigate to previous/next month
  const goToPrevMonth = () => onMonthChange(subMonths(currentDate, 1));
  const goToNextMonth = () => onMonthChange(addMonths(currentDate, 1));
  const goToPrevYear = () => onMonthChange(subYears(currentDate, 1));
  const goToNextYear = () => onMonthChange(addYears(currentDate, 1));
  
  // Handle day selection
  const handleDayClick = (day) => {
    onDateSelect(day);
  };
  
  // Check if day is selected
  const isSelected = (day) => {
    if (!selectedDate) return false;
    return isSameDay(day, selectedDate.from) || 
           (selectedDate.to && isSameDay(day, selectedDate.to)) || 
           (selectedDate.from && selectedDate.to && isWithinInterval(day, {
             start: selectedDate.from, 
             end: selectedDate.to
           }));
  };
  
  // Check if day is today
  const isToday = (day) => {
    return isSameDay(day, today);
  };
  
  // Check if day is in current month
  const isCurrentMonth = (day) => {
    return day.getMonth() === currentMonth;
  };
  
  // Format day names (like "lu" for Monday)
  const getDayAbbreviation = (day) => {
    const dayNames = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do'];
    return dayNames[getDay(day)];
  };
  
  return (
    <div className="custom-calendar">
      <div className="calendar-header">
        <div className="month-year">
          <span onClick={onMonthClick}>{format(currentDate, 'MMMM', { locale: es })}</span>{' '}
          <span onClick={onYearClick}>{format(currentDate, 'yyyy')}</span>
        </div>
        <div className="navigation-buttons">
          <button onClick={goToPrevYear} className="nav-button">&lt;&lt;</button>
          <button onClick={goToPrevMonth} className="nav-button">&lt;</button>
          <button onClick={goToNextMonth} className="nav-button">&gt;</button>
          <button onClick={goToNextYear} className="nav-button">&gt;&gt;</button>
        </div>
      </div>
      <div className="calendar-days">
        {days.map((day, index) => (
          <div 
            key={index}
            className={`day-row ${isSelected(day) ? 'selected' : ''} ${isToday(day) ? 'today' : ''} ${!isCurrentMonth(day) ? 'outside-month' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            <div className="day-number">{day.getDate()}</div>
            <div className="day-name">{getDayAbbreviation(day)}</div>
          </div>
        ))}
      </div>
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [datePickerMode, setDatePickerMode] = useState('start'); // 'start' or 'end'

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
            <div className="date-range-inputs">
              <button 
                className="date-picker-input" 
                onClick={() => {
                  setDatePickerMode('start');
                  setShowDatePicker(!showDatePicker);
                }}
              >
                {startDate ? format(startDate, "dd/MM/yyyy") : "Start date"}
              </button>
              <span className="date-separator">—</span>
              <button 
                className="date-picker-input" 
                onClick={() => {
                  setDatePickerMode('end');
                  setShowDatePicker(!showDatePicker);
                }}
              >
                {endDate ? format(endDate, "dd/MM/yyyy") : "End date"}
              </button>
            </div>
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
                  <div className="two-month-container">
                    {/* First month */}
                    <div className="month-container">
                      <div className="calendar-header">
                        <button className="nav-button" title="Año anterior" onClick={() => setCalendarYear(calendarYear - 1)}>«</button>
                        <button className="nav-button" title="Mes anterior" onClick={() => {
                          const prevMonth = new Date(calendarYear, calendarMonth - 1);
                          setCalendarMonth(prevMonth.getMonth());
                          setCalendarYear(prevMonth.getFullYear());
                        }}>‹</button>
                        <div className="month-year-display">
                          <span onClick={() => setShowMonthPicker(true)}>
                            {format(new Date(calendarYear, calendarMonth), 'MMM', { locale: es })}
                          </span>{' '}
                          <span onClick={() => setShowYearPicker(true)}>
                            {calendarYear}
                          </span>
                        </div>
                      </div>
                      
                      <table className="calendar-table">
                        <thead>
                          <tr>
                            <th>Lu</th>
                            <th>Ma</th>
                            <th>Mi</th>
                            <th>Ju</th>
                            <th>Vi</th>
                            <th>Sa</th>
                            <th>Do</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1);
                            const lastDayOfMonth = new Date(calendarYear, calendarMonth + 1, 0);
                            const daysInMonth = lastDayOfMonth.getDate();
                            
                            // Convert Sunday (0) to 6, and other days to day-1 (Monday = 0, Tuesday = 1, etc.)
                            const getAdjustedDay = (date) => {
                              const day = date.getDay();
                              return day === 0 ? 6 : day - 1;
                            };
                            
                            // Day of week of first day (0 = Monday, 1 = Tuesday, etc. with our adjustment)
                            const firstDayWeekday = getAdjustedDay(firstDayOfMonth);
                            const prevMonthLastDay = new Date(calendarYear, calendarMonth, 0).getDate();
                            
                            // Current date (for highlighting today)
                            const today = new Date();
                            
                            const rows = [];
                            let days = [];
                            
                            // Previous month days
                            for (let i = 0; i < firstDayWeekday; i++) {
                              const prevDay = prevMonthLastDay - (firstDayWeekday - i - 1);
                              const prevDate = new Date(calendarYear, calendarMonth - 1, prevDay);
                              
                              days.push(
                                <td key={`prev-${i}`} className="outside-month">
                                  <div 
                                    className="calendar-day"
                                    onClick={() => {
                                      if (startDate && !endDate) {
                                        // If selecting end date after start date
                                        if (prevDate > startDate) {
                                          // If end date is before start date, swap them
                                          setDateRange({ from: prevDate, to: startDate });
                                        } else {
                                          setDateRange({ from: startDate, to: prevDate });
                                        }
                                        setShowDatePicker(false);
                                      } else {
                                        // Start new selection
                                        setDateRange({ from: prevDate, to: null });
                                        // Don't close the picker yet, wait for the second date
                                      }
                                    }}
                                  >
                                    {prevDay}
                                  </div>
                                </td>
                              );
                            }
                            
                            // Current month days
                            for (let day = 1; day <= daysInMonth; day++) {
                              const date = new Date(calendarYear, calendarMonth, day);
                              const isToday = day === today.getDate() && 
                                            calendarMonth === today.getMonth() && 
                                            calendarYear === today.getFullYear();
                              
                              // Check if date is within the selected range
                              const isInRange = dateRange?.from && dateRange?.to && 
                                date >= startOfDay(dateRange.from) && 
                                date <= endOfDay(dateRange.to);
                              
                              // Check if date is exactly the start or end date
                              const isRangeStart = dateRange?.from && 
                                day === dateRange.from.getDate() && 
                                calendarMonth === dateRange.from.getMonth() && 
                                calendarYear === dateRange.from.getFullYear();
                              
                              const isRangeEnd = dateRange?.to && 
                                day === dateRange.to.getDate() && 
                                calendarMonth === dateRange.to.getMonth() && 
                                calendarYear === dateRange.to.getFullYear();
                              
                              let className = "calendar-day";
                              if (isToday) className += " today";
                              if (isRangeStart) className += " range-start selected";
                              else if (isRangeEnd) className += " range-end selected";
                              else if (isInRange) className += " range-middle";
                              
                              days.push(
                                <td key={`day-${day}`}>
                                  <div 
                                    className={className}
                                    onClick={() => {
                                      const selectedDate = new Date(calendarYear, calendarMonth, day);
                                      
                                      if (datePickerMode === 'start') {
                                        // If we're selecting a start date
                                        if (endDate && selectedDate > endDate) {
                                          // If selected start date is after current end date, reset end date
                                          setDateRange({ from: selectedDate, to: null });
                                          setShowDatePicker(true); // Keep calendar open to select end date
                                          setDatePickerMode('end'); // Switch to end date selection
                                        } else {
                                          // Normal start date selection
                                          setDateRange({ 
                                            from: selectedDate, 
                                            to: endDate || selectedDate // Keep end date if it exists
                                          });
                                          setShowDatePicker(false);
                                        }
                                      } else {
                                        // If we're selecting an end date
                                        if (startDate && selectedDate < startDate) {
                                          // If selected end date is before start date, swap them
                                          setDateRange({ from: selectedDate, to: startDate });
                                        } else {
                                          // Normal end date selection
                                          setDateRange({ 
                                            from: startDate || selectedDate, // Keep start date if it exists
                                            to: selectedDate 
                                          });
                                        }
                                        setShowDatePicker(false);
                                      }
                                    }}
                                  >
                                    {day}
                                  </div>
                                </td>
                              );
                              
                              // If we've reached the end of a week, start a new row
                              if (days.length === 7) {
                                rows.push(<tr key={`row-${rows.length}`}>{days}</tr>);
                                days = [];
                              }
                            }
                            
                            // Next month days
                            if (days.length > 0) {
                              const remainingCells = 7 - days.length;
                              for (let i = 1; i <= remainingCells; i++) {
                                const nextDate = new Date(calendarYear, calendarMonth + 1, i);
                                
                                days.push(
                                  <td key={`next-${i}`} className="outside-month">
                                    <div 
                                      className="calendar-day"
                                      onClick={() => {
                                        if (startDate && !endDate) {
                                          // If selecting end date after start date
                                          if (nextDate >= startDate) {
                                            setDateRange({ from: startDate, to: nextDate });
                                          } else {
                                            // If end date is before start date, swap them
                                            setDateRange({ from: nextDate, to: startDate });
                                          }
                                          setShowDatePicker(false);
                                        } else {
                                          // Start new selection
                                          setDateRange({ from: nextDate, to: null });
                                          // Don't close the picker yet, wait for the second date
                                        }
                                      }}
                                    >
                                      {i}
                                    </div>
                                  </td>
                                );
                              }
                              rows.push(<tr key={`row-${rows.length}`}>{days}</tr>);
                            }
                            
                            return rows;
                          })()}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Second month */}
                    <div className="month-container">
                      <div className="calendar-header">
                        <div className="month-year-display">
                          <span onClick={() => setShowMonthPicker(true)}>
                            {format(new Date(calendarYear, calendarMonth + 1), 'MMM', { locale: es })}
                          </span>{' '}
                          <span onClick={() => setShowYearPicker(true)}>
                            {calendarMonth === 11 ? calendarYear + 1 : calendarYear}
                          </span>
                        </div>
                        <button className="nav-button" title="Mes siguiente" onClick={() => {
                          const nextMonth = new Date(calendarYear, calendarMonth + 1);
                          setCalendarMonth(nextMonth.getMonth());
                          setCalendarYear(nextMonth.getFullYear());
                        }}>›</button>
                        <button className="nav-button" title="Año siguiente" onClick={() => setCalendarYear(calendarYear + 1)}>»</button>
                      </div>
                      
                      <table className="calendar-table">
                        <thead>
                          <tr>
                            <th>Lu</th>
                            <th>Ma</th>
                            <th>Mi</th>
                            <th>Ju</th>
                            <th>Vi</th>
                            <th>Sa</th>
                            <th>Do</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Get the next month
                            const nextMonthDate = new Date(calendarYear, calendarMonth + 1);
                            const nextMonthYear = nextMonthDate.getFullYear();
                            const nextMonth = nextMonthDate.getMonth();
                            
                            const firstDayOfMonth = new Date(nextMonthYear, nextMonth, 1);
                            const lastDayOfMonth = new Date(nextMonthYear, nextMonth + 1, 0);
                            const daysInMonth = lastDayOfMonth.getDate();
                            
                            // Convert Sunday (0) to 6, and other days to day-1 (Monday = 0, Tuesday = 1, etc.)
                            const getAdjustedDay = (date) => {
                              const day = date.getDay();
                              return day === 0 ? 6 : day - 1;
                            };
                            
                            // Day of week of first day (0 = Monday, 1 = Tuesday, etc. with our adjustment)
                            const firstDayWeekday = getAdjustedDay(firstDayOfMonth);
                            const prevMonthLastDay = new Date(nextMonthYear, nextMonth, 0).getDate();
                            
                            // Current date (for highlighting today)
                            const today = new Date();
                            
                            const rows = [];
                            let days = [];
                            
                            // Previous month days
                            for (let i = 0; i < firstDayWeekday; i++) {
                              const prevDay = prevMonthLastDay - (firstDayWeekday - i - 1);
                              const prevDate = new Date(nextMonthYear, nextMonth - 1, prevDay);
                              
                              days.push(
                                <td key={`prev-${i}`} className="outside-month">
                                  <div 
                                    className="calendar-day"
                                    onClick={() => {
                                      if (startDate && !endDate) {
                                        // If selecting end date after start date
                                        if (prevDate >= startDate) {
                                          setDateRange({ from: startDate, to: prevDate });
                                        } else {
                                          // If end date is before start date, swap them
                                          setDateRange({ from: prevDate, to: startDate });
                                        }
                                        setShowDatePicker(false);
                                      } else {
                                        // Start new selection
                                        setDateRange({ from: prevDate, to: null });
                                        // Don't close the picker yet, wait for the second date
                                      }
                                    }}
                                  >
                                    {prevDay}
                                  </div>
                                </td>
                              );
                            }
                            
                            // Current month days
                            for (let day = 1; day <= daysInMonth; day++) {
                              const date = new Date(nextMonthYear, nextMonth, day);
                              const isToday = day === today.getDate() && 
                                            nextMonth === today.getMonth() && 
                                            nextMonthYear === today.getFullYear();
                              
                              // Check if date is within the selected range
                              const isInRange = dateRange?.from && dateRange?.to && 
                                date >= startOfDay(dateRange.from) && 
                                date <= endOfDay(dateRange.to);
                              
                              // Check if date is exactly the start or end date
                              const isRangeStart = dateRange?.from && 
                                day === dateRange.from.getDate() && 
                                nextMonth === dateRange.from.getMonth() && 
                                nextMonthYear === dateRange.from.getFullYear();
                              
                              const isRangeEnd = dateRange?.to && 
                                day === dateRange.to.getDate() && 
                                nextMonth === dateRange.to.getMonth() && 
                                nextMonthYear === dateRange.to.getFullYear();
                              
                              let className = "calendar-day";
                              if (isToday) className += " today";
                              if (isRangeStart) className += " range-start selected";
                              else if (isRangeEnd) className += " range-end selected";
                              else if (isInRange) className += " range-middle";
                              
                              days.push(
                                <td key={`day-${day}`}>
                                  <div 
                                    className={className}
                                    onClick={() => {
                                      const selectedDate = new Date(nextMonthYear, nextMonth, day);
                                      
                                      if (datePickerMode === 'start') {
                                        // If we're selecting a start date
                                        if (endDate && selectedDate > endDate) {
                                          // If selected start date is after current end date, reset end date
                                          setDateRange({ from: selectedDate, to: null });
                                          setShowDatePicker(true); // Keep calendar open to select end date
                                          setDatePickerMode('end'); // Switch to end date selection
                                        } else {
                                          // Normal start date selection
                                          setDateRange({ 
                                            from: selectedDate, 
                                            to: endDate || selectedDate // Keep end date if it exists
                                          });
                                          setShowDatePicker(false);
                                        }
                                      } else {
                                        // If we're selecting an end date
                                        if (startDate && selectedDate < startDate) {
                                          // If selected end date is before start date, swap them
                                          setDateRange({ from: selectedDate, to: startDate });
                                        } else {
                                          // Normal end date selection
                                          setDateRange({ 
                                            from: startDate || selectedDate, // Keep start date if it exists
                                            to: selectedDate 
                                          });
                                        }
                                        setShowDatePicker(false);
                                      }
                                    }}
                                  >
                                    {day}
                                  </div>
                                </td>
                              );
                              
                              // If we've reached the end of a week, start a new row
                              if (days.length === 7) {
                                rows.push(<tr key={`row-${rows.length}`}>{days}</tr>);
                                days = [];
                              }
                            }
                            
                            // Next month days
                            if (days.length > 0) {
                              const remainingCells = 7 - days.length;
                              for (let i = 1; i <= remainingCells; i++) {
                                const nextNextDate = new Date(nextMonthYear, nextMonth + 1, i);
                                
                                days.push(
                                  <td key={`next-${i}`} className="outside-month">
                                    <div 
                                      className="calendar-day"
                                      onClick={() => {
                                        if (startDate && !endDate) {
                                          // If selecting end date after start date
                                          if (nextNextDate >= startDate) {
                                            setDateRange({ from: startDate, to: nextNextDate });
                                          } else {
                                            // If end date is before start date, swap them
                                            setDateRange({ from: nextNextDate, to: startDate });
                                          }
                                          setShowDatePicker(false);
                                        } else {
                                          // Start new selection
                                          setDateRange({ from: nextNextDate, to: null });
                                          // Don't close the picker yet, wait for the second date
                                        }
                                      }}
                                    >
                                      {i}
                                    </div>
                                  </td>
                                );
                              }
                              rows.push(<tr key={`row-${rows.length}`}>{days}</tr>);
                            }
                            
                            return rows;
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                <div className="calendar-footer">
                  <div className="preset-buttons">
                    <button onClick={() => handleDatePreset('today')}>Hoy</button>
                    <button onClick={() => handleDatePreset('thisWeek')}>Esta semana</button>
                    <button onClick={() => handleDatePreset('thisMonth')}>Este mes</button>
                  </div>
                </div>
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