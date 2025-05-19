import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../api';

/**
 * Componente que verifica la autenticación en todas las rutas admin
 * y redirige a login si es necesario.
 */
const AdminAuthRedirector = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar solo rutas /admin/
    if (location.pathname.startsWith('/admin')) {
      console.log('AdminAuthRedirector: Verificando autenticación para', location.pathname);
      
      const isAuthenticated = auth.isAuthenticated();
      console.log('AdminAuthRedirector: ¿Autenticado?', isAuthenticated);
      
      if (!isAuthenticated) {
        console.log('AdminAuthRedirector: No autenticado, redirigiendo a login');
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { 
          replace: true 
        });
      }
    }
  }, [location, navigate]);
  
  // Este componente no renderiza nada
  return null;
};

export default AdminAuthRedirector;
