import React, { PureComponent } from "react";
import "./Button.css";

export default class Button extends PureComponent {
  render() {
    const {
      children,
      variant = "primary",
      size = "md",
      type = "button",
      disabled = false,
      loading = false,
      loadingText = "Loading...",
      className = "",
      onClick,
      icon = null,
      ...rest
    } = this.props;

    const classNames = [
      "sq-btn",
      `sq-btn--${variant}`,
      `sq-btn--${size}`,
      loading ? "is-loading" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        type={type}
        className={classNames}
        disabled={disabled || loading}
        onClick={onClick}
        {...rest}
      >
        {icon && !loading && <span className="sq-btn__icon">{icon}</span>}
        <span className="sq-btn__label">{loading ? loadingText : children}</span>
      </button>
    );
  }
}
