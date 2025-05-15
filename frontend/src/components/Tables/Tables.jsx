import React from 'react';
import './Tables.css';

const Tables = ({ headers, rows }) => {
  return (
    <div className="table-container">
      <div className="table">
        <div className="table-header">
          {headers.map((header, index) => (
            <div key={index} className="header-cell">
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
                <div key={cellIndex} className="cell">
                  <div className="text">
                    <div className="text2">{cell}</div>
                  </div>
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
