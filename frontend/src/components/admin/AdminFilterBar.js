import React from 'react';
import './AdminCommon.css';

/**
 * Componente reutilizable para la barra de filtros en las páginas de administración.
 * 
 * @param {Object} props - Las propiedades del componente
 * @param {string} props.searchTerm - El término de búsqueda actual
 * @param {Function} props.setSearchTerm - Función para actualizar el término de búsqueda
 * @param {string} props.searchPlaceholder - Texto placeholder para el campo de búsqueda
 * @param {Array} props.filterOptions - Opciones para el filtro dropdown principal
 * @param {string} props.filterValue - Valor seleccionado actualmente en el filtro dropdown
 * @param {Function} props.setFilterValue - Función para actualizar el valor del filtro
 * @param {string} props.filterLabel - Label para el primer option del dropdown (ej: "Todas las especialidades")
 * @param {boolean} props.showArchived - Estado para mostrar ítems archivados
 * @param {Function} props.setShowArchived - Función para actualizar el estado de mostrar archivados
 * @param {string} props.sortOrder - Orden de clasificación actual ("az" o "za")
 * @param {Function} props.setSortOrder - Función para actualizar el orden de clasificación
 */
const AdminFilterBar = ({ 
  searchTerm = '', 
  setSearchTerm,
  searchPlaceholder = 'Buscar por nombre',
  filterOptions = [], 
  filterValue = '', 
  setFilterValue,
  filterLabel = 'Todos',
  showArchived = false,
  setShowArchived,
  sortOrder = 'az',
  setSortOrder
}) => {
  return (
    <div className="admin-filter-bar">
      {/* Componente de búsqueda */}
      <div className="admin-search">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="search-icon">🔍</span>
      </div>
      
      {/* Dropdown de filtro principal si está disponible */}
      {filterOptions.length > 0 && setFilterValue && (
        <div className="admin-dropdown">
          <select 
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          >
            <option value="">{filterLabel}</option>
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* Checkbox para mostrar archivados */}
      {setShowArchived && (
        <div className="admin-checkbox">
          <input
            type="checkbox"
            id="showArchivedCheckbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          <label htmlFor="showArchivedCheckbox">Mostrar archivados</label>
        </div>
      )}
      
      {/* Botones de ordenamiento A-Z y Z-A */}
      {setSortOrder && (
        <div className="admin-sort-buttons">
          <button 
            className={`sort-btn ${sortOrder === 'az' ? 'active' : ''}`}
            onClick={() => setSortOrder('az')}
            title="Ordenar de A a Z"
          >
            A → Z
          </button>
          <button 
            className={`sort-btn ${sortOrder === 'za' ? 'active' : ''}`}
            onClick={() => setSortOrder('za')}
            title="Ordenar de Z a A"
          >
            Z → A
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminFilterBar;