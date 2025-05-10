import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../api';
import axios from 'axios';

function ProtectedRoute({ children, requiredRoles = [] }) {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Verificando autenticación...");
        // Verificar si hay un token en localStorage
        const token = localStorage.getItem("authToken");
        console.log("Token encontrado:", !!token);
        
        if (token) {
          // Configurar axios con el token para todas las peticiones futuras
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Intentar obtener datos del usuario actual para validar el token
          try {
            console.log("Intentando validar el token con una petición al servidor...");
            // Esta petición debería fallar con 401 si el token no es válido
            await axios.get('/api/auth/perfil');
            console.log("Token validado correctamente");
            
            const currentUser = auth.getCurrentUser();
            console.log("Usuario actual:", currentUser);
            
            setIsAuth(true);
            setUser(currentUser);
          } catch (validationError) {
            console.error("Error validando token:", validationError);
            // Si hay un error, el token no es válido
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            setIsAuth(false);
          }
        } else {
          console.log("No hay token en localStorage");
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuth(false);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);
  
  // Mostrar un estado de carga mientras verificamos la autenticación
  if (!authChecked) {
    return <div className="loading-auth">Verificando autenticación...</div>;
  }
  
  // Verificar si el usuario está autenticado
  if (!isAuth) {
    console.log("Usuario no autenticado, redirigiendo a /login");
    // Redirigir al login, guardando la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si se especifican roles requeridos, verificar que el usuario tenga al menos uno
  if (requiredRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role));
    
    // Si el usuario es superadmin, siempre permitir acceso
    const isSuperAdmin = userRoles.includes('superadmin');
    
    if (!hasRequiredRole && !isSuperAdmin) {
      console.log("Usuario no tiene roles requeridos:", { userRoles, requiredRoles });
      // Redirigir a página de acceso denegado
      return <Navigate to="/forbidden" replace />;
    }
  }
  
  console.log("Autenticación exitosa, mostrando contenido protegido");
  // Si pasa todas las verificaciones, mostrar el contenido protegido
  return children;
}

export default ProtectedRoute;