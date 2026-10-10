import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  subscribeAuth,
  logoutUser,
  sendVerificationEmailCode,
  confirmVerificationCode,
} from "../../firebase/authService";
import "./VerifyEmail.css";

function SquareLogoIcon({ size = 32, color = "#000000" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Square Logo"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4.5"
        stroke={color}
        strokeWidth="2.5"
      />
      <rect
        x="8.5"
        y="8.5"
        width="7"
        height="7"
        rx="1.2"
        fill={color}
      />
    </svg>
  );
}

export default class VerifyEmail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      digits: ["", "", "", "", "", ""],
      focusedIndex: 0,
      isBoxFocused: false,
      loading: false,
      resending: false,
      error: "",
      infoMessage: "",
      countdown: 0,
      currentUser: null,
      checkingAuth: true,
      redirectToBusinessMatch: false,
      redirectToSignIn: false,
      redirectToSignUp: false,
      displayCode: "",
    };

    this.inputRefs = [];
    this.countdownInterval = null;
    this.unsubscribeAuth = null;
  }

  componentDidMount() {
    this.unsubscribeAuth = subscribeAuth((user) => {
      if (!user) {
        this.setState({ checkingAuth: false, redirectToSignIn: true });
        return;
      }

      if (user.emailVerified) {
        this.setState({ checkingAuth: false, redirectToBusinessMatch: true });
        return;
      }

      this.setState({ currentUser: user, checkingAuth: false }, () => {
        // Tự động focus ô đầu tiên
        if (this.inputRefs[0]) {
          this.inputRefs[0].focus();
        }

        const existingCode = sessionStorage.getItem(`verify_code_${user.uid}`);
        if (existingCode) {
          this.setState({ displayCode: existingCode });
        } else {
          sendVerificationEmailCode().then((res) => {
            if (res?.code) {
              this.setState({ displayCode: res.code });
            }
          });
        }
      });
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  isCodeComplete = () => {
    return this.state.digits.every((d) => d !== "");
  };

  getCodeString = () => {
    return this.state.digits.join("");
  };

  startCountdown = (seconds = 30) => {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    this.setState({ countdown: seconds });
    this.countdownInterval = setInterval(() => {
      this.setState((prev) => {
        if (prev.countdown <= 1) {
          clearInterval(this.countdownInterval);
          return { countdown: 0 };
        }
        return { countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  handleDigitChange = (e, index) => {
    const rawVal = e.target.value;
    const cleanDigits = rawVal.replace(/\D/g, "");

    // Xử lý trường hợp nhập nhiều số cùng lúc
    if (cleanDigits.length > 1) {
      this.applyPastedCode(cleanDigits, index);
      return;
    }

    const nextDigits = [...this.state.digits];
    nextDigits[index] = cleanDigits;

    this.setState({ digits: nextDigits, error: "" }, () => {
      if (cleanDigits && index < 5 && this.inputRefs[index + 1]) {
        this.inputRefs[index + 1].focus();
      }
    });
  };

  handleKeyDown = (e, index) => {
    const { digits } = this.state;

    if (e.key === "Backspace") {
      if (!digits[index] && index > 0 && this.inputRefs[index - 1]) {
        e.preventDefault();
        const nextDigits = [...digits];
        nextDigits[index - 1] = "";
        this.setState({ digits: nextDigits, error: "" });
        this.inputRefs[index - 1].focus();
      }
      return;
    }

    if (e.key === "ArrowLeft" && index > 0 && this.inputRefs[index - 1]) {
      e.preventDefault();
      this.inputRefs[index - 1].focus();
      return;
    }

    if (e.key === "ArrowRight" && index < 5 && this.inputRefs[index + 1]) {
      e.preventDefault();
      this.inputRefs[index + 1].focus();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (this.isCodeComplete() && !this.state.loading) {
        this.handleVerify();
      }
    }
  };

  handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    this.applyPastedCode(pasted, 0);
  };

  applyPastedCode = (codeString, startIndex = 0) => {
    const chars = codeString.split("");
    const nextDigits = [...this.state.digits];

    for (let i = 0; i < chars.length; i++) {
      const targetIndex = startIndex + i;
      if (targetIndex < 6) {
        nextDigits[targetIndex] = chars[i];
      }
    }

    const nextFocusIndex = Math.min(startIndex + chars.length, 5);
    this.setState({ digits: nextDigits, error: "" }, () => {
      if (this.inputRefs[nextFocusIndex]) {
        this.inputRefs[nextFocusIndex].focus();
      }
    });
  };

  handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!this.isCodeComplete() || this.state.loading) return;

    const code = this.getCodeString();
    this.setState({ loading: true, error: "", infoMessage: "" });

    try {
      await confirmVerificationCode(code);
      this.setState({ redirectToBusinessMatch: true });
    } catch (err) {
      this.setState(
        {
          error: err.message || "Incorrect verification code. Please try again.",
          digits: ["", "", "", "", "", ""],
          loading: false,
        },
        () => {
          if (this.inputRefs[0]) {
            this.inputRefs[0].focus();
          }
        }
      );
    }
  };

  handleResendCode = async () => {
    if (this.state.countdown > 0 || this.state.resending) return;

    this.setState({ resending: true, error: "", infoMessage: "" });
    try {
      const res = await sendVerificationEmailCode();
      this.setState({
        resending: false,
        displayCode: res?.code || "",
        infoMessage: "A new verification code has been generated.",
      });
      this.startCountdown(30);
    } catch (err) {
      this.setState({
        resending: false,
        error: err.message || "Failed to resend verification code. Please try again later.",
      });
    }
  };

  handleChangeEmail = async () => {
    try {
      await logoutUser();
      this.setState({ redirectToSignUp: true });
    } catch {
      this.setState({ redirectToSignUp: true });
    }
  };

  render() {
    const {
      digits,
      isBoxFocused,
      loading,
      resending,
      error,
      infoMessage,
      countdown,
      currentUser,
      checkingAuth,
      redirectToBusinessMatch,
      redirectToSignIn,
      redirectToSignUp,
      displayCode,
    } = this.state;

    if (redirectToBusinessMatch) {
      return <Navigate to="/signup/business-match" replace />;
    }
    if (redirectToSignIn) {
      return <Navigate to="/signin" replace />;
    }
    if (redirectToSignUp) {
      return <Navigate to="/signup" replace />;
    }

    if (checkingAuth) {
      return (
        <div className="verify-page" style={{ alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      );
    }

    const email = currentUser?.email || "your email address";
    const canSubmit = this.isCodeComplete() && !loading;

    return (
      <div className="verify-page">
        <header className="verify-header">
          <Link to="/" className="verify-logo-link" aria-label="Square Home">
            <SquareLogoIcon size={34} color="#000000" />
          </Link>
        </header>

        <main className="verify-container">
          <h1 className="verify-title">Enter the verification code</h1>

          <p className="verify-description">
            To ensure your account is secure, a verification code was sent to{" "}
            <strong>{email}</strong>. If you haven&apos;t received it after a few minutes, you can
            request a new code below.
          </p>

          <div className="verify-links-row">
            <button
              type="button"
              className="verify-link-btn"
              onClick={this.handleResendCode}
              disabled={countdown > 0 || resending}
            >
              {resending
                ? "Sending..."
                : countdown > 0
                ? `Resend code (${countdown}s)`
                : "Resend code"}
            </button>

            <span className="verify-divider" aria-hidden="true">
              |
            </span>

            <button
              type="button"
              className="verify-link-btn"
              onClick={this.handleChangeEmail}
            >
              Change email
            </button>
          </div>

          {displayCode && (
            <div className="verify-code-banner">
              <span>Verification code:</span>
              <strong>{displayCode}</strong>
            </div>
          )}

          <form onSubmit={this.handleVerify}>
            <div
              className={`verify-input-box ${isBoxFocused ? "is-focused" : ""} ${
                error ? "has-error" : ""
              }`}
              onFocus={() => this.setState({ isBoxFocused: true })}
              onBlur={() => this.setState({ isBoxFocused: false })}
            >
              {digits.map((digit, index) => (
                <div key={index} className="verify-slot">
                  {!digit && <div className="verify-dot" aria-hidden="true" />}
                  <input
                    ref={(el) => (this.inputRefs[index] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => this.handleDigitChange(e, index)}
                    onKeyDown={(e) => this.handleKeyDown(e, index)}
                    onPaste={this.handlePaste}
                    className="verify-slot-input"
                    aria-label={`Digit ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            {error && <div className="verify-error-text">{error}</div>}
            {infoMessage && <div className="verify-info-text">{infoMessage}</div>}

            <button
              type="submit"
              className="verify-submit-btn"
              disabled={!canSubmit}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>
        </main>
      </div>
    );
  }
}
