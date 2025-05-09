import React from 'react';
import PropTypes from 'prop-types';
import styles from './Button.module.css';

/**
 * Componente Button reutilizable
 */
const Button = ({ 
  children, 
  type = 'button', 
  variant = 'primary', 
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[`button--${variant}`]} ${styles[`button--${size}`]} ${fullWidth ? styles['button--full-width'] : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  /** Contenido del botón */
  children: PropTypes.node.isRequired,
  /** Tipo HTML del botón */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  /** Variante visual del botón */
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link']),
  /** Tamaño del botón */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Si el botón debe ocupar todo el ancho disponible */
  fullWidth: PropTypes.bool,
  /** Si el botón está deshabilitado */
  disabled: PropTypes.bool,
  /** Función a ejecutar al hacer click */
  onClick: PropTypes.func,
  /** Clases CSS adicionales */
  className: PropTypes.string,
};

export default Button;