import React, { useState, useEffect } from 'react';
import InputField from '../../../components/Inputs/InputField';
import Button from '../../../components/Button/Button';
import styles from './EditarEmpresaConvenio.module.css';

const EditarEmpresaConvenio = ({ isOpen, onClose, onSave, onArchive, empresa }) => {
  const [nombre, setNombre] = useState(empresa?.nombre || '');
  const [rifBase, setRifBase] = useState('');
  const [digitoVerificador, setDigitoVerificador] = useState('');
  const [rif, setRif] = useState('');

  // Función para calcular el dígito verificador del RIF
  const calcularDigitoVerificador = (rifInput) => {
    // Limpiar el RIF
    const rifLimpio = rifInput.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Verificar que el RIF tenga el formato correcto
    if (!/^[VJEGP][0-9]{8}$/.test(rifLimpio)) {
      return '';
    }

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

  // Validar el formato completo del RIF
  const validarRIF = (rif) => {
    rif = rif.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!/^[VJEGP][0-9]{8}[0-9]$/.test(rif)) {
      return false;
    }

    const letras = { V: 1, E: 2, J: 3, P: 4, G: 5 };
    const letra = rif.charAt(0);
    const numeros = rif.substr(1, 8).split('').map(Number);
    const verificador = parseInt(rif.charAt(9), 10);

    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = letras[letra] * 4;

    for (let i = 0; i < 8; i++) {
      suma += numeros[i] * coeficientes[i];
    }

    const resto = suma % 11;
    const digito = resto > 1 ? 11 - resto : 0;

    return digito === verificador;
  };

  // Manejar cambios en el campo RIF y calcular dígito verificador
  const handleRifChange = (value) => {
    const valorLimpio = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (valorLimpio.length <= 9) {
      setRifBase(valorLimpio);
      
      if (valorLimpio.length === 9) {
        const dv = calcularDigitoVerificador(valorLimpio);
        setDigitoVerificador(dv);
        setRif(valorLimpio + dv);
      } else {
        setDigitoVerificador('');
        setRif(valorLimpio);
      }
    } else {
      const base = valorLimpio.substring(0, 9);
      const dv = calcularDigitoVerificador(base);
      setRifBase(base);
      setDigitoVerificador(dv);
      setRif(base + dv);
    }
  };

  useEffect(() => {
    setNombre(empresa?.nombre || '');
    
    if (empresa?.rif) {
      const rifLimpio = empresa.rif.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (rifLimpio.length >= 9) {
        setRifBase(rifLimpio.substring(0, 9));
        setDigitoVerificador(rifLimpio.length > 9 ? rifLimpio.charAt(9) : calcularDigitoVerificador(rifLimpio.substring(0, 9)));
        setRif(rifLimpio);
      } else {
        setRifBase(rifLimpio);
        setDigitoVerificador('');
        setRif(rifLimpio);
      }
    } else {
      setRifBase('');
      setDigitoVerificador('');
      setRif('');
    }
  }, [empresa, isOpen]);

  const handleSave = () => {
    if (nombre.trim() && rif.trim()) {
      onSave?.({ nombre, rif });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.dialogBody} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Editar empresa</h2>
        
        <div className={styles.textSection}>
          <div className={styles.fieldsSection}>
            <InputField
              label="Nombre de la empresa"
              value={nombre}
              onChange={setNombre}
              placeholder="Nombre de la empresa"
              fillContainer
            />
            <div className={styles.inputFieldContainer}>
              <label className={styles.label}>RIF</label>
              <div className={styles.rifInputGroup}>
                <input
                  type="text"
                  value={rifBase}
                  onChange={(e) => handleRifChange(e.target.value)}
                  className={styles.rifBase}
                  placeholder="J12345678"
                  maxLength={9}
                />
                <span className={styles.rifSeparator}>-</span>
                <input
                  type="text"
                  value={digitoVerificador}
                  className={styles.rifVerificador}
                  placeholder="DV"
                  disabled
                />
              </div>
              <small className={styles.formText}>
                Formato: J12345678 (El dígito verificador se calcula automáticamente)
              </small>
            </div>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <Button
            variant="subtle"
            size="medium"
            onClick={onArchive}
            className={styles.archivarButton}
          >
            <span className={styles.archiveIconWrapper}>
              <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5998 2.8999C1.15798 2.8999 0.799805 3.25807 0.799805 3.6999V4.4999C0.799805 4.94173 1.15798 5.2999 1.5998 5.2999H14.3998C14.8416 5.2999 15.1998 4.94173 15.1998 4.4999V3.6999C15.1998 3.25807 14.8416 2.8999 14.3998 2.8999H1.5998Z" fill="#900B09"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M1.5998 6.4999H14.3998L13.7506 12.6674C13.6649 13.4817 12.9782 14.0999 12.1594 14.0999H3.84022C3.02141 14.0999 2.33473 13.4817 2.24901 12.6674L1.5998 6.4999ZM5.5998 9.2999C5.5998 8.85807 5.95798 8.4999 6.3998 8.4999H9.5998C10.0416 8.4999 10.3998 8.85807 10.3998 9.2999C10.3998 9.74173 10.0416 10.0999 9.5998 10.0999H6.3998C5.95798 10.0999 5.5998 9.74173 5.5998 9.2999Z" fill="#900B09"/>
              </svg>
            </span>
            <span className={styles.archivarButtonText}>Archivar</span>
          </Button>
          
          <div className={styles.frame77}>
            <Button variant="neutral" size="medium" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleSave}
              disabled={!nombre.trim() || !rif.trim()}
            >
              Guardar
            </Button>
          </div>
        </div>
        
        <button className={styles.closeButton} onClick={onClose} aria-label="Close">
          <svg className={styles.closeIcon} width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5.5L5 15.5M5 5.5L15 15.5" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EditarEmpresaConvenio;
