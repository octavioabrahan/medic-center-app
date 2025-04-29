import React, { useState, useEffect } from "react";
import { 
  format, startOfDay, endOfDay, startOfToday, endOfToday,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addMonths, subMonths, addYears, subYears, isSameDay, isWithinInterval,
  getDay
} from "date-fns";
import { es } from "date-fns/locale";
import "./Calendar.css";

const MonthSelector = ({ currentMonth, currentYear, onSelect, onCancel }) => {
  const monthNames = [
    'Ene', 'Feb', 'Mar', 
    'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep',
    'Oct', 'Nov', 'Dic'
  ];
  
  return (
    <div className="month-selector">
      <h4>Seleccione mes</h4>
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
  // Create an array of years centered around current year
  const years = [];
  const startYear = 2020;
  const endYear = 2030;
  
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  
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

const Calendar = ({ 
  onDateRangeChange, 
  initialDateRange = null,
  singleDateMode = false, 
  showPresets = true,
  onClose,
  title = "Seleccione fecha"
}) => {
  // Current view state (calendar, month selector, or year selector)
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  // Calendar navigation state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  // Date selection mode ('start' or 'end')
  const [datePickerMode, setDatePickerMode] = useState(singleDateMode ? 'single' : 'start');
  
  // Selected date range
  const [dateRange, setDateRange] = useState(
    initialDateRange || (singleDateMode 
      ? { from: new Date(), to: new Date() }
      : { from: startOfWeek(new Date()), to: endOfWeek(new Date()) }
    )
  );

  // Handle date range change
  useEffect(() => {
    if (onDateRangeChange && dateRange?.from) {
      onDateRangeChange(dateRange);
    }
  }, [dateRange, onDateRangeChange]);

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
    // Do not close automatically, let user decide when to close
  };

  // Render the calendar body with all days
  const renderCalendarBody = (year, month, isSecondMonth = false) => {
    // Convert Sunday (0) to 6, and other days to day-1 (Monday = 0, Tuesday = 1, etc.)
    const getAdjustedDay = (date) => {
      const day = date.getDay();
      return day === 0 ? 6 : day - 1;
    };
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Day of week of first day (0 = Monday, 1 = Tuesday, etc. with our adjustment)
    const firstDayWeekday = getAdjustedDay(firstDayOfMonth);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Current date (for highlighting today)
    const today = new Date();
    
    const rows = [];
    let days = [];
    
    // Previous month days
    for (let i = 0; i < firstDayWeekday; i++) {
      const prevDay = prevMonthLastDay - (firstDayWeekday - i - 1);
      const prevDate = new Date(year, month - 1, prevDay);
      
      days.push(
        <td key={`prev-${i}`} className="outside-month">
          <div 
            className="calendar-day"
            onClick={() => handleDateSelection(prevDate)}
          >
            {prevDay}
          </div>
        </td>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = day === today.getDate() && 
                    month === today.getMonth() && 
                    year === today.getFullYear();
      
      // Check if date is within the selected range
      const isInRange = dateRange?.from && dateRange?.to && 
        date >= startOfDay(dateRange.from) && 
        date <= endOfDay(dateRange.to);
      
      // Check if date is exactly the start or end date
      const isRangeStart = dateRange?.from && 
        day === dateRange.from.getDate() && 
        month === dateRange.from.getMonth() && 
        year === dateRange.from.getFullYear();
      
      const isRangeEnd = dateRange?.to && 
        day === dateRange.to.getDate() && 
        month === dateRange.to.getMonth() && 
        year === dateRange.to.getFullYear();
      
      let className = "calendar-day";
      if (isToday) className += " today";
      if (isRangeStart) className += " range-start selected";
      else if (isRangeEnd) className += " range-end selected";
      else if (isInRange) className += " range-middle";
      
      days.push(
        <td key={`day-${day}`}>
          <div 
            className={className}
            onClick={() => handleDateSelection(date)}
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
        const nextDate = new Date(year, month + 1, i);
        
        days.push(
          <td key={`next-${i}`} className="outside-month">
            <div 
              className="calendar-day"
              onClick={() => handleDateSelection(nextDate)}
            >
              {i}
            </div>
          </td>
        );
      }
      rows.push(<tr key={`row-${rows.length}`}>{days}</tr>);
    }
    
    return rows;
  };
  
  // Handle date selection
  const handleDateSelection = (date) => {
    if (singleDateMode) {
      // In single date mode, just select this date and close
      setDateRange({ from: date, to: date });
      onClose && onClose();
      return;
    }
    
    if (datePickerMode === 'start') {
      // If we're selecting a start date
      if (dateRange?.to && date > dateRange.to) {
        // If selected start date is after current end date, reset end date
        setDateRange({ from: date, to: null });
        setDatePickerMode('end'); // Switch to end date selection
      } else {
        // Normal start date selection
        setDateRange({ 
          from: date, 
          to: dateRange?.to || date // Keep end date if it exists
        });
        
        if (!dateRange?.to) {
          setDatePickerMode('end'); // Switch to end date selection if no end date
        }
      }
    } else {
      // If we're selecting an end date
      if (dateRange?.from && date < dateRange.from) {
        // If selected end date is before start date, swap them
        setDateRange({ from: date, to: dateRange.from });
      } else {
        // Normal end date selection
        setDateRange({ 
          from: dateRange?.from || date, // Keep start date if it exists
          to: date 
        });
      }
      setDatePickerMode('start'); // Reset to start selection mode
      // Don't close automatically, let the user apply the selection
    }
  };
  
  // Calendar navigation handlers
  const goToPrevMonth = () => {
    const prevMonth = new Date(calendarYear, calendarMonth - 1);
    setCalendarMonth(prevMonth.getMonth());
    setCalendarYear(prevMonth.getFullYear());
  };
  
  const goToNextMonth = () => {
    const nextMonth = new Date(calendarYear, calendarMonth + 1);
    setCalendarMonth(nextMonth.getMonth());
    setCalendarYear(nextMonth.getFullYear());
  };
  
  const goToPrevYear = () => setCalendarYear(calendarYear - 1);
  const goToNextYear = () => setCalendarYear(calendarYear + 1);
  
  // Handle month/year selection
  const handleMonthSelect = (month) => {
    setCalendarMonth(month);
    setShowMonthPicker(false);
  };
  
  const handleYearSelect = (year) => {
    setCalendarYear(year);
    setShowYearPicker(false);
  };
  
  // Render the second month
  const getNextMonthData = () => {
    const nextMonthDate = new Date(calendarYear, calendarMonth + 1);
    return {
      month: nextMonthDate.getMonth(),
      year: nextMonthDate.getFullYear()
    };
  };
  
  const nextMonth = getNextMonthData();
  
  // Get month name for display
  const getMonthName = (month) => {
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return monthNames[month];
  };
  
  // Handle Apply button click
  const handleApply = () => {
    onClose && onClose();
  };

  return (
    <div className="custom-calendar-wrapper">
      {showPresets && (
        <div className="date-presets">
          <button 
            onClick={() => handleDatePreset('today')}
            className="preset-button"
          >
            Hoy
          </button>
          <button 
            onClick={() => handleDatePreset('thisWeek')}
            className="preset-button"
          >
            Esta Semana
          </button>
          <button 
            onClick={() => handleDatePreset('thisMonth')}
            className="preset-button"
          >
            Este Mes
          </button>
        </div>
      )}
      
      {showMonthPicker ? (
        <MonthSelector
          currentMonth={calendarMonth}
          currentYear={calendarYear}
          onSelect={handleMonthSelect}
          onCancel={() => setShowMonthPicker(false)}
        />
      ) : showYearPicker ? (
        <YearSelector
          currentYear={calendarYear}
          onSelect={handleYearSelect}
          onCancel={() => setShowYearPicker(false)}
        />
      ) : (
        <div className="calendar-container">
          <div className="two-month-container">
            {/* First month */}
            <div className="month-container">
              <div className="calendar-header">
                <button className="nav-button" title="Anterior" onClick={goToPrevMonth}>«</button>
                <button className="nav-button" title="Anterior" onClick={goToPrevMonth}>‹</button>
                <div className="month-year-display">
                  <span onClick={() => setShowMonthPicker(true)} className="month-label">
                    {getMonthName(calendarMonth)} {calendarYear}
                  </span>
                </div>
                <button className="nav-button" title="Siguiente" onClick={goToNextMonth}>›</button>
                <button className="nav-button" title="Siguiente" onClick={goToNextYear}>»</button>
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
                  {renderCalendarBody(calendarYear, calendarMonth)}
                </tbody>
              </table>
            </div>
            
            {/* Second month */}
            <div className="month-container">
              <div className="calendar-header">
                <button className="nav-button" title="Anterior" onClick={goToPrevMonth}>«</button>
                <button className="nav-button" title="Anterior" onClick={goToPrevMonth}>‹</button>
                <div className="month-year-display">
                  <span onClick={() => setShowMonthPicker(true)} className="month-label">
                    {getMonthName(nextMonth.month)} {nextMonth.year}
                  </span>
                </div>
                <button className="nav-button" title="Siguiente" onClick={goToNextMonth}>›</button>
                <button className="nav-button" title="Siguiente" onClick={goToNextYear}>»</button>
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
                  {renderCalendarBody(nextMonth.year, nextMonth.month, true)}
                </tbody>
              </table>
            </div>
          </div>
          
          {!singleDateMode && (
            <div className="calendar-actions">
              <button onClick={onClose} className="calendar-button cancel">
                Cancelar
              </button>
              <button 
                onClick={handleApply}
                disabled={!dateRange?.from || !dateRange?.to} 
                className="calendar-button confirm"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;