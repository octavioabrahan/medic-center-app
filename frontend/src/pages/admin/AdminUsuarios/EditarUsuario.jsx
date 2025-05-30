import React, { useState, useEffect } from 'react';
import api from '../../../api';
import './EditarUsuario.css';

const EditarUsuario = ({ usuario, roles, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedRole: null
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (usuario) {
      setFormData({
        name: usuario.name || '',
        last_name: usuario.last_name || '',
        email: usuario.email || '',
        password: '',
        confirmPassword: '',
        selectedRole: usuario.roles && usuario.roles.length > 0 ? usuario.roles[0].id_rol : null
      });
    }
  }, [usuario]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
        newErrors.password = 'La contraseña debe tener al menos una mayúscula, una minúscula, un número y un carácter especial';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    if (formData.selectedRole === null) {
      newErrors.roles = 'Debe seleccionar un rol';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const updateData = {
        name: formData.name,
        last_name: formData.last_name,
        email: formData.email,
        roles: [formData.selectedRole]
      };

      if (changePassword) {
        updateData.password = formData.password;
      }

      const response = await api.put(`/auth/${usuario.id}`, updateData);

      onUpdate(response.data.usuario);
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (roleId) => {
    setFormData(prev => ({
      ...prev,
      selectedRole: roleId
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="editar-usuario-overlay">
      <div className="editar-usuario-modal">
        <div className="modal-header">
          <h2>Editar Usuario</h2>
          <button 
            type="button" 
            className="close-btn"
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editar-usuario-form">
          <div className="form-group">
            <label htmlFor="name">Nombre *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Apellido *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={errors.last_name ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.last_name && <span className="error-message">{errors.last_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.target.checked)}
                disabled={isLoading}
              />
              Cambiar contraseña
            </label>
          </div>

          {changePassword && (
            <>
              <div className="form-group">
                <label htmlFor="password">Nueva Contraseña *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
                <small className="password-hint">
                  Mínimo 8 caracteres, incluir mayúscula, minúscula y número
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </>
          )}

          <div className="form-group">
            <label>Rol *</label>
            <div className="roles-container">
              {roles.map(role => (
                <label key={role.id_rol} className="radio-label">
                  <input
                    type="radio"
                    name="selectedRole"
                    value={role.id_rol}
                    checked={formData.selectedRole === role.id_rol}
                    onChange={() => handleRoleChange(role.id_rol)}
                    disabled={isLoading}
                  />
                  {role.nombre_rol}
                </label>
              ))}
            </div>
            {errors.roles && <span className="error-message">{errors.roles}</span>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarUsuario;
