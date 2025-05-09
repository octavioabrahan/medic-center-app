import React from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

/**
 * Componente Input reutilizable
 */
const Input = ({
  type = 'text',
  label,
  id,
  name,
  value,
  onChange,
  placeholder = '',
  error,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const uniqueId = id || `input-${name}-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className={`${styles.inputGroup} ${error ? styles.hasError : ''} ${className}`}>
      {label && (
        <label htmlFor={uniqueId} className={styles.inputLabel}>
          {label} {required && <span className={styles.requiredMark}>*</span>}
        </label>
      )}
      
      <input
        type={type}
        id={uniqueId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={styles.input}
        aria-invalid={!!error}
        {...props}
      />
      
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

Input.propTypes = {
  /** Tipo de input */
  type: PropTypes.string,
  /** Etiqueta del input */
  label: PropTypes.string,
  /** ID único para el input */
  id: PropTypes.string,
  /** Nombre del campo */
  name: PropTypes.string.isRequired,
  /** Valor del input */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Función a llamar cuando cambia el input */
  onChange: PropTypes.func.isRequired,
  /** Texto de placeholder */
  placeholder: PropTypes.string,
  /** Mensaje de error */
  error: PropTypes.string,
  /** Si el input está deshabilitado */
  disabled: PropTypes.bool,
  /** Si el input es obligatorio */
  required: PropTypes.bool,
  /** Clases CSS adicionales */
  className: PropTypes.string,
};

export default Input;