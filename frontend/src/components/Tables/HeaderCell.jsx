import React from 'react';
import './Tables.css';

/**
 * Componente HeaderCell - Celda de encabezado de tabla
 * @param {Object} props - Propiedades del componente
 * @param {string|JSX.Element} props.children - Contenido de la celda
 * @param {string} props.className - Clase adicional para el componente
 * @returns {JSX.Element} - Celda de encabezado
 */
const HeaderCell = ({ children, className = '' }) => {
  return (
    <div className={`header-cell ${className}`}>
      <div className="text">
        <div className="text2">{children}</div>
      </div>
    </div>
  );
};

export default HeaderCell;
