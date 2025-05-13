import React, { useRef } from "react";
import PropTypes from "prop-types";
import "./SearchField.css";
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/20/solid';

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
          <XMarkIcon width={16} height={16} style={{ color: '#000' }} />
        </button>
      ) : (
        <span className="heroicons-micro-magnifying-glass" aria-hidden="true">
          <MagnifyingGlassIcon width={16} height={16} style={{ color: '#000' }} />
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
