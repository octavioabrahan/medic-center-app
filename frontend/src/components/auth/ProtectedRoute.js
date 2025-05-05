import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../api';

function ProtectedRoute({ children, requiredRoles = [] }) {
  const location = useLocation();
  const currentUser = auth.getCurrentUser();
  const isAuthenticated = auth.isAuthenticated();
  
  // Verificar si el usuario está autenticado
  if (!isAuthenticated) {
    // Redirigir al login, guardando la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Si se especifican roles requeridos, verificar que el usuario tenga al menos uno
  if (requiredRoles.length > 0) {
    const userRoles = currentUser?.roles || [];
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