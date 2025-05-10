import React from 'react';
import SearchField from '../common/SearchField';
import FormField from '../common/FormField';
// Eliminada la importación CSS redundante que ahora está en main.css

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
 * @param {ReactNode} props.children - Elementos hijos (botones de acción) que se mostrarán en la barra de filtros
 * @param {boolean} props.isExcepciones - Indica si es el caso de excepciones
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
  setSortOrder,
  children,
  isExcepciones // Añadido el parámetro isExcepciones
}) => {
  return (
    <div className="admin-filter-bar">
      <div className="filter-section">
        {/* Componente de búsqueda actualizado con el nuevo SearchField */}
        <div className="admin-search">
          <SearchField
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => {}} // No es necesaria una acción específica al presionar Enter
            small={true}
          />
        </div>
        
        {/* Dropdown de filtro principal actualizado con FormField si está disponible */}
        {filterOptions.length > 0 && setFilterValue && (
          <div className="admin-dropdown">
            <FormField
              id="adminFilter"
              type="select"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            >
              <option value="">{filterLabel}</option>
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormField>
          </div>
        )}
        
        {/* Botones de ordenamiento A-Z y Z-A con estilo actualizado */}
        {setSortOrder && (
          <div className="admin-sort-buttons">
            <button 
              className={`sort-btn ${sortOrder === 'az' ? 'active' : ''}`}
              onClick={() => setSortOrder('az')}
              title="Ordenar de A a Z"
              aria-label="Ordenar de A a Z"
            >
              A → Z
            </button>
            <button 
              className={`sort-btn ${sortOrder === 'za' ? 'active' : ''}`}
              onClick={() => setSortOrder('za')}
              title="Ordenar de Z a A"
              aria-label="Ordenar de Z a A"
            >
              Z → A
            </button>
          </div>
        )}

        {/* Checkbox para mostrar archivados con estilo mejorado */}
        {setShowArchived && !isExcepciones && (
          <div className="show-archived">
            <input
              type="checkbox"
              id="showArchivedCheckbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.value)}
            />
            <label htmlFor="showArchivedCheckbox">Mostrar archivados</label>
          </div>
        )}
      </div>
      
      {/* Renderizar los botones de acción (children) */}
      {children}
    </div>
  );
};

export default AdminFilterBar;