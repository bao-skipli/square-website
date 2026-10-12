import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  subscribeAuth,
  logoutUser,
  sendVerificationEmailCode,
  confirmVerificationCode,
} from "@/firebase/authService";
import { SquareLogoIcon } from "@/components/ui/Icon";
import { DigitCodeInput } from "@/components/ui/Input";
import "./VerifyEmail.css";

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
    this.countdownTimer = null;
    this.unsubscribeAuth = null;
  }

  componentDidMount() {
    this.unsubscribeAuth = subscribeAuth(async (user) => {
      if (!user) {
        this.setState({ checkingAuth: false, redirectToSignIn: true });
        return;
      }
      this.setState({ currentUser: user, checkingAuth: false });

      if (user.emailVerified) {
        this.setState({ redirectToBusinessMatch: true });
      }
    });

    if (this.inputRefs[0]) {
      this.inputRefs[0].focus();
    }
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) this.unsubscribeAuth();
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  startCountdown = (seconds = 30) => {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.setState({ countdown: seconds });
    this.countdownTimer = setInterval(() => {
      this.setState((prev) => {
        if (prev.countdown <= 1) {
          clearInterval(this.countdownTimer);
          return { countdown: 0 };
        }
        return { countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  isCodeComplete = () => {
    return this.state.digits.every((d) => d.trim().length === 1);
  };

  getCodeString = () => {
    return this.state.digits.join("");
  };

  handleDigitChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, "");
    if (!val) {
      const nextDigits = [...this.state.digits];
      nextDigits[index] = "";
      this.setState({ digits: nextDigits, error: "" });
      return;
    }

    const char = val.slice(-1);
    const nextDigits = [...this.state.digits];
    nextDigits[index] = char;

    this.setState({ digits: nextDigits, error: "" }, () => {
      if (index < 5 && this.inputRefs[index + 1]) {
        this.inputRefs[index + 1].focus();
      }
    });
  };

  handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!this.state.digits[index] && index > 0) {
        if (this.inputRefs[index - 1]) {
          this.inputRefs[index - 1].focus();
        }
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      if (this.inputRefs[index - 1]) this.inputRefs[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      if (this.inputRefs[index + 1]) this.inputRefs[index + 1].focus();
    }
  };

  handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const chars = pasted.split("");
    const nextDigits = [...this.state.digits];
    for (let i = 0; i < chars.length; i++) {
      if (i < 6) nextDigits[i] = chars[i];
    }

    const nextFocusIndex = Math.min(chars.length, 5);
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
          if (this.inputRefs[0]) this.inputRefs[0].focus();
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
            <DigitCodeInput
              digits={digits}
              isBoxFocused={isBoxFocused}
              error={error}
              onFocus={() => this.setState({ isBoxFocused: true })}
              onBlur={() => this.setState({ isBoxFocused: false })}
              inputRefs={this.inputRefs}
              onDigitChange={this.handleDigitChange}
              onKeyDown={this.handleKeyDown}
              onPaste={this.handlePaste}
            />

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
