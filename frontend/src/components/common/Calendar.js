import React, { useState, useEffect } from "react";
import { 
  startOfDay, endOfDay,
  subDays, isBefore, isAfter, isSameDay, isSameMonth
} from "date-fns";
import "./Calendar.css";

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

  // Handle date range change
  useEffect(() => {
    if (onDateRangeChange && dateRange?.from) {
      onDateRangeChange(dateRange);
    }
  }, [dateRange, onDateRangeChange]);

  // Handle preset date ranges
  const handleDatePreset = (days) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);
    
    const newRange = { 
      from: startOfDay(startDate), 
      to: endOfDay(endDate)
    };
    
    setDateRange(newRange);
    if (onDateRangeChange) {
      onDateRangeChange(newRange);
    }
  };

  // Set today as selected date
  const handleToday = () => {
    const todayDate = new Date();
    setDateRange({ 
      from: startOfDay(todayDate), 
      to: endOfDay(todayDate)
    });
    
    if (onDateRangeChange) {
      onDateRangeChange({ 
        from: startOfDay(todayDate), 
        to: endOfDay(todayDate)
      });
    }

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
      
      // These days don't belong to the current month
      // They don't get range styling unless the range spans across months
      const isSelected = isInSelectedDate(prevDate, prevDate.getMonth(), prevDate.getFullYear());
      const rangeClass = isInSelectedRange(prevDate, prevDate.getMonth(), prevDate.getFullYear());
      
      days.push(
        <td key={`prev-${i}`} className="outside-month">
          <div 
            className={`calendar-day ${isSelected ? 'selected' : ''} ${rangeClass}`}
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
      
      // These days belong to the current month
      const isSelected = isInSelectedDate(date, month, year);
      const rangeClass = isInSelectedRange(date, month, year);
      
      days.push(
        <td key={`day-${day}`}>
          <div 
            className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${rangeClass}`}
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
        
        // These days don't belong to the current month
        // They don't get range styling unless the range spans across months
        const isSelected = isInSelectedDate(nextDate, nextDate.getMonth(), nextDate.getFullYear());
        const rangeClass = isInSelectedRange(nextDate, nextDate.getMonth(), nextDate.getFullYear());
        
        days.push(
          <td key={`next-${i}`} className="outside-month">
            <div 
              className={`calendar-day ${isSelected ? 'selected' : ''} ${rangeClass}`}
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

  // Helper function to check if a date is the start or end of the selected range
  const isInSelectedDate = (date, currentMonth, currentYear) => {
    // Only treat as selected if it's in its actual month
    const isActualMonth = date.getMonth() === currentMonth;
    
    // Check if date is the temporary selection during range selection
    if (isSelectingRange && rangeStart && isSameDay(date, rangeStart) && isActualMonth) {
      return true;
    }
    
    // Check if date is the start of the confirmed range
    if (dateRange?.from && isSameDay(date, dateRange.from) && isActualMonth) {
      return true;
    }
    
    // Check if date is the end of the confirmed range (only if different from start)
    if (dateRange?.to && dateRange?.from && 
        !isSameDay(dateRange.from, dateRange.to) && 
        isSameDay(date, dateRange.to) && isActualMonth) {
      return true;
    }
    
    return false;
  };
  
  // Helper function to check if a date is within the selected range (but not start/end)
  const isInSelectedRange = (date, currentMonth, currentYear) => {
    // Only apply range styling if it's in its actual month
    const isActualMonth = date.getMonth() === currentMonth;
    
    // If we're in the middle of selecting a range
    if (isSelectingRange && rangeStart) {
      if (isSameDay(date, rangeStart) && isActualMonth) {
        return 'range-start';
      }
      return '';
    }
    
    // If we have a complete range selection
    if (!dateRange?.from || !dateRange?.to) {
      return '';
    }
    
    // Handling start and end of range
    if (isSameDay(date, dateRange.from) && isActualMonth) {
      return dateRange.from.getTime() === dateRange.to.getTime() ? '' : 'range-start';
    }
    
    if (isSameDay(date, dateRange.to) && isActualMonth && !isSameDay(dateRange.from, dateRange.to)) {
      return 'range-end';
    }
    
    // Check if the date is in the middle of the range
    if (date > startOfDay(dateRange.from) && date < endOfDay(dateRange.to)) {
      return 'range-middle';
    }
    
    return '';
  };
  
  // Handle date selection
  const handleDateSelection = (date) => {
    if (singleDateMode) {
      // In single date mode, just select this date
      setDateRange({ from: date, to: date });
      
      if (onDateRangeChange) {
        onDateRangeChange({ from: date, to: date });
      }
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
          to = date; // Corregido: era "to: date" con dos puntos
        }
        
        // Set the date range
        const newRange = { 
          from: startOfDay(from), 
          to: endOfDay(to) 
        };
        
        setDateRange(newRange);
        
        if (onDateRangeChange) {
          onDateRangeChange(newRange);
        }
        
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
    const months = [];
    
    for (let i = 0; i < 12; i++) {
      months.push(
        <div 
          key={`month-${i}`}
          className={`month-option ${calendarMonth === i ? 'active' : ''}`}
          onClick={() => {
            setCalendarMonth(i);
            setShowMonthPicker(false);
          }}
        >
          {getFullMonthName(i)}
        </div>
      );
    }
    
    return (
      <div className="month-year-picker">
        <div className="picker-header">
          <span>Select Month</span>
          <button 
            className="close-picker"
            onClick={() => setShowMonthPicker(false)}
          >
            ×
          </button>
        </div>
        <div className="picker-options">
          {months}
        </div>
      </div>
    );
  };
  
  // Year picker component
  const renderYearPicker = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    
    for (let year = startYear; year <= endYear; year++) {
      years.push(
        <div 
          key={`year-${year}`}
          className={`year-option ${calendarYear === year ? 'active' : ''}`}
          onClick={() => {
            setCalendarYear(year);
            setShowYearPicker(false);
          }}
        >
          {year}
        </div>
      );
    }
    
    return (
      <div className="month-year-picker year-picker">
        <div className="picker-header">
          <span>Select Year</span>
          <button 
            className="close-picker"
            onClick={() => setShowYearPicker(false)}
          >
            ×
          </button>
        </div>
        <div className="picker-options">
          {years}
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