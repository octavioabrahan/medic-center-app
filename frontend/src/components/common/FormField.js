import React from 'react';

/**
 * Componente de campo de formulario basado en el diseño de Figma
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.id - ID único para el campo (requerido para la accesibilidad)
 * @param {string} props.label - Etiqueta descriptiva para el campo
 * @param {string} props.type - Tipo de input (text, email, password, etc.)
 * @param {string} props.placeholder - Texto de placeholder para el campo
 * @param {string} props.value - Valor actual del campo
 * @param {function} props.onChange - Función a ejecutar cuando cambia el valor
 * @param {boolean} props.required - Si el campo es obligatorio
 * @param {boolean} props.disabled - Estado deshabilitado del campo
 * @param {boolean} props.error - Si hay un error en el campo
 * @param {string} props.errorMessage - Mensaje de error para mostrar
 * @param {string} props.helpText - Texto de ayuda adicional
 */
const FormField = ({
  id,
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  onBlur,
  required = false,
  disabled = false,
  error = false,
  errorMessage = '',
  helpText = '',
  ...props
}) => {
  // Determinar las clases dinámicamente basadas en las props
  const inputClasses = [
    'form-field',
    disabled ? 'state-disabled' : error ? 'state-error' : 'state-default',
    props.className || ''
  ].join(' ').trim();

  // Para selectores, textareas, etc.
  const renderField = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            id={id}
            className="form-field-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            {...props}
          />
        );
      case 'select':
        return (
          <select
            id={id}
            className="form-field-input"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            {...props}
          >
            {props.children}
          </select>
        );
      default:
        return (
          <input
            id={id}
            type={type}
            className="form-field-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            {...props}
          />
        );
    }
  };

  return (
    <div className={inputClasses}>
      {label && (
        <label htmlFor={id} className="form-field-label">
          {label} {required && <span className="form-field-required">*</span>}
        </label>
      )}
      <div className="form-field-container">
        {renderField()}
        {props.icon && <div className="form-field-icon">{props.icon}</div>}
      </div>
      {error && errorMessage && (
        <div className="form-field-error">{errorMessage}</div>
      )}
      {helpText && !error && (
        <div className="form-field-help">{helpText}</div>
      )}
    </div>
  );
};

export default FormField;
