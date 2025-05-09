import React from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css';

/**
 * Componente Card reutilizable
 */
const Card = ({
  title,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerContent,
  footerClassName = '',
  ...props
}) => {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {title && (
        <div className={`${styles.cardHeader} ${headerClassName}`}>
          {typeof title === 'string' ? <h3 className={styles.cardTitle}>{title}</h3> : title}
        </div>
      )}
      
      <div className={`${styles.cardBody} ${bodyClassName}`}>
        {children}
      </div>
      
      {footerContent && (
        <div className={`${styles.cardFooter} ${footerClassName}`}>
          {footerContent}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  /** Título de la tarjeta, puede ser string o un nodo React */
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  /** Contenido principal de la tarjeta */
  children: PropTypes.node.isRequired,
  /** Clases CSS adicionales para la tarjeta */
  className: PropTypes.string,
  /** Clases CSS adicionales para el encabezado */
  headerClassName: PropTypes.string,
  /** Clases CSS adicionales para el cuerpo */
  bodyClassName: PropTypes.string,
  /** Contenido del pie de la tarjeta */
  footerContent: PropTypes.node,
  /** Clases CSS adicionales para el pie */
  footerClassName: PropTypes.string,
};

export default Card;