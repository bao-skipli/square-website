import React, { PureComponent } from "react";
import "./Input.css";

export default class Input extends PureComponent {
  render() {
    const {
      label,
      error,
      value,
      placeholder,
      type = "text",
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      autoFocus = false,
      suffix = null,
      prefix = null,
      className = "",
      id,
      name,
      ...rest
    } = this.props;

    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className={`sq-input-group ${error ? "has-error" : ""} ${disabled ? "is-disabled" : ""} ${className}`}>
        <div className="sq-input-control">
          {prefix && <div className="sq-input-prefix">{prefix}</div>}
          <div className="sq-input-field-wrap">
            {label && hasValue && <label className="sq-input-floating-label">{label}</label>}
            <input
              id={id}
              name={name}
              type={type}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
              disabled={disabled}
              autoFocus={autoFocus}
              className={`sq-input-field ${label && hasValue ? "has-floating-label" : ""}`}
              {...rest}
            />
          </div>
          {suffix && <div className="sq-input-suffix">{suffix}</div>}
        </div>
        {error && <div className="sq-input-error-msg">{error}</div>}
      </div>
    );
  }
}
