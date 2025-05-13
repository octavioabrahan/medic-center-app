import React, { useRef } from "react";
import PropTypes from "prop-types";
import "./SearchField.css";

/**
 * SearchField component for search input with clear button.
 * Variants: default, disabled, placeholder.
 */
export default function SearchField({
  value,
  onChange,
  placeholder = "Buscar...",
  disabled = false,
  onClear,
  className = "",
  ...props
}) {
  const inputRef = useRef();
  const showClear = value && !disabled;

  return (
    <div
      className={`search state-${disabled ? "disabled" : "default"} ${!value ? "value-type-placeholder" : ""} ${className}`.trim()}
      {...props}
    >
      <input
        ref={inputRef}
        className="value"
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={placeholder}
        autoComplete="off"
      />
      {showClear ? (
        <button
          type="button"
          className="heroicons-micro-x-mark"
          tabIndex={-1}
          aria-label="Limpiar"
          onClick={() => {
            onClear?.();
            inputRef.current?.focus();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.47 4.47a.75.75 0 0 1 1.06 0L8 6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06L9.06 8l2.47 2.47a.75.75 0 1 1-1.06 1.06L8 9.06l-2.47 2.47a.75.75 0 1 1-1.06-1.06L6.94 8 4.47 5.53a.75.75 0 0 1 0-1.06Z" fill="currentColor"/>
          </svg>
        </button>
      ) : (
        <span className="heroicons-micro-magnifying-glass" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13l-2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
      )}
    </div>
  );
}

SearchField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  onClear: PropTypes.func,
  className: PropTypes.string,
};
