import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/layouts';
import RegisterForm from '../../features/auth/components/RegisterForm';

/**
 * Página de registro de usuarios
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Aquí iría la llamada al servicio de registro
      // Ejemplo: await authService.register(userData);
      console.log('Registrando usuario:', userData);
      
      // Simulación de registro exitoso
      setTimeout(() => {
        // Redirigir a la página de inicio de sesión después del registro
        navigate('/login', {
          state: { 
            message: 'Registro exitoso. Por favor inicia sesión con tus credenciales.',
            type: 'success',
          }
        });
        setLoading(false);
      }, 1500);
    } catch (err) {
      setError('Error al registrar usuario. Por favor intente nuevamente.');
      setLoading(false);
      console.error('Error en registro:', err);
    }
  };

  return (
    <AuthLayout 
      title="Crear Cuenta" 
      subtitle="Ingresa tus datos para registrarte en el sistema"
    >
      <RegisterForm 
        onSubmit={handleRegister} 
        loading={loading} 
        error={error} 
      />
    </AuthLayout>
  );
};

export default RegisterPage;