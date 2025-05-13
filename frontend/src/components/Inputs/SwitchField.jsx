import React from "react";
import "./SwitchField.css";

/**
 * Props:
 * - label: string
 * - description?: string
 * - checked?: boolean
 * - disabled?: boolean
 * - onChange?: (checked: boolean) => void
 * - style?: React.CSSProperties
 */
export default function SwitchField({
  label,
  description = "",
  checked = false,
  disabled = false,
  onChange = () => {},
  style = {},
}) {
  // State classes
  const state = disabled ? "state-disabled" : "state-default";

  return (
    <div className={`switch-field ${state}`} style={style}>
      <label className="checkbox-and-label" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
        <span className="label">{label}</span>
        <span className="switch-wrapper">
          <input
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={e => onChange(e.target.checked)}
            className="switch-input"
            style={{ opacity: 0, width: 40, height: 24, position: "absolute", left: 0, top: 0, margin: 0, cursor: disabled ? "not-allowed" : "pointer" }}
          />
          <span className={`switch${checked ? " checked" : ""}${disabled ? " disabled" : ""}`}></span>
        </span>
      </label>
      {description && <div className="description">{description}</div>}
    </div>
  );
}
