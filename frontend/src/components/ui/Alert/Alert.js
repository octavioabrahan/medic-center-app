import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Alert.module.css';

/**
 * Componente Alert reutilizable
 */
const Alert = ({
  type = 'info',
  message,
  dismissible = true,
  autoDismiss = false,
  autoDismissTimeout = 5000,
  onDismiss,
  className = '',
  icon,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let timer;
    if (autoDismiss && isVisible) {
      timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissTimeout);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [autoDismiss, autoDismissTimeout, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!isVisible) return null;

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div 
      className={`${styles.alert} ${styles[`alert--${type}`]} ${className}`}
      role="alert"
    >
      <div className={styles.alertContent}>
        <span className={styles.alertIcon}>{getIcon()}</span>
        <div className={styles.alertMessage}>{message}</div>
      </div>
      
      {dismissible && (
        <button
          className={styles.alertClose}
          onClick={handleDismiss}
          aria-label="Cerrar alerta"
          type="button"
        >
          &times;
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  /** Tipo de alerta */
  type: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  /** Mensaje a mostrar */
  message: PropTypes.node.isRequired,
  /** Si la alerta se puede cerrar */
  dismissible: PropTypes.bool,
  /** Si la alerta se cierra automáticamente */
  autoDismiss: PropTypes.bool,
  /** Tiempo antes de cerrar automáticamente (ms) */
  autoDismissTimeout: PropTypes.number,
  /** Función a llamar cuando se cierra la alerta */
  onDismiss: PropTypes.func,
  /** Clases CSS adicionales */
  className: PropTypes.string,
  /** Icono personalizado */
  icon: PropTypes.node,
};

export default Alert;