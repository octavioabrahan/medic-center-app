import React, { useState } from 'react';
import InputField from '../../../components/Inputs/InputField';
import Button from '../../../components/Button/Button';
import styles from './AgregarEmpresaConvenio.module.css';

/**
 * Modal for adding a new convenio company.
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onAdd: function({ nombre, rif })
 */
const AgregarEmpresaConvenio = ({ isOpen, onClose, onAdd }) => {
  const [nombre, setNombre] = useState('');
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

  const handleAdd = () => {
    if (nombre.trim() && rif.trim()) {
      onAdd?.({ nombre, rif });
      setNombre('');
      setRifBase('');
      setDigitoVerificador('');
      setRif('');
    }
  };

  const handleClose = () => {
    setNombre('');
    setRifBase('');
    setDigitoVerificador('');
    setRif('');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose} role="dialog" aria-modal="true">
      <div className={styles.dialogBody} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalTitle}>Agregar empresa</h2>
        
        <div className={styles.textSection}>
          <div className={styles.fieldsSection}>
            <InputField
              label="Nombre de la empresa"
              value={nombre}
              onChange={setNombre}
              placeholder="Nombre de la empresa"
              fillContainer
              autoFocus
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
          <div className={styles.frame77}>
            <Button variant="neutral" size="medium" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={handleAdd}
              disabled={!nombre.trim() || !rif.trim()}
            >
              Agregar
            </Button>
          </div>
        </div>
        
        <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
          <svg className={styles.closeIcon} width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5.5L5 15.5M5 5.5L15 15.5" stroke="#1E1E1E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AgregarEmpresaConvenio;
