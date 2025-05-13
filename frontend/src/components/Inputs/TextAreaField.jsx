import React from "react";
import PropTypes from "prop-types";
import "./TextAreaField.css";

/**
 * TextAreaField component for multi-line text input.
 * Variants: default, disabled, error, placeholder.
 */
export default function TextAreaField({
  label,
  value = "",
  placeholder = "",
  disabled = false,
  error = false,
  onChange = () => {},
  style = {},
  ...props
}) {
  const isPlaceholder = !value && placeholder;
  const state = disabled
    ? "state-disabled"
    : error
    ? "state-error"
    : "state-default";
  const valueType = isPlaceholder ? "value-type-placeholder" : "value-type-value";

  return (
    <div className={`textarea-field ${state} ${valueType}`} style={style} {...props}>
      <div className="label">{label}</div>
      <div className="textarea">
        <textarea
          className="valueTextField"
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
            resize: "none",
            minHeight: 56,
          }}
        />
        {/* Drag icon (bottom right) */}
        <span className="drag" aria-hidden="true">
          <svg width="7" height="7" viewBox="0 0 7 7" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="5.5" width="1" height="1" rx="0.5" fill="#B3B3B3"/>
            <rect x="2.5" y="5.5" width="1" height="1" rx="0.5" fill="#B3B3B3"/>
            <rect x="4.5" y="5.5" width="1" height="1" rx="0.5" fill="#B3B3B3"/>
            <rect x="2.5" y="3.5" width="1" height="1" rx="0.5" fill="#B3B3B3"/>
            <rect x="4.5" y="3.5" width="1" height="1" rx="0.5" fill="#B3B3B3"/>
            <rect x="4.5" y="1.5" width="1" height="1" rx="0.5" fill="#B3B3B3"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

TextAreaField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.object,
};
