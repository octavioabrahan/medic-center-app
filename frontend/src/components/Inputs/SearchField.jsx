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
  fillContainer = false,
  ...props
}) {
  const inputRef = useRef();
  const showClear = value && !disabled;

  return (
    <div
      className={`search state-${disabled ? "disabled" : "default"} ${!value ? "value-type-placeholder" : ""} ${fillContainer ? "fill-container" : ""} ${className}`.trim()}
      {...props}
    >
      <input
        ref={inputRef}
        className="search-value"
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
          className="search-x-mark"
          tabIndex={-1}
          aria-label="Limpiar"
          onClick={() => {
            onClear?.();
            setTimeout(() => { inputRef.current?.focus(); }, 0);
          }}
        >
          <XMarkIcon width={16} height={16} />
        </button>
      ) : (
        <span className="search-magnifying-glass" aria-hidden="true">
          <MagnifyingGlassIcon width={16} height={16} />
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
  fillContainer: PropTypes.bool,
};
