import React, { useState } from 'react';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../../api';
import './CrearUsuario.css';

/**
 * CrearUsuario modal component for adding new users
 */
const CrearUsuario = ({ isOpen, onClose, roles, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: []
      });
      setError('');
      setValidationErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleRoleChange = (roleId, checked) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(id => id !== roleId)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no tiene un formato válido';
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      errors.password = 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.roles.length === 0) {
      errors.roles = 'Debe asignar al menos un rol';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        name: formData.name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        roles: formData.roles
      };

      console.log('Enviando datos de usuario:', userData);
      const response = await api.post('/auth', userData);
      console.log('Usuario creado:', response.data);
      
      onUserCreated(response.data.usuario);
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setError(err.response?.data?.error || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="crear-usuario__modal-overlay">
      <div className="crear-usuario__modal-content">
        <div className="crear-usuario__modal-header">
          <h2>Agregar nuevo usuario</h2>
          <button
            className="crear-usuario__close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            <XMarkIcon />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="crear-usuario__modal-body">
          {error && (
            <div className="crear-usuario__error-message">
              {error}
            </div>
          )}
          
          <div className="crear-usuario__form-row">
            <div className="crear-usuario__form-group">
              <InputField
                label="Nombre *"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                error={validationErrors.name}
                disabled={loading}
                placeholder="Ingrese el nombre"
              />
              {validationErrors.name && <span className="crear-usuario__error-text">{validationErrors.name}</span>}
            </div>
            
            <div className="crear-usuario__form-group">
              <InputField
                label="Apellido *"
                value={formData.last_name}
                onChange={(value) => handleInputChange('last_name', value)}
                error={validationErrors.last_name}
                disabled={loading}
                placeholder="Ingrese el apellido"
              />
              {validationErrors.last_name && <span className="crear-usuario__error-text">{validationErrors.last_name}</span>}
            </div>
          </div>
          
          <div className="crear-usuario__form-group">
            <InputField
              label="Email *"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              error={validationErrors.email}
              disabled={loading}
              placeholder="usuario@ejemplo.com"
            />
            {validationErrors.email && <span className="crear-usuario__error-text">{validationErrors.email}</span>}
          </div>
          
          <div className="crear-usuario__form-row">
            <div className="crear-usuario__form-group">
              <label>Contraseña *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`crear-usuario__input ${validationErrors.password ? 'error' : ''}`}
                disabled={loading}
                placeholder="••••••••"
              />
              {validationErrors.password && <span className="crear-usuario__error-text">{validationErrors.password}</span>}
              <small className="crear-usuario__help-text">Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial</small>
            </div>
            
            <div className="crear-usuario__form-group">
              <label>Confirmar contraseña *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`crear-usuario__input ${validationErrors.confirmPassword ? 'error' : ''}`}
                disabled={loading}
                placeholder="••••••••"
              />
              {validationErrors.confirmPassword && <span className="crear-usuario__error-text">{validationErrors.confirmPassword}</span>}
            </div>
          </div>
          
          <div className="crear-usuario__form-group">
            <label className="crear-usuario__roles-label">
              Roles * {validationErrors.roles && <span className="crear-usuario__error-text">({validationErrors.roles})</span>}
            </label>
            <div className="crear-usuario__roles-container">
              {roles.map(role => (
                <div key={role.id_rol} className="crear-usuario__role-item">
                  <CheckboxField
                    label={`${role.nombre_rol}${role.descripcion ? ` - ${role.descripcion}` : ''}`}
                    checked={formData.roles.includes(role.id_rol)}
                    onChange={(checked) => handleRoleChange(role.id_rol, checked)}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
        
        <div className="crear-usuario__modal-footer">
          <Button
            variant="neutral"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear usuario'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrearUsuario;
