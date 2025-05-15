import React from 'react';
import './Tables.css';

/**
 * Componente Cell - Celda de tabla para mostrar información
 * @param {Object} props - Propiedades del componente
 * @param {string|JSX.Element} props.children - Contenido de la celda
 * @param {string} props.className - Clase adicional para el componente
 * @returns {JSX.Element} - Celda de datos
 */
const Cell = ({ children, className = '' }) => {
  return (
    <div className={`cell ${className}`}>
      <div className="text">
        <div className="text2">{children}</div>
      </div>
    </div>
  );
};

export default Cell;
