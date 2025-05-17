import React from "react";
import "./InputField.css";

/**
 * Props:
 * - label: string
 * - value?: string
 * - placeholder?: string
 * - disabled?: boolean
 * - error?: boolean
 * - fillContainer?: boolean - Si es true, el campo ocupará el 100% del ancho disponible
 * - onChange?: (value: string) => void
 * - style?: React.CSSProperties
 */
export default function InputField({
  label,
  value = "",
  placeholder = "",
  disabled = false,
  error = false,
  fillContainer = false,
  onChange = () => {},
  style = {},
}) {
  const isPlaceholder = !value && placeholder;
  const state = disabled
    ? "state-disabled"
    : error
    ? "state-error"
    : "state-default";
  const valueType = isPlaceholder ? "value-type-placeholder" : "value-type-value";
  const fillClass = fillContainer ? "fill-container" : "";

  return (
    <div className={`input-field ${state} ${valueType} ${fillClass}`} style={style}>
      <div className="label">{label}</div>
      <div className="inputField">
        <input
          className="value"
          type="text"
          value={value}
          placeholder={placeholder}
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
          }}
        />
      </div>
    </div>
  );
}
