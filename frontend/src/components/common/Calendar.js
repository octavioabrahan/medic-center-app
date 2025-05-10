import React, { useState, useCallback } from "react";
import { 
  startOfDay, endOfDay,
  subDays, isBefore, isAfter, isSameDay
} from "date-fns";

const Calendar = ({ 
  onDateRangeChange, 
  initialDateRange = null,
  singleDateMode = false, 
  showPresets = true,
  onClose,
  title = "Seleccione fecha"
}) => {
  // Calendar navigation state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  // Selected date range
  const [dateRange, setDateRange] = useState(
    initialDateRange || (singleDateMode 
      ? { from: new Date(), to: new Date() }
      : { from: new Date(), to: new Date() }
    )
  );
  
  // State for the month/year picker
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  // State for range selection
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [rangeStart, setRangeStart] = useState(null);
  
  // Current date for "today" highlighting
  const today = new Date();

  // Handle date range change - Memoizado para evitar rerenderizaciones infinitas
  const memoizedOnDateRangeChange = useCallback((newRange) => {
    if (onDateRangeChange) {
      onDateRangeChange(newRange);
    }
  }, [onDateRangeChange]);

  // Handle preset date ranges
  const handleDatePreset = (days) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const newRange = { 
      from: startOfDay(startDate), 
      to: endOfDay(endDate)
    };
    
    setDateRange(newRange);
    memoizedOnDateRangeChange(newRange);
  };

  // Set today as selected date
  const handleToday = () => {
    const todayDate = new Date();
    const newRange = { 
      from: startOfDay(todayDate), 
      to: endOfDay(todayDate)
    };
    
    setDateRange(newRange);
    memoizedOnDateRangeChange(newRange);

    // Set calendar view to current month and year
    setCalendarMonth(todayDate.getMonth());
    setCalendarYear(todayDate.getFullYear());
  };

  // Render the calendar body with all days
  const renderCalendarDays = (year, month) => {
    // Function to get the day number in week (0 = Sunday, 1 = Monday, etc.)
    const getAdjustedDay = (date) => {
      return date.getDay();
    };
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Day of week of first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayWeekday = getAdjustedDay(firstDayOfMonth);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const rows = [];
    let days = [];
    
    // Previous month days
    for (let i = 0; i < firstDayWeekday; i++) {
      const prevDay = prevMonthLastDay - (firstDayWeekday - i - 1);
      const prevDate = new Date(year, month - 1, prevDay);
      
      days.push(
        <td key={`prev-${month}-${i}`} className="outside-month">
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
      
      // Check if date is exactly the selected start or end date
      const isStart = dateRange?.from && 
        day === dateRange.from.getDate() && 
        month === dateRange.from.getMonth() && 
        year === dateRange.from.getFullYear();
      
      const isEnd = dateRange?.to && 
        day === dateRange.to.getDate() && 
        month === dateRange.to.getMonth() && 
        year === dateRange.to.getFullYear();
      
      let className = "calendar-day";
      if (isToday) className += " today";
      if (isStart) className += " selected range-start";
      else if (isEnd) className += " selected range-end";
      else if (isInRange) className += " range-middle";
      
      days.push(
        <td key={`day-${year}-${month}-${day}`}>
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
        rows.push(<tr key={`row-${year}-${month}-${rows.length}`}>{days}</tr>);
        days = [];
      }
    }
    
    // Next month days
    if (days.length > 0) {
      const remainingCells = 7 - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        const nextDate = new Date(year, month + 1, i);
        
        days.push(
          <td key={`next-${year}-${month}-${i}`} className="outside-month">
            <div 
              className="calendar-day"
              onClick={() => handleDateSelection(nextDate)}
            >
              {i}
            </div>
          </td>
        );
      }
      rows.push(<tr key={`row-${year}-${month}-${rows.length}`}>{days}</tr>);
    }
    
    return rows;
  };
  
  // Handle date selection
  const handleDateSelection = (date) => {
    if (singleDateMode) {
      // In single date mode, just select this date
      const newRange = { from: date, to: date };
      setDateRange(newRange);
      memoizedOnDateRangeChange(newRange);
    } else {
      // Range selection logic
      if (!isSelectingRange || !rangeStart) {
        // Start range selection - first click
        setRangeStart(date);
        setDateRange({ from: date, to: date });
        setIsSelectingRange(true);
      } else {
        // Complete range selection - second click
        let from, to;
        
        // Ensure correct order (from should be earlier than to)
        if (isBefore(date, rangeStart)) {
          from = date;
          to = rangeStart;
        } else {
          from = rangeStart;
          to = date;
        }
        
        // Set the date range
        const newRange = { 
          from: startOfDay(from), 
          to: endOfDay(to) 
        };
        
        setDateRange(newRange);
        memoizedOnDateRangeChange(newRange);
        
        // Reset range selection
        setIsSelectingRange(false);
        setRangeStart(null);
      }
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
  
  const goToPrevYear = () => {
    const prevYear = new Date(calendarYear - 1, calendarMonth);
    setCalendarYear(prevYear.getFullYear());
  };
  
  const goToNextYear = () => {
    const nextYear = new Date(calendarYear + 1, calendarMonth);
    setCalendarYear(nextYear.getFullYear());
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
  
  // Get abbreviated month name
  const getShortMonthName = (month) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[month];
  };
  
  // Get full month name
  const getFullMonthName = (month) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[month];
  };
  
  // Month picker component
  const renderMonthPicker = (forYear) => {
    const monthsData = [
      { value: 0, name: 'Ene' },
      { value: 1, name: 'Feb' },
      { value: 2, name: 'Mar' },
      { value: 3, name: 'Abr' },
      { value: 4, name: 'May' },
      { value: 5, name: 'Jun' },
      { value: 6, name: 'Jul' },
      { value: 7, name: 'Ago' },
      { value: 8, name: 'Sep' },
      { value: 9, name: 'Oct' },
      { value: 10, name: 'Nov' },
      { value: 11, name: 'Dic' }
    ];
    
    return (
      <div className="month-year-picker">
        <div className="picker-header">
          <span>Seleccionar Mes</span>
          <button 
            className="close-picker"
            onClick={() => setShowMonthPicker(false)}
          >
            ×
          </button>
        </div>
        <div className="picker-options month-grid">
          {monthsData.map(month => (
            <div 
              key={`month-picker-${month.value}`}
              className={`month-option ${calendarMonth === month.value ? 'active' : ''}`}
              onClick={() => {
                setCalendarMonth(month.value);
                setShowMonthPicker(false);
              }}
            >
              {month.name}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Year picker component
  const renderYearPicker = () => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 5;
    const years = [];
    
    // Generar años para seleccionar
    for (let i = 0; i < 12; i++) {
      const year = startYear + i;
      years.push({
        year: year,
        isActive: calendarYear === year
      });
    }
    
    return (
      <div className="month-year-picker year-picker">
        <div className="picker-header">
          <span>Seleccionar Año</span>
          <button 
            className="close-picker"
            onClick={() => setShowYearPicker(false)}
          >
            ×
          </button>
        </div>
        <div className="picker-options">
          {years.map(yearObj => (
            <div 
              key={`year-picker-${yearObj.year}`}
              className={`year-option ${yearObj.isActive ? 'active' : ''}`}
              onClick={() => {
                setCalendarYear(yearObj.year);
                setShowYearPicker(false);
              }}
            >
              {yearObj.year}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="custom-calendar-wrapper">
      {showPresets && (
        <div className="date-presets">
          <button 
            onClick={handleToday}
            className="preset-button today-button"
          >
            Today
          </button>
          <button 
            onClick={() => handleDatePreset(7)}
            className="preset-button"
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => handleDatePreset(14)}
            className="preset-button"
          >
            Last 14 Days
          </button>
          <button 
            onClick={() => handleDatePreset(30)}
            className="preset-button"
          >
            Last 30 Days
          </button>
        </div>
      )}
      
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="month-navigation">
            <button className="nav-button" onClick={goToPrevYear} title="Previous Year">&lt;&lt;</button>
            <button className="nav-button" onClick={goToPrevMonth} title="Previous Month">&lt;</button>
          </div>
          
          <div className="month-titles">
            <div className="month-title">
              <span 
                className="month-selector" 
                onClick={() => setShowMonthPicker(true)}
              >
                {getShortMonthName(calendarMonth)}
              </span>{' '}
              <span 
                className="year-selector" 
                onClick={() => setShowYearPicker(true)}
              >
                {calendarYear}
              </span>
              
              {showMonthPicker && renderMonthPicker(calendarYear)}
              {showYearPicker && renderYearPicker()}
            </div>
            <div className="month-title">
              <span 
                className="month-selector" 
                onClick={() => {
                  setCalendarMonth(nextMonth.month);
                  setCalendarYear(nextMonth.year);
                  setShowMonthPicker(true);
                }}
              >
                {getShortMonthName(nextMonth.month)}
              </span>{' '}
              <span 
                className="year-selector" 
                onClick={() => {
                  setCalendarMonth(nextMonth.month);
                  setCalendarYear(nextMonth.year);
                  setShowYearPicker(true);
                }}
              >
                {nextMonth.year}
              </span>
            </div>
          </div>
          
          <div className="month-navigation">
            <button className="nav-button" onClick={goToNextMonth} title="Next Month">&gt;</button>
            <button className="nav-button" onClick={goToNextYear} title="Next Year">&gt;&gt;</button>
          </div>
        </div>
        
        <div className="two-month-container">
          {/* First month */}
          <div className="month-container">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th>Su</th>
                  <th>Mo</th>
                  <th>Tu</th>
                  <th>We</th>
                  <th>Th</th>
                  <th>Fr</th>
                  <th>Sa</th>
                </tr>
              </thead>
              <tbody>
                {renderCalendarDays(calendarYear, calendarMonth)}
              </tbody>
            </table>
          </div>
          
          {/* Second month */}
          <div className="month-container">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th>Su</th>
                  <th>Mo</th>
                  <th>Tu</th>
                  <th>We</th>
                  <th>Th</th>
                  <th>Fr</th>
                  <th>Sa</th>
                </tr>
              </thead>
              <tbody>
                {renderCalendarDays(nextMonth.year, nextMonth.month)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;