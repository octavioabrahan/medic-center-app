import React, { useEffect, useState } from 'react';
import { auth } from '../api';

/**
 * Componente para probar y depurar la autenticación
 * Este componente debe incluirse en una ruta de desarrollo
 * para visualizar y gestionar el estado de autenticación
 */
function AuthDebugger() {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('authToken'),
    user: localStorage.getItem('user'),
    isAuthenticated: auth.isAuthenticated()
  });
  
  // Actualizar el estado cuando cambian los datos de auth
  const updateAuthState = () => {
    setAuthState({
      token: localStorage.getItem('authToken'),
      user: localStorage.getItem('user'),
      isAuthenticated: auth.isAuthenticated()
    });
  };
  
  // Limpiar la autenticación
  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    updateAuthState();
  };
  
  // Simular un login para pruebas
  const simulateLogin = (role = 'admin') => {
    // Crear un token falso que expire en 1 hora
    const now = new Date();
    const expiryTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora
    
    // Crear componentes JWT
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      id: 1,
      email: 'test@example.com',
      name: 'Usuario de Prueba',
      roles: [role],
      exp: Math.floor(expiryTime.getTime() / 1000)
    }));
    const signature = btoa('test-signature');
    
    // Token completo
    const token = `${header}.${payload}.${signature}`;
    
    // Guardar en localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'test@example.com',
      name: 'Usuario de Prueba',
      last_name: 'Apellido',
      roles: [role]
    }));
    
    updateAuthState();
  };
  
  // Verificar detalles del token
  const getTokenDetails = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
      // Intentar decodificar el payload
      const parts = token.split('.');
      if (parts.length !== 3) return { error: 'Token no tiene formato JWT válido' };
      
      const decodedPayload = JSON.parse(atob(parts[1]));
      const expiryDate = decodedPayload.exp ? new Date(decodedPayload.exp * 1000) : null;
      const isExpired = expiryDate ? expiryDate < new Date() : false;
      
      return {
        payload: decodedPayload,
        expiryDate,
        isExpired
      };
    } catch (error) {
      return { error: error.message };
    }
  };
  
  const tokenDetails = getTokenDetails();
  
  // Estilo para el componente
  const styles = {
    container: {
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '800px',
      margin: '20px auto'
    },
    header: {
      borderBottom: '1px solid #ddd',
      paddingBottom: '10px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    section: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#fff',
      borderRadius: '5px',
      border: '1px solid #ddd'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '10px'
    },
    dangerButton: {
      backgroundColor: '#e74c3c'
    },
    infoText: {
      backgroundColor: '#f1f1f1',
      padding: '10px',
      borderRadius: '4px',
      whiteSpace: 'pre-wrap',
      overflow: 'auto',
      maxHeight: '200px',
      fontFamily: 'monospace',
      fontSize: '14px'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '5px 10px',
      borderRadius: '20px',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: authState.isAuthenticated ? '#2ecc71' : '#e74c3c'
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Depurador de Autenticación</h2>
        <span style={styles.statusBadge}>
          {authState.isAuthenticated ? 'Autenticado' : 'No Autenticado'}
        </span>
      </div>
      
      <div style={styles.section}>
        <h3>Acciones</h3>
        <button 
          style={styles.button} 
          onClick={() => simulateLogin('admin')}
        >
          Simular Login (Admin)
        </button>
        <button 
          style={styles.button} 
          onClick={() => simulateLogin('user')}
        >
          Simular Login (Usuario)
        </button>
        <button 
          style={{...styles.button, ...styles.dangerButton}} 
          onClick={clearAuth}
        >
          Borrar Autenticación
        </button>
      </div>
      
      <div style={styles.section}>
        <h3>Token JWT</h3>
        {authState.token ? (
          <div>
            <p><strong>Token:</strong></p>
            <div style={styles.infoText}>{authState.token}</div>
            
            {tokenDetails && (
              <>
                <p><strong>Payload Decodificado:</strong></p>
                <div style={styles.infoText}>
                  {tokenDetails.error 
                    ? `Error: ${tokenDetails.error}` 
                    : JSON.stringify(tokenDetails.payload, null, 2)}
                </div>
                
                {tokenDetails.expiryDate && (
                  <p>
                    <strong>Expira:</strong> {tokenDetails.expiryDate.toLocaleString()} 
                    ({tokenDetails.isExpired ? 'Expirado' : 'Válido'})
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <p>No hay token JWT almacenado.</p>
        )}
      </div>
      
      <div style={styles.section}>
        <h3>Información de Usuario</h3>
        {authState.user ? (
          <div style={styles.infoText}>
            {JSON.stringify(JSON.parse(authState.user), null, 2)}
          </div>
        ) : (
          <p>No hay información de usuario almacenada.</p>
        )}
      </div>
      
      <div style={styles.section}>
        <h3>Guía de Uso</h3>
        <p>
          <strong>Para probar autenticación:</strong>
        </p>
        <ol>
          <li>Presiona "Borrar Autenticación" para eliminar cualquier información guardada</li>
          <li>Intenta navegar a una ruta protegida como <code>/admin/dashboard</code></li>
          <li>Deberías ser redirigido automáticamente a la página de login</li>
          <li>Para simular un login exitoso, presiona "Simular Login"</li>
          <li>Ahora deberías poder acceder a las rutas protegidas</li>
        </ol>
      </div>
    </div>
  );
}

export default AuthDebugger;
