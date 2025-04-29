import React, { useState, useEffect } from "react";
import { 
  format, startOfDay, endOfDay, startOfToday, endOfToday,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addMonths, subMonths, addYears, subYears, isSameDay, isWithinInterval,
  getDay, addDays, subDays
} from "date-fns";
import { es } from "date-fns/locale";
import "./Calendar.css";

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
  
  // Selected date range
  const [dateRange, setDateRange] = useState(
    initialDateRange || (singleDateMode 
      ? { from: new Date(), to: new Date() }
      : { from: startOfWeek(new Date()), to: endOfWeek(new Date()) }
    )
  );
  
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
      
      // Check if date is exactly the selected date
      const isSelected = dateRange?.from && 
        day === dateRange.from.getDate() && 
        month === dateRange.from.getMonth() && 
        year === dateRange.from.getFullYear();
      
      let className = "calendar-day";
      if (isToday) className += " today";
      if (isSelected) className += " selected";
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
      // In single date mode, just select this date
      setDateRange({ from: date, to: date });
      
      if (onDateRangeChange) {
        onDateRangeChange({ from: date, to: date });
      }
    } else {
      // For range selection, we'll use a simpler approach than before
      // Just select the date and update the range
      setDateRange({ from: date, to: date });
      
      if (onDateRangeChange) {
        onDateRangeChange({ from: date, to: date });
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
            <div className="month-title">{getShortMonthName(calendarMonth)} {calendarYear}</div>
            <div className="month-title">{getShortMonthName(nextMonth.month)} {nextMonth.year}</div>
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