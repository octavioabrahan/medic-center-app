import React from 'react';
import PropTypes from 'prop-types';
import styles from './Pagination.module.css';

/**
 * Componente Pagination reutilizable
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  visiblePages = 5,
  className = '',
}) => {
  // No renderizar si solo hay una página
  if (totalPages <= 1) return null;
  
  // Función para generar el rango de páginas a mostrar
  const getPageRange = () => {
    const halfVisible = Math.floor(visiblePages / 2);
    let start = Math.max(currentPage - halfVisible, 1);
    let end = Math.min(start + visiblePages - 1, totalPages);
    
    // Ajustar el inicio si estamos cerca del final
    if (end === totalPages) {
      start = Math.max(end - visiblePages + 1, 1);
    }
    
    return Array.from({length: end - start + 1}, (_, i) => start + i);
  };

  const pageNumbers = getPageRange();
  
  return (
    <nav className={`${styles.pagination} ${className}`} aria-label="Paginación">
      <ul className={styles.paginationList}>
        {/* Botón para ir a la primera página */}
        {showFirstLast && currentPage > 1 && (
          <li className={styles.paginationItem}>
            <button
              className={`${styles.paginationLink} ${styles.paginationControl}`}
              onClick={() => onPageChange(1)}
              aria-label="Primera página"
            >
              &laquo;
            </button>
          </li>
        )}
        
        {/* Botón para ir a la página anterior */}
        {currentPage > 1 && (
          <li className={styles.paginationItem}>
            <button
              className={`${styles.paginationLink} ${styles.paginationControl}`}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label="Página anterior"
            >
              &lsaquo;
            </button>
          </li>
        )}
        
        {/* Números de página */}
        {pageNumbers.map(number => (
          <li 
            key={number}
            className={`${styles.paginationItem} ${currentPage === number ? styles.active : ''}`}
          >
            <button
              className={styles.paginationLink}
              onClick={() => onPageChange(number)}
              aria-current={currentPage === number ? 'page' : undefined}
              aria-label={`Página ${number}`}
            >
              {number}
            </button>
          </li>
        ))}
        
        {/* Botón para ir a la página siguiente */}
        {currentPage < totalPages && (
          <li className={styles.paginationItem}>
            <button
              className={`${styles.paginationLink} ${styles.paginationControl}`}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label="Página siguiente"
            >
              &rsaquo;
            </button>
          </li>
        )}
        
        {/* Botón para ir a la última página */}
        {showFirstLast && currentPage < totalPages && (
          <li className={styles.paginationItem}>
            <button
              className={`${styles.paginationLink} ${styles.paginationControl}`}
              onClick={() => onPageChange(totalPages)}
              aria-label="Última página"
            >
              &raquo;
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  /** Página actual */
  currentPage: PropTypes.number.isRequired,
  /** Número total de páginas */
  totalPages: PropTypes.number.isRequired,
  /** Función a llamar cuando cambia la página */
  onPageChange: PropTypes.func.isRequired,
  /** Si mostrar botones para primera y última página */
  showFirstLast: PropTypes.bool,
  /** Número de páginas visibles en el control */
  visiblePages: PropTypes.number,
  /** Clases CSS adicionales */
  className: PropTypes.string,
};

export default Pagination;