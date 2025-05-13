import React from "react";
import PropTypes from "prop-types";
import "./TextAreaField.css";
import { ArrowsPointingOutIcon } from '@heroicons/react/20/solid';

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
            resize: "both", // Permitir redimensionamiento en ambas direcciones
            minHeight: 56,
          }}
        />
        {/* Drag icon (bottom right) */}
        <span className="drag" aria-hidden="true">
          <ArrowsPointingOutIcon width={10} height={10} />
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
