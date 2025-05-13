import React from "react";
import "./CheckboxField.css";
import { CheckIcon, MinusIcon } from '@heroicons/react/20/solid';

/**
 * Props:
 * - label: string
 * - description?: string
 * - checked?: boolean
 * - indeterminate?: boolean
 * - disabled?: boolean
 * - onChange?: (checked: boolean) => void
 */
export default function CheckboxField({
  label,
  description = "",
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange = () => {},
}) {
  // For indeterminate, we use a ref to set the property on the input
  const inputRef = React.useRef(null);
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  // State classes
  const state = disabled ? "state-disabled" : "state-default";
  let valueType = "value-type-unchecked";
  if (checked) valueType = "value-type-checked";
  else if (indeterminate) valueType = "value-type-indeterminate";

  return (
    <div className={`checkbox-field ${state} ${valueType}`}>
      <label className="checkbox-and-label">
        <span className="checkbox">
          <input
            ref={inputRef}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={e => onChange(e.target.checked)}
            aria-checked={indeterminate ? "mixed" : checked}
            style={{ opacity: 0, width: 16, height: 16, position: "absolute", left: 0, top: 0, margin: 0, cursor: disabled ? "not-allowed" : "pointer" }}
          />
          {checked && !indeterminate && (
            <CheckIcon className="heroicons-micro-check" width={16} height={16} />
          )}
          {indeterminate && (
            <MinusIcon className="heroicons-micro-minus" width={16} height={16} />
          )}
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
