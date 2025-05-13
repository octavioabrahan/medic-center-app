import React, { useRef } from "react";
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
  onChange = () => {},
  style = {},
}) {
  const selectRef = useRef(null);
  const isPlaceholder = !value && placeholder;
  const state = disabled
    ? "state-disabled"
    : error
    ? "state-error"
    : "state-default";
  const valueType = isPlaceholder ? "value-type-placeholder" : "value-type-value";

  // Al hacer click en el contenedor, dispara el click real del select
  const handleContainerClick = (e) => {
    if (disabled) return;
    // Si el click fue en el icono, o en el contenedor, abre el select
    if (selectRef.current) {
      selectRef.current.focus();
      // Para forzar el despliegue del menú en la mayoría de navegadores
      const event = document.createEvent('MouseEvents');
      event.initMouseEvent('mousedown', true, true, window);
      selectRef.current.dispatchEvent(event);
    }
  };

  return (
    <div className={`select-field ${state} ${valueType}`} style={style}>
      <div className="label">{label}</div>
      <div className="select" onMouseDown={handleContainerClick} style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <select
          ref={selectRef}
          className="value"
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            width: "100%",
            font: "inherit",
            color: "inherit",
            padding: 0,
            appearance: "none",
            WebkitAppearance: "none",
            MozAppearance: "none",
            cursor: disabled ? "not-allowed" : "pointer"
          }}
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
