import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ccc',
          borderTop: '4px solid #333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto',
        }}
      ></div>
      <p>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;