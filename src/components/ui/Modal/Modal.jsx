import React, { Component } from "react";
import { CloseXIcon } from "@/components/ui/Icon";
import "./Modal.css";

export default class Modal extends Component {
  componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (e) => {
    if (e.key === "Escape" && this.props.isOpen && this.props.onClose) {
      this.props.onClose();
    }
  };

  handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    const {
      isOpen,
      onClose,
      title,
      children,
      footer,
      size = "md", // "sm" | "md" | "lg"
      className = "",
      showClose = true,
    } = this.props;

    if (!isOpen) return null;

    return (
      <div className="sq-modal-backdrop" onClick={this.handleBackdropClick} role="dialog" aria-modal="true">
        <div className={`sq-modal-dialog sq-modal-dialog--${size} ${className}`}>
          {(title || showClose) && (
            <div className="sq-modal-header">
              {title && <h2 className="sq-modal-title">{title}</h2>}
              {showClose && onClose && (
                <button
                  type="button"
                  className="sq-modal-close-btn"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <CloseXIcon size={18} />
                </button>
              )}
            </div>
          )}

          <div className="sq-modal-body">{children}</div>

          {footer && <div className="sq-modal-footer">{footer}</div>}
        </div>
      </div>
    );
  }
}
