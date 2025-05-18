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
    logo_url: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState(null);

  // Format RIF to J-XXXXXXXX-X and calculate verification digit
  const formatRIF = (value) => {
    // Remove any non-alphanumeric characters and convert to uppercase
    const rifLimpio = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Ensure we have a valid RIF format
    if (rifLimpio.length === 0) return '';
    
    // Set default letter to J if not provided
    let rifBase = rifLimpio;
    if (!/^[VJEGP]/.test(rifLimpio)) {
      rifBase = 'J' + rifLimpio;
    }
    
    // Limit to first 9 characters (including letter)
    rifBase = rifBase.substring(0, 9);
    
    // Calculate verification digit if we have a complete base
    if (rifBase.length === 9) {
      const digitoVerificador = calcularDigitoVerificador(rifBase);
      return `${rifBase.charAt(0)}-${rifBase.substring(1)}-${digitoVerificador}`;
    }
    
    return rifBase;
  };
  
  // Calculate verification digit for RIF
  const calcularDigitoVerificador = (rifInput) => {
    // Clean the RIF input
    const rifLimpio = rifInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Verify RIF has correct format
    if (!/^[VJEGP][0-9]{8}$/.test(rifLimpio)) return "";

    const letras = { V: 1, E: 2, J: 3, P: 4, G: 5 };
    const letra = rifLimpio.charAt(0);
    const numeros = rifLimpio.substr(1).split('').map(Number);

    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = letras[letra] * 4;

    for (let i = 0; i < 8; i++) {
      suma += numeros[i] * coeficientes[i];
    }

    const resto = suma % 11;
    const digito = resto > 1 ? 11 - resto : 0;

    return digito.toString();
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
    } else {
      // Get clean RIF without formatting
      const rifLimpio = formData.rif.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      // Validate RIF format and verification digit
      if (rifLimpio.length !== 10) {
        errors.rif = 'El RIF debe tener el formato X-XXXXXXXX-X';
      } else {
        const letter = rifLimpio.charAt(0);
        const base = rifLimpio.substring(0, 9);
        const verificador = rifLimpio.charAt(9);
        
        // Verify the format and first character is valid
        if (!/^[VJEGP]/.test(letter)) {
          errors.rif = 'El RIF debe comenzar con J, V, E, P o G';
        } else if (verificador !== calcularDigitoVerificador(base)) {
          errors.rif = 'El dígito verificador del RIF es inválido';
        }
      }
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
      size="small"
    >
      <div className="crear-convenio">
        <h2 className="crear-convenio__title">Agregar empresa</h2>
        
        {error && (
          <div className="crear-convenio__error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="crear-convenio__form">
          <div className="crear-convenio__form-section">
            <InputField
              label="Nombre de la empresa"
              name="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={(value) => handleChange('nombre_empresa', value)}
              error={formErrors.nombre_empresa}
              required
              placeholder="Nombre de la empresa"
              fillContainer={true}
            />
            
            <InputField
              label="RIF"
              name="rif"
              value={formData.rif}
              onChange={(value) => handleRIFChange(value)}
              error={formErrors.rif}
              required
              placeholder="J-12345678-9"
              fillContainer={true}
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
