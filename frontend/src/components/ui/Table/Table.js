import React from 'react';
import PropTypes from 'prop-types';
import styles from './Table.module.css';

/**
 * Componente Table reutilizable
 */
const Table = ({
  columns,
  data,
  emptyMessage = 'No hay datos para mostrar',
  striped = true,
  bordered = true,
  hover = true,
  className = '',
  onRowClick,
  headerClassName = '',
  rowClassName = '',
  cellClassName = '',
}) => {
  return (
    <div className={styles.tableResponsive}>
      <table className={`
        ${styles.table} 
        ${striped ? styles.tableStriped : ''} 
        ${bordered ? styles.tableBordered : ''} 
        ${hover ? styles.tableHover : ''}
        ${className}
      `}>
        <thead className={`${styles.tableHeader} ${headerClassName}`}>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={column.key || index} 
                className={`${column.headerClassName || ''} ${styles.tableHeaderCell}`}
                style={column.width ? { width: column.width } : {}}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`${onRowClick ? styles.clickableRow : ''} ${rowClassName}`}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={`${rowIndex}-${column.key || colIndex}`} 
                    className={`${cellClassName} ${column.cellClassName || ''}`}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className={styles.emptyMessage}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  /** Array de definiciones de columnas */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      title: PropTypes.node.isRequired,
      render: PropTypes.func,
      width: PropTypes.string,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
    })
  ).isRequired,
  /** Array de objetos con datos para mostrar */
  data: PropTypes.array.isRequired,
  /** Mensaje a mostrar cuando no hay datos */
  emptyMessage: PropTypes.node,
  /** Si la tabla tendrá filas alternadas */
  striped: PropTypes.bool,
  /** Si la tabla tendrá bordes */
  bordered: PropTypes.bool,
  /** Si las filas tendrán efecto hover */
  hover: PropTypes.bool,
  /** Clases CSS adicionales para la tabla */
  className: PropTypes.string,
  /** Función a llamar cuando se hace clic en una fila */
  onRowClick: PropTypes.func,
  /** Clases CSS adicionales para el encabezado */
  headerClassName: PropTypes.string,
  /** Clases CSS adicionales para las filas */
  rowClassName: PropTypes.string,
  /** Clases CSS adicionales para las celdas */
  cellClassName: PropTypes.string,
};

export default Table;