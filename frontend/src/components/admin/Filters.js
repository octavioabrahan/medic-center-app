import React from 'react';
import Calendar from '../common/Calendar';

const Filters = ({
  searchTerm,
  setSearchTerm,
  status,
  handleFiltro,
  dateRange,
  toggleDatePicker,
  showDatePicker,
  setShowDatePicker,
  handleDateRangeChange,
  profesionales,
  filtroProfesional,
  setFiltroProfesional
}) => {
  return (
    <div className="citas-filters">
      <div className="search-box">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button">🔍</button>
      </div>

      <div className="filter-group">
        <select
          name="status"
          value={status || ''}
          onChange={handleFiltro}
          className="filter-select"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
        </select>

        <button className="date-picker-input" onClick={toggleDatePicker}>
          📅 {dateRange.from && dateRange.to ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}` : 'Seleccionar fechas'}
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
  );
};

export default Filters;