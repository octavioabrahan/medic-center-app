import React from "react";
import "./RadioField.css";

/**
 * Props:
 * - label: string
 * - description?: string
 * - checked?: boolean
 * - disabled?: boolean
 * - name?: string
 * - onChange?: (checked: boolean) => void
 * - style?: React.CSSProperties
 */
export default function RadioField({
  label,
  description = "",
  checked = false,
  disabled = false,
  name,
  onChange = () => {},
  style = {},
}) {
  // State classes
  const state = disabled ? "state-disabled" : "state-default";
  const valueType = checked ? "value-type-checked" : "value-type-unchecked";

  return (
    <div className={`radio-field ${state} ${valueType}`} style={style}>
      <label className="checkbox-and-label">
        <span className="radio">
          <input
            type="radio"
            checked={checked}
            disabled={disabled}
            name={name}
            onChange={e => onChange(e.target.checked)}
            style={{ opacity: 0, width: 16, height: 16, position: "absolute", left: 0, top: 0, margin: 0, cursor: disabled ? "not-allowed" : "pointer" }}
          />
          {checked && <span className="radio2" />}
        </span>
        <span className="label">{label}</span>
      </label>
      {description && (
        <div className="description-row">
          <span className="space" />
          <span className="description">{description}</span>
        </div>
      )}
    </div>
  );
}
