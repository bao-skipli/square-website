import React, { PureComponent } from "react";

export default class UnsavedChangesModal extends PureComponent {
  render() {
    const { isOpen, onDiscard, onResume } = this.props;

    if (!isOpen) return null;

    return (
      <div className="sq-popup-modal-backdrop" style={{ zIndex: 99999 }}>
        <div
          className="sq-unsaved-changes-modal"
          role="alertdialog"
          aria-modal="true"
          aria-label="Unsaved changes"
        >
          <h2 className="sq-unsaved-title">Unsaved changes</h2>
          <p className="sq-unsaved-message">
            Do you want to resume editing or discard these changes?
          </p>
          <div className="sq-unsaved-actions">
            <button
              type="button"
              className="sq-btn-unsaved-discard"
              onClick={onDiscard}
            >
              Discard
            </button>
            <button
              type="button"
              className="sq-btn-unsaved-resume"
              onClick={onResume}
            >
              Resume
            </button>
          </div>
        </div>
      </div>
    );
  }
}
