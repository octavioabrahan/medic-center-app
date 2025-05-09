import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';

/**
 * Componente Modal reutilizable
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  className = '',
}) => {
  useEffect(() => {
    // Prevenir scroll en el body cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Evitar renderizar si el modal está cerrado
  if (!isOpen) return null;

  // Función para cerrar el modal cuando se hace clic en el backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={`${styles.modal} ${styles[`modal--${size}`]} ${className}`}>
        <div className={styles.modalHeader}>
          {title && <h2 className={styles.modalTitle}>{title}</h2>}
          {showCloseButton && (
            <button
              className={styles.modalClose}
              onClick={onClose}
              aria-label="Cerrar"
            >
              &times;
            </button>
          )}
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  /** Si el modal debe mostrarse */
  isOpen: PropTypes.bool.isRequired,
  /** Función para cerrar el modal */
  onClose: PropTypes.func.isRequired,
  /** Título del modal */
  title: PropTypes.string,
  /** Contenido del modal */
  children: PropTypes.node.isRequired,
  /** Tamaño del modal */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /** Si se debe mostrar el botón de cierre */
  showCloseButton: PropTypes.bool,
  /** Clases CSS adicionales */
  className: PropTypes.string,
};

export default Modal;