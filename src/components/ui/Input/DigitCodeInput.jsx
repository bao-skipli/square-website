import React, { PureComponent } from "react";

export default class DigitCodeInput extends PureComponent {
  render() {
    const {
      digits,
      isBoxFocused,
      error,
      onFocus,
      onBlur,
      inputRefs,
      onDigitChange,
      onKeyDown,
      onPaste,
    } = this.props;

    return (
      <div
        className={`verify-input-box ${isBoxFocused ? "is-focused" : ""} ${
          error ? "has-error" : ""
        }`}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        {digits.map((digit, index) => (
          <div key={index} className="verify-slot">
            {!digit && <div className="verify-dot" aria-hidden="true" />}
            <input
              ref={(el) => (inputRefs[index] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => onDigitChange(e, index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              onPaste={onPaste}
              className="verify-slot-input"
              aria-label={`Digit ${index + 1}`}
            />
          </div>
        ))}
      </div>
    );
  }
}
