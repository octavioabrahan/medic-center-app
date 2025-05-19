/**
 * Utilidades para pruebas de autenticación
 * 
 * Este archivo contiene funciones útiles para probar y depurar
 * el flujo de autenticación en la aplicación
 */

/**
 * Simula un inicio de sesión para pruebas
 * @param {string} role - El rol a simular ('admin', 'doctor', etc)
 */
export const simulateLogin = (role = 'admin') => {
  // Crear un token falso que expire en 1 hora
  const now = new Date();
  const expiryTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora
  
  // Header falso (no decodificable, solo para pruebas)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  
  // Payload con la información del usuario
  const payload = btoa(JSON.stringify({
    id: 1,
    email: 'test@example.com',
    name: 'Usuario de Prueba',
    roles: [role],
    exp: Math.floor(expiryTime.getTime() / 1000)
  }));
  
  // Firma falsa (para pruebas)
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
  
  console.log('Login simulado exitosamente con rol:', role);
  console.log('Token expira en:', expiryTime.toLocaleTimeString());
  
  return {
    token,
    expiryTime
  };
};

/**
 * Borra la información de autenticación, simulando un cierre de sesión
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('Información de autenticación eliminada');
};

/**
 * Verificar estado actual de autenticación
 */
export const checkAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  console.log('Estado de autenticación:');
  console.log('- Token presente:', !!token);
  
  if (token) {
    try {
      // Intentar decodificar el payload
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('- Información del token:', payload);
        
        // Verificar expiración
        if (payload.exp) {
          const expiry = new Date(payload.exp * 1000);
          const now = new Date();
          
          console.log('- Expiración del token:', expiry.toLocaleString());
          console.log('- Token expirado:', expiry < now);
        }
      } else {
        console.log('- El token no tiene formato JWT válido');
      }
    } catch (error) {
      console.log('- Error al decodificar token:', error.message);
    }
  }
  
  console.log('- Información de usuario:', user ? JSON.parse(user) : 'No disponible');
  
  return {
    isAuthenticated: !!token,
    user: user ? JSON.parse(user) : null,
    token
  };
};

// Exportar funciones como objeto para facilitar el acceso
const authUtils = {
  simulateLogin,
  clearAuth,
  checkAuthStatus
};

export default authUtils;
