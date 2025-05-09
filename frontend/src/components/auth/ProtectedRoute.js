import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../api';

function ProtectedRoute({ children, requiredRoles = [] }) {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  
  // Verificación de autenticación con un pequeño retraso para asegurar que el token sea detectado
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Comprobamos si hay un token en localStorage
        const token = localStorage.getItem("authToken");
        if (token) {
          const currentUser = auth.getCurrentUser();
          setIsAuth(true);
          setUser(currentUser);
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuth(false);
      } finally {
        setAuthChecked(true);
      }
    };
    
    // Darle un pequeño tiempo para asegurarnos que cualquier token recién guardado sea detectado
    setTimeout(checkAuth, 100);
  }, []);
  
  // Mostrar un estado de carga mientras verificamos la autenticación
  if (!authChecked) {
    return <div>Verificando autenticación...</div>;
  }
  
  // Verificar si el usuario está autenticado
  if (!isAuth) {
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
      // Redirigir a página de acceso denegado
      return <Navigate to="/forbidden" replace />;
    }
  }
  
  // Si pasa todas las verificaciones, mostrar el contenido protegido
  return children;
}

export default ProtectedRoute;