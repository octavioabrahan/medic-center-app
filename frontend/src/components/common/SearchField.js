import React, { useState, useEffect } from 'react';

/**
 * Componente de campo de búsqueda basado en el diseño de Figma
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.placeholder - Texto de placeholder para el campo
 * @param {string} props.value - Valor actual del campo
 * @param {function} props.onChange - Función a ejecutar cuando cambia el valor
 * @param {function} props.onSearch - Función a ejecutar al presionar enter o hacer clic en el botón de búsqueda
 * @param {boolean} props.disabled - Estado deshabilitado del campo
 * @param {boolean} props.small - Si es true, se usa el tamaño pequeño
 * @param {boolean} props.withButton - Si es true, se muestra un botón de búsqueda
 * @param {string} props.buttonText - Texto para el botón (si withButton es true)
 */
const SearchField = ({
  placeholder = 'Buscar',
  value = '',
  onChange = () => {},
  onSearch = () => {},
  disabled = false,
  small = false,
  withButton = false,
  buttonText = 'Buscar'
}) => {
  const [inputValue, setInputValue] = useState(value);
  
  // Actualizar inputValue cuando cambia el valor externo
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);
    }
  };

  const handleSearch = () => {
    onSearch(inputValue);
  };

  // Determinar las clases dinámicamente basadas en las props
  const searchClasses = [
    'search',
    disabled ? 'state-disabled' : 'state-default',
    inputValue === '' ? 'value-type-placeholder' : 'value-type-text',
    small ? 'size-small' : 'size-default'
  ].filter(Boolean).join(' ');

  return (
    <div className={`search-container ${withButton ? 'search-with-button' : ''}`}>
      <div className={searchClasses}>
        <div className="search-icon-container">
          <svg className="heroicons-micro-magnifying-glass" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <input
          type="text"
          className="value"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
        />
        {inputValue && !disabled && (
          <div className="clear-icon-container" onClick={handleClear}>
            <svg
              className="heroicons-micro-x-mark"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      {withButton && (
        <button className="button variant-primary" onClick={handleSearch}>
          <span className="button-text">{buttonText}</span>
        </button>
      )}
    </div>
  );
};

export default SearchField;
