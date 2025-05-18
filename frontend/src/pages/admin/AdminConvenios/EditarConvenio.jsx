import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal/Modal';
import InputField from '../../../components/Inputs/InputField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import Button from '../../../components/Button/Button';
import api from '../../../api';
import './EditarConvenio.css';

/**
 * EditarConvenio component for editing an existing company with healthcare agreement
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls if the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.convenio - The convenio object to edit
 * @param {Function} props.onConvenioUpdated - Callback when convenio is updated
 * @param {Function} props.onConfirmArchive - Function to archive convenio
 */
const EditarConvenio = ({ 
  isOpen, 
  onClose, 
  convenio, 
  onConvenioUpdated,
  onConfirmArchive 
}) => {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    rif: '',
    telefono: '',
    email: '',
    direccion: '',
    descripcion: '',
    logo_url: null
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [originalLogo, setOriginalLogo] = useState(null);
  const [logoChanged, setLogoChanged] = useState(false);

  // Load convenio data when the modal opens or convenio changes
  useEffect(() => {
    if (convenio && isOpen) {
      setFormData({
        nombre_empresa: convenio.nombre_empresa || '',
        rif: convenio.rif || '',
        telefono: convenio.telefono || '',
        email: convenio.email || '',
        direccion: convenio.direccion || '',
        descripcion: convenio.descripcion || '',
        logo_url: null // We don't load the file object, just the URL for preview
      });
      
      // Set original logo URL for preview
      if (convenio.logo_url) {
        setOriginalLogo(convenio.logo_url);
        setLogoPreview(convenio.logo_url);
      } else {
        setOriginalLogo(null);
        setLogoPreview(null);
      }
      
      setLogoChanged(false);
      setFormErrors({});
      setError(null);
    }
  }, [convenio, isOpen]);

  // Handle input changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Format RIF to J-XXXXXXXX-X
  const formatRIF = (value) => {
    // Remove any non-numeric characters
    let numbers = value.replace(/\D/g, '');
    
    // Limit to 9 digits
    numbers = numbers.substring(0, 9);
    
    // Format as J-XXXXXXXX-X if we have all 9 digits
    if (numbers.length === 9) {
      return `J-${numbers.substring(0, 8)}-${numbers.substring(8)}`;
    }
    
    // If we don't have all 9 digits, just return what we have with the prefix J-
    return numbers.length > 0 ? `J-${numbers}` : '';
  };

  // Handle RIF input specifically
  const handleRIFChange = (value) => {
    const formattedRIF = formatRIF(value);
    setFormData(prev => ({ ...prev, rif: formattedRIF }));
    if (formErrors.rif) {
      setFormErrors(prev => ({ ...prev, rif: null }));
    }
  };

  // Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setFormErrors(prev => ({ 
        ...prev, 
        logo_url: 'El logo no debe exceder 2MB' 
      }));
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setFormErrors(prev => ({ 
        ...prev, 
        logo_url: 'Formato de imagen no válido. Use JPEG, PNG o GIF' 
      }));
      return;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
    reader.readAsDataURL(file);

    // Store file for upload
    setFormData(prev => ({ ...prev, logo_url: file }));
    setFormErrors(prev => ({ ...prev, logo_url: null }));
    setLogoChanged(true);
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre_empresa || formData.nombre_empresa.trim() === '') {
      errors.nombre_empresa = 'El nombre de la empresa es requerido';
    }
    
    if (!formData.rif || formData.rif.trim() === '') {
      errors.rif = 'El RIF es requerido';
    } else if (!/^J-\d{8}-\d$/.test(formData.rif)) {
      errors.rif = 'El RIF debe tener el formato J-XXXXXXXX-X';
    }
    
    if (!formData.telefono || formData.telefono.trim() === '') {
      errors.telefono = 'El teléfono es requerido';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle archive convenio
  const handleArchive = async () => {
    if (!convenio) return;
    
    try {
      await onConfirmArchive(convenio);
      onClose();
    } catch (err) {
      console.error('Error archiving convenio:', err);
      setError('Error al archivar el convenio');
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !convenio) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const convenioId = convenio.id_convenio || convenio.convenio_id;
      
      if (!convenioId) {
        throw new Error('ID de convenio no válido');
      }
      
      const formDataToSend = new FormData();
      
      // Add all text fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'logo_url' && value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      
      // Add logo file if changed
      if (logoChanged && formData.logo_url) {
        formDataToSend.append('logo', formData.logo_url);
      }
      
      // Send the request
      await api.put(`/convenios/${convenioId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Call the callback to refresh the list
      if (typeof onConvenioUpdated === 'function') {
        await onConvenioUpdated();
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error updating convenio:', err);
      setError(`Error al actualizar convenio: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar empresa con convenio"
      size="medium"
    >
      <div className="editar-convenio">
        {error && (
          <div className="editar-convenio__error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="editar-convenio__form">
          <div className="editar-convenio__form-section">
            <InputField
              label="Nombre de la empresa *"
              name="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={(e) => handleChange('nombre_empresa', e.target.value)}
              error={formErrors.nombre_empresa}
              required
            />
            
            <InputField
              label="RIF *"
              name="rif"
              value={formData.rif}
              onChange={(e) => handleRIFChange(e.target.value)}
              error={formErrors.rif}
              placeholder="J-XXXXXXXX-X"
              required
            />
            
            <InputField
              label="Teléfono *"
              name="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              error={formErrors.telefono}
              required
            />
            
            <InputField
              label="Email"
              name="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={formErrors.email}
            />
          </div>
          
          <div className="editar-convenio__form-section">
            <InputField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              error={formErrors.direccion}
            />
            
            <TextAreaField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              error={formErrors.descripcion}
              rows={3}
            />
            
            <div className="editar-convenio__logo-upload">
              <label className="editar-convenio__logo-label">
                Logo de la empresa (opcional)
              </label>
              
              {logoPreview && (
                <div className="editar-convenio__logo-preview">
                  <img src={logoPreview} alt="Logo preview" />
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/gif"
                onChange={handleLogoChange}
                className="editar-convenio__file-input"
              />
              {formErrors.logo_url && (
                <div className="editar-convenio__input-error">{formErrors.logo_url}</div>
              )}
            </div>
          </div>
          
          <div className="editar-convenio__form-actions">
            <Button
              type="button"
              variant="neutral"
              scheme="negative"
              onClick={handleArchive}
              disabled={isSubmitting}
            >
              Archivar
            </Button>
            <div className="editar-convenio__right-actions">
              <Button
                type="button"
                variant="neutral"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditarConvenio;
