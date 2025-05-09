import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Input, Button, Select, Alert } from '../../../../components/ui';
import styles from './RegisterForm.module.css';

/**
 * Formulario de registro de usuarios
 */
const RegisterForm = ({ onSubmit, loading = false, error = null }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    documentType: '',
    documentNumber: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const documentTypeOptions = [
    { value: 'dni', label: 'DNI' },
    { value: 'passport', label: 'Pasaporte' },
    { value: 'other', label: 'Otro' },
  ];

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
    
    // Validación de nombre
    if (!formData.firstName.trim()) {
      errors.firstName = 'El nombre es requerido';
    }
    
    // Validación de apellido
    if (!formData.lastName.trim()) {
      errors.lastName = 'El apellido es requerido';
    }
    
    // Validación de email
    if (!formData.email) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El formato del correo electrónico no es válido';
    }
    
    // Validación de contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    // Validación de confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Debe confirmar la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    // Validación de tipo de documento
    if (!formData.documentType) {
      errors.documentType = 'El tipo de documento es requerido';
    }
    
    // Validación de número de documento
    if (!formData.documentNumber) {
      errors.documentNumber = 'El número de documento es requerido';
    }
    
    // Validación de teléfono (opcional)
    if (formData.phone && !/^\+?[0-9]{8,15}$/.test(formData.phone)) {
      errors.phone = 'El formato del teléfono no es válido';
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
    <div className={styles.registerForm}>
      {error && (
        <Alert 
          type="error" 
          message={error} 
          className={styles.formAlert}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <Input
              type="text"
              name="firstName"
              label="Nombre"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Ingrese su nombre"
              error={formErrors.firstName}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <Input
              type="text"
              name="lastName"
              label="Apellido"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Ingrese su apellido"
              error={formErrors.lastName}
              required
            />
          </div>
        </div>
        
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
        
        <div className={styles.formGrid}>
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
          
          <div className={styles.formGroup}>
            <Input
              type="password"
              name="confirmPassword"
              label="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme su contraseña"
              error={formErrors.confirmPassword}
              required
            />
          </div>
        </div>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <Select
              name="documentType"
              label="Tipo de documento"
              value={formData.documentType}
              onChange={handleChange}
              options={documentTypeOptions}
              placeholder="Seleccione tipo"
              error={formErrors.documentType}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <Input
              type="text"
              name="documentNumber"
              label="Número de documento"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="Ingrese número"
              error={formErrors.documentNumber}
              required
            />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <Input
            type="tel"
            name="phone"
            label="Teléfono (opcional)"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Ej: +56912345678"
            error={formErrors.phone}
          />
        </div>
        
        <div className={styles.termsConditions}>
          Al registrarte, aceptas nuestros{' '}
          <Link to="/terminos" className={styles.termsLink}>
            Términos y Condiciones
          </Link>{' '}
          y{' '}
          <Link to="/privacidad" className={styles.termsLink}>
            Política de Privacidad
          </Link>
          .
        </div>
        
        <div className={styles.formActions}>
          <Button 
            type="submit" 
            fullWidth 
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </Button>
        </div>
        
        <div className={styles.loginLink}>
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className={styles.loginLinkText}>
            Inicia sesión aquí
          </Link>
        </div>
      </form>
    </div>
  );
};

RegisterForm.propTypes = {
  /** Función a ejecutar al enviar el formulario */
  onSubmit: PropTypes.func.isRequired,
  /** Estado de carga */
  loading: PropTypes.bool,
  /** Mensaje de error */
  error: PropTypes.string,
};

export default RegisterForm;