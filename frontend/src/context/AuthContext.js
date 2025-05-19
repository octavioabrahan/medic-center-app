import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../api';

// Crear el contexto de autenticación
const AuthContext = createContext(null);

// Proveedor de autenticación que verificará el estado de autenticación
export const AuthProvider = ({ children }) => {
  // No podemos usar useNavigate o useLocation aquí directamente porque están disponibles
  // solo dentro de un componente dentro del Router
  return (
    <AuthContext.Provider value={{}}>
      <AuthGuard>{children}</AuthGuard>
    </AuthContext.Provider>
  );
};

// Componente de guardia para verificar autenticación en rutas admin
const AuthGuard = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar autenticación cada vez que cambia la ruta
  useEffect(() => {
    const checkAuth = () => {
      // Solo verificar para rutas admin
      if (location.pathname.startsWith('/admin')) {
        const isAuth = auth.isAuthenticated();
        console.log(`AuthGuard: verificando autenticación para ruta ${location.pathname}`, isAuth);
        
        if (!isAuth) {
          console.log('AuthGuard: no autenticado, redirigiendo a login');
          navigate('/login', { state: { from: location }, replace: true });
        }
      }
    };
    
    checkAuth();
  }, [location, navigate]);
  
  return <>{children}</>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
