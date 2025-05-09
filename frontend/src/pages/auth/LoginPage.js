import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layouts';
import LoginForm from '../../features/auth/components/LoginForm';

/**
 * Página de inicio de sesión
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      // Aquí iría la llamada al servicio de autenticación
      // Ejemplo: await authService.login(credentials);
      console.log('Iniciando sesión con:', credentials);
      
      // Simulación de login exitoso
      setTimeout(() => {
        // Redirigir al dashboard después del login
        navigate('/admin/dashboard');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Credenciales inválidas. Por favor intente de nuevo.');
      setLoading(false);
      console.error('Error en login:', err);
    }
  };

  return (
    <AuthLayout 
      title="Iniciar Sesión" 
      subtitle="Ingresa tus credenciales para acceder al sistema"
    >
      <LoginForm 
        onSubmit={handleLogin} 
        loading={loading} 
        error={error} 
      />
    </AuthLayout>
  );
};

export default LoginPage;