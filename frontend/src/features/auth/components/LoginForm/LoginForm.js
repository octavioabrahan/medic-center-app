import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Input, Button, Alert } from '../../../../components/ui';
import styles from './LoginForm.module.css';

/**
 * Formulario de inicio de sesión
 */
const LoginForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El formato del correo electrónico no es válido';
    }
    
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className={styles.loginForm}>
      {error && (
        <Alert 
          type="error" 
          message={error} 
          className={styles.formAlert}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <Input
            type="email"
            name="email"
            label="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingrese su correo electrónico"
            error={formErrors.email}
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <Input
            type="password"
            name="password"
            label="Contraseña"
            value={formData.password}
            onChange={handleChange}
            placeholder="Ingrese su contraseña"
            error={formErrors.password}
            required
          />
        </div>
        
        <div className={styles.forgotPassword}>
          <Link to="/recuperar-contrasena" className={styles.forgotPasswordLink}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        
        <div className={styles.formActions}>
          <Button 
            type="submit" 
            fullWidth 
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </div>
        
        <div className={styles.registerLink}>
          ¿No tienes una cuenta?{' '}
          <Link to="/registro" className={styles.registerLinkText}>
            Regístrate aquí
          </Link>
        </div>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  /** Función a ejecutar al enviar el formulario */
  onSubmit: PropTypes.func.isRequired,
  /** Estado de carga */
  loading: PropTypes.bool,
  /** Mensaje de error */
  error: PropTypes.string,
};

export default LoginForm;