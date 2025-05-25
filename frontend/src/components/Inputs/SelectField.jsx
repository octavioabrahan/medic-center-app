import React, { useEffect, useRef } from "react";
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
  
  // Forzar actualización del select cuando cambian value u options
  useEffect(() => {
    if (selectRef.current && value) {
      selectRef.current.value = value;
    }
  }, [value, options]);

  const isPlaceholder = !value && placeholder;
  const state = disabled
    ? "state-disabled"
    : error
    ? "state-error"
    : "state-default";
  const valueType = isPlaceholder ? "value-type-placeholder" : "value-type-value";
  const fillClass = fillContainer ? "fill-container" : "";

  return (
    <div className={`select-field ${state} ${valueType} ${fillClass}`} style={style}>
      <div className="label">{label}</div>
      <div className={`select select-native-wrapper ${fillContainer ? 'fill-container' : ''}`}>
        <select
          ref={selectRef}
          className="select-native"
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
        >
          {placeholder && <option value="" disabled hidden>{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDownIcon className="heroicons-micro-chevron-down" />
      </div>
    </div>
  );
}
