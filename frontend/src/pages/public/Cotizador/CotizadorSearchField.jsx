import React from 'react';
import SearchField from '../../../components/Inputs/SearchField';
import './CotizadorSearch.css';

/**
 * A wrapped version of SearchField specifically for the Cotizador component
 * This helps isolate styling issues
 */
const CotizadorSearchField = ({ value, onChange, placeholder, ...props }) => {
  return (
    <div className="cotizador-search-wrapper">
      <SearchField
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Buscar examen por nombre"}
        fillContainer
        onClear={() => onChange('')}
        className="cotizador-search-field"
        {...props}
      />
    </div>
  );
};

export default CotizadorSearchField;
