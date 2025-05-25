import React, { useEffect, useRef, useCallback } from "react";
import "./SelectField.css";
import { ChevronDownIcon } from '@heroicons/react/20/solid';

/**
 * Props:
 * - label: string
 * - value?: string
 * - placeholder?: string
 * - options: Array<{ label: string, value: string }>
 * - disabled?: boolean
 * - error?: boolean
 * - fillContainer?: boolean - Si es true, el campo ocupará el 100% del ancho disponible
 * - onChange?: (value: string) => void
 * - style?: React.CSSProperties
 */
export default function SelectField({
  label,
  value = "",
  placeholder = "",
  options = [],
  disabled = false,
  error = false,
  fillContainer = false,
  onChange = () => {},
  style = {},
}) {
  const selectRef = useRef(null);

  // Callback ref para asegurar que se conecte correctamente
  const setSelectRef = useCallback((element) => {
    selectRef.current = element;
    if (element && value) {
      element.value = value;
      console.log('Estableciendo valor via callback ref:', value, 'Resultado:', element.value);
    }
  }, [value]);
  
  // Forzar actualización del select cuando cambian value u options
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectRef.current) {
        selectRef.current.value = value || "";
        console.log('Forzando valor en DOM:', value, 'Resultado:', selectRef.current.value);
      } else {
        console.log('selectRef.current es null, no se puede establecer valor');
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [value, options]);

  const isPlaceholder = !value && placeholder;
  const hasValidValue = value && options.some(opt => opt.value === value);
  const state = disabled
    ? "state-disabled"
    : error
    ? "state-error"
    : "state-default";
  const valueType = isPlaceholder ? "value-type-placeholder" : "value-type-value";
  const fillClass = fillContainer ? "fill-container" : "";

  // Debug para SelectField
  console.log('SelectField Debug:', {
    label,
    value,
    hasValue: !!value,
    hasValidValue,
    placeholder,
    isPlaceholder,
    valueType,
    optionsLength: options.length
  });

  return (
    <div className={`select-field ${state} ${valueType} ${fillClass}`} style={style}>
      <div className="label">{label}</div>
      <div className={`select select-native-wrapper ${fillContainer ? 'fill-container' : ''}`}>
        <select
          ref={setSelectRef}
          className="select-native"
          defaultValue={value}
          disabled={disabled}
          onChange={e => {
            console.log('Select onChange:', e.target.value);
            onChange(e.target.value);
          }}
          style={{
            color: '#1e1e1e !important',
            backgroundColor: '#fff !important',
            fontSize: '14px !important',
            fontWeight: hasValidValue ? '500 !important' : '400 !important'
          }}
        >
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} style={{color: '#1e1e1e !important'}}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="heroicons-micro-chevron-down" />
      </div>
      
      {/* Debug visual para ver el valor actual */}
      <div style={{ 
        fontSize: '12px', 
        color: '#333', 
        marginTop: '5px',
        border: '1px solid #ccc',
        padding: '5px',
        backgroundColor: '#f9f9f9'
      }}>
        <strong>Debug Visual:</strong><br/>
        Valor del select: "{value}"<br/>
        DOM value: {selectRef.current ? `"${selectRef.current.value}"` : 'null'}<br/>
        Selected index: {selectRef.current ? selectRef.current.selectedIndex : 'null'}<br/>
        Opción seleccionada: {selectRef.current && selectRef.current.selectedIndex >= 0 ? 
          selectRef.current.options[selectRef.current.selectedIndex]?.text || 'No encontrada' : 'Ninguna'}
      </div>
    </div>
  );
}
