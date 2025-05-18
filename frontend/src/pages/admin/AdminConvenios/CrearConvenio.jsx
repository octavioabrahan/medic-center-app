import React, { useState } from 'react';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import InputField from '../../../components/Inputs/InputField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import api from '../../../api';
import './CrearConvenio.css';

/**
 * Modal para crear una nueva empresa con convenio
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Determina si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onEmpresaCreated - Función que se ejecuta al crear exitosamente
 */
const CrearConvenio = ({ isOpen, onClose, onEmpresaCreated }) => {
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

  // Handle input changes
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
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
    // Check if e is an event or already a file
    const file = e.target ? e.target.files[0] : e;
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
  };

  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre_empresa || formData.nombre_empresa.trim() === '') {
      errors.nombre_empresa = 'El nombre de la empresa es requerido';
    }
    
    if (!formData.rif || formData.rif.trim() === '') {
      errors.rif = 'El RIF es requerido';
    } else if (!/^J?-?\d{8}-?\d$/.test(formData.rif.replace(/\D/g, ''))) {
      errors.rif = 'El RIF debe tener el formato XXXXXXXX-X';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      
      // Add all text fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'logo_url' && value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      
      // Add logo file if present
      if (formData.logo_url) {
        formDataToSend.append('logo', formData.logo_url);
      }
      
      // Send the request
      const response = await api.post('/empresas', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Empresa con convenio creada:', response.data);
      
      // Get updated list of companies
      const empresasRes = await api.get('/empresas');
      
      // Call the callback with updated list
      if (typeof onEmpresaCreated === 'function') {
        onEmpresaCreated(empresasRes.data);
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error creating empresa:', err);
      setError(`Error al crear empresa: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    // Reset form state
    setFormData({
      nombre_empresa: '',
      rif: '',
      telefono: '',
      email: '',
      direccion: '',
      descripcion: '',
      logo_url: null
    });
    setFormErrors({});
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      title="Agregar empresa"
      size="small"
    >
      <div className="crear-convenio">
        {error && (
          <div className="crear-convenio__error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="crear-convenio__form">
          <div className="crear-convenio__form-section">
            <div className="crear-convenio__description">
              Descripción
            </div>
            
            <InputField
              label="Nombre de la empresa"
              name="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={(value) => handleChange('nombre_empresa', value)}
              error={formErrors.nombre_empresa}
              required
              placeholder="(recomendado)"
            />
            
            <InputField
              label="RIF"
              name="rif"
              value={formData.rif}
              onChange={(value) => handleRIFChange(value)}
              error={formErrors.rif}
              required
            />
          </div>
          
          <div className="crear-convenio__form-actions">
            <Button
              type="button"
              variant="neutral"
              onClick={handleCloseModal}
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
              Agregar
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CrearConvenio;
