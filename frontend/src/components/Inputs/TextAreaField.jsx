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
  fillContainer = false,
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
  const fillClass = fillContainer ? "fill-container" : "";

  return (
    <div className={`textarea-field ${state} ${valueType} ${fillClass}`} style={style} {...props}>
      <div className="label-textarea">{label}</div>
      <div className="textarea-container">
        <textarea
          className="textarea-value"
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
            resize: disabled ? "none" : "both", // Desactivar resize cuando está disabled
            minHeight: 56,
          }}
        />
        {/* Utilizamos el resize nativo del navegador, sin icono personalizado */}
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
  fillContainer: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.object,
};
