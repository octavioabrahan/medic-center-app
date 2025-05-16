import React from 'react';
import './Tables.css';

/**
 * Componente Table - Tabla reutilizable
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.headers - Array de strings para los encabezados de la tabla
 * @param {Array} props.data - Array de objetos con los datos para mostrar
 * @param {Array} props.columns - Array de strings con las claves de los datos a mostrar
 * @param {Function} props.renderCustomCell - Función opcional para renderizar celdas personalizadas
 * @param {string} props.className - Clase adicional para la tabla
 * @returns {JSX.Element} - Componente de tabla
 */
const Table = ({ 
  headers = [], 
  data = [], 
  columns = [],
  renderCustomCell,
  className = ''
}) => {
  return (
    <div className={`table-container ${className}`}>
      <div className="table">
        <div className="table-header">
          {headers.map((header, index) => (
            <div key={`header-${index}`} className="header-cell" style={{ flex: 1 }}>
              <div className="text">
                <div className="text2">{header}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="table-body">
          {data.map((row, rowIndex) => (
            <div 
              key={`row-${rowIndex}`} 
              className="table-row" 
              onClick={row.onRowClick ? () => row.onRowClick(row) : undefined}
              style={row.onRowClick ? { cursor: 'pointer' } : {}}
            >
              {columns.map((column, colIndex) => (
                <div 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className="cell" 
                  style={{ flex: 1 }}
                  onClick={(e) => column === 'acciones' && e.stopPropagation()} // Evita que los clicks en acciones propaguen al row
                >
                  {renderCustomCell ? (
                    // Si renderCustomCell devuelve null, mostrar el valor por defecto
                    renderCustomCell(row, column, colIndex) || (
                      <div className="text">
                        <div className="text2">{row[column]}</div>
                      </div>
                    )
                  ) : (
                    <div className="text">
                      <div className="text2">{row[column]}</div>
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

export default Table;
