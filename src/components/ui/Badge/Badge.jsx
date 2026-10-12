import React, { PureComponent } from "react";
import "./Badge.css";

export default class Badge extends PureComponent {
  render() {
    const {
      children,
      variant = "neutral", // "available" | "archived" | "neutral" | "success" | "warning"
      className = "",
      dot = false,
      ...rest
    } = this.props;

    const classNames = [
      "sq-badge",
      `sq-badge--${variant.toLowerCase()}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span className={classNames} {...rest}>
        {dot && <span className="sq-badge__dot" />}
        <span className="sq-badge__text">{children}</span>
      </span>
    );
  }
}
