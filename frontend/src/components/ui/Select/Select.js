import React from 'react';
import PropTypes from 'prop-types';
import styles from './Select.module.css';

/**
 * Componente Select reutilizable
 */
const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccione una opción',
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const uniqueId = id || `select-${name}-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`${styles.selectGroup} ${error ? styles.hasError : ''} ${className}`}>
      {label && (
        <label htmlFor={uniqueId} className={styles.selectLabel}>
          {label} {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}
      
      <select
        id={uniqueId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={styles.select}
        aria-invalid={!!error}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

Select.propTypes = {
  /** Etiqueta del select */
  label: PropTypes.string,
  /** ID único para el select */
  id: PropTypes.string,
  /** Nombre del campo */
  name: PropTypes.string.isRequired,
  /** Valor seleccionado */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Función a llamar cuando cambia el select */
  onChange: PropTypes.func.isRequired,
  /** Opciones para el select: [{value: string|number, label: string, disabled: boolean}] */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool
    })
  ),
  /** Texto de placeholder */
  placeholder: PropTypes.string,
  /** Mensaje de error */
  error: PropTypes.string,
  /** Si el select está deshabilitado */
  disabled: PropTypes.bool,
  /** Si el select es obligatorio */
  required: PropTypes.bool,
  /** Clases CSS adicionales */
  className: PropTypes.string,
};

export default Select;