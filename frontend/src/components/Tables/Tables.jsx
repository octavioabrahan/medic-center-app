import React from 'react';
import './Tables.css';

/**
 * Componente Tables - Tabla reutilizable para mostrar datos en columnas y filas
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.headers - Array de strings para los encabezados de la tabla
 * @param {Array} props.rows - Array de arrays con los datos para cada fila
 * @param {Function} props.renderCustomCell - Función opcional para renderizar celdas personalizadas
 * @param {string} props.className - Clase adicional para la tabla
 * @returns {JSX.Element} - Componente de tabla
 */
const Tables = ({ 
  headers = [], 
  rows = [],
  renderCustomCell,
  className = '' 
}) => {
  return (
    <div className={`table-container ${className}`}>
      <div className="table">
        <div className="table-header">
          {headers.map((header, index) => (
            <div key={index} className="header-cell" style={{ flex: 1 }}>
              <div className="text">
                <div className="text2">{header}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="table-body">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="table-row">
              {row.map((cell, cellIndex) => (
                <div key={cellIndex} className="cell" style={{ flex: 1 }}>
                  {renderCustomCell ? (
                    renderCustomCell(cell, cellIndex, rowIndex)
                  ) : (
                    <div className="text">
                      <div className="text2">{cell}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tables;
