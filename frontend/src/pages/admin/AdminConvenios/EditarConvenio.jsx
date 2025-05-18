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
 * @param {Object} props.convenio - The empresa object to edit
 * @param {Function} props.onEmpresaUpdated - Callback when empresa is updated
 * @param {Function} props.onConfirmArchive - Function to archive empresa
 */
const EditarConvenio = ({ 
  isOpen, 
  onClose, 
  convenio, 
  onEmpresaUpdated,
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
      
      // Set logo URL for preview
      if (convenio.logo_url) {
        setLogoPreview(convenio.logo_url);
      } else {
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

  // Format RIF to X-XXXXXXXX-X and calculate verification digit
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
    
    if (!formData.telefono || formData.telefono.trim() === '') {
      errors.telefono = 'El teléfono es requerido';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle archive empresa
  const handleArchive = async () => {
    if (!convenio) return;
    
    try {
      await onConfirmArchive(convenio);
      onClose();
    } catch (err) {
      console.error('Error archiving empresa:', err);
      setError('Error al archivar la empresa');
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
      const convenioId = convenio.id_empresa;
      
      if (!convenioId) {
        throw new Error('ID de empresa no válido');
      }
      
      const formDataToSend = new FormData();
      
      // Add the ID to FormData
      formDataToSend.append('id_empresa', convenioId);
      
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
      await api.put(`/empresas`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Call the callback to refresh the list
      if (typeof onEmpresaUpdated === 'function') {
        await onEmpresaUpdated();
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error('Error updating empresa:', err);
      setError(`Error al actualizar empresa: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
    >
      <div className="editar-convenio">
        <h2 className="editar-convenio__title">Editar empresa</h2>
        
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
              onChange={(value) => handleChange('nombre_empresa', value)}
              error={formErrors.nombre_empresa}
              required
              fillContainer={true}
            />
            
            <InputField
              label="RIF *"
              name="rif"
              value={formData.rif}
              onChange={(value) => handleRIFChange(value)}
              error={formErrors.rif}
              placeholder="J-XXXXXXXX-X"
              required
              fillContainer={true}
            />
            
            <InputField
              label="Teléfono *"
              name="telefono"
              value={formData.telefono}
              onChange={(value) => handleChange('telefono', value)}
              error={formErrors.telefono}
              required
              fillContainer={true}
            />
            
            <InputField
              label="Email"
              name="email"
              value={formData.email}
              onChange={(value) => handleChange('email', value)}
              error={formErrors.email}
              fillContainer={true}
            />
          </div>
          
          <div className="editar-convenio__form-section">
            <InputField
              label="Dirección"
              name="direccion"
              value={formData.direccion}
              onChange={(value) => handleChange('direccion', value)}
              error={formErrors.direccion}
              fillContainer={true}
            />
            
            <TextAreaField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={(value) => handleChange('descripcion', value)}
              error={formErrors.descripcion}
              rows={3}
              fillContainer={true}
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
