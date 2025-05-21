import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';
import './SimpleSearch.css';

/**
 * A simplified search field component that avoids CSS conflicts
 */
const SimpleSearch = ({ value, onChange, placeholder }) => {
  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="simple-search-container">
      <input
        className="simple-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Buscar examen por nombre"}
      />
      {value ? (
        <button
          type="button"
          className="simple-search-clear"
          onClick={handleClear}
          aria-label="Limpiar búsqueda"
        >
          <XMarkIcon width={16} height={16} />
        </button>
      ) : (
        <div className="simple-search-icon">
          <MagnifyingGlassIcon width={16} height={16} />
        </div>
      )}
    </div>
  );
};

export default SimpleSearch;
