import React, { PureComponent } from "react";
import "./Toggle.css";

export default class Toggle extends PureComponent {
  handleChange = (e) => {
    const { onChange, disabled } = this.props;
    if (disabled) return;
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  render() {
    const {
      checked = false,
      disabled = false,
      id,
      name,
      label,
      className = "",
    } = this.props;

    return (
      <label className={`sq-toggle-wrapper ${disabled ? "is-disabled" : ""} ${className}`}>
        <input
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={this.handleChange}
          className="sq-toggle-input"
        />
        <span className="sq-toggle-track">
          <span className="sq-toggle-thumb" />
        </span>
        {label && <span className="sq-toggle-label">{label}</span>}
      </label>
    );
  }
}
