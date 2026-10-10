import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  registerUser,
  getFriendlyErrorMessage,
  sendVerificationEmailCode,
} from "../../firebase/authService";
import "./SignUp.css";

const VIDEO_SRC = "/images/signup/30a093e0-ab59-4745-b05a-179535ceb901-en-PD06867_-_auto_video_15_cut_mobile.webm";
const LOGOS_SRC = "/images/signup/us-logos.72b97247.webp";

const LOCALES = [
  { id: "us", name: "United States (English)" },
  { id: "ca", name: "Canada (English)" },
  { id: "uk", name: "United Kingdom (English)" },
  { id: "au", name: "Australia (English)" },
  { id: "jp", name: "Japan (日本語)" },
  { id: "fr", name: "France (Français)" },
  { id: "es", name: "Spain (Español)" },
  { id: "ie", name: "Ireland (English)" },
];

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

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      showPassword: false,
      selectedLocale: LOCALES[0],
      isDropdownOpen: false,
      agreed: false,
      showTooltip: false,
      loading: false,
      error: "",
      redirectToVerify: false,
    };

    this.dropdownRef = React.createRef();
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = (e) => {
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(e.target)) {
      this.setState({ isDropdownOpen: false });
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, selectedLocale, agreed } = this.state;
    if (!agreed) {
      this.setState({ error: "Please agree to the Terms, Privacy Policy, and E-Sign Consent to continue." });
      return;
    }

    this.setState({ loading: true, error: "" });
    try {
      await registerUser(email, password, selectedLocale.name);
      try {
        await sendVerificationEmailCode();
      } catch (sendErr) {
        console.warn("Could not send verification code immediately:", sendErr);
      }
      this.setState({ redirectToVerify: true });
    } catch (err) {
      this.setState({
        error: getFriendlyErrorMessage(err),
        loading: false,
      });
    }
  };

  render() {
    const {
      email,
      password,
      showPassword,
      selectedLocale,
      isDropdownOpen,
      agreed,
      showTooltip,
      loading,
      error,
      redirectToVerify,
    } = this.state;

    if (redirectToVerify) {
      return <Navigate to="/verify" replace />;
    }

    return (
      <div className="signup-page">
        <div className="signup-left-col">
          <div className="signup-header">
            <Link to="/" className="signup-logo-link" aria-label="Square Home">
              <SquareLogoIcon size={34} color="#000000" />
            </Link>
          </div>

          <div className="signup-form-wrapper">
            <h1 className="signup-title">Let&apos;s create your account</h1>
            <p className="signup-subtitle">
              Signing up for Square is fast and free—no commitments or long-term contracts.
            </p>

            {error && (
              <div
                style={{
                  color: "#d9383a",
                  fontSize: "14px",
                  marginBottom: "12px",
                  lineHeight: 1.4,
                }}
              >
                {error}
              </div>
            )}

            <form className="signup-form" onSubmit={this.handleSubmit}>
              <div className="signup-input-group">
                <input
                  type="email"
                  className="signup-input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => this.setState({ email: e.target.value })}
                  aria-label="Email"
                />
              </div>

              <div className="signup-input-group signup-password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="signup-input signup-password-input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => this.setState({ password: e.target.value })}
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="signup-password-toggle"
                  onClick={() => this.setState((prev) => ({ showPassword: !prev.showPassword }))}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>

              <div
                className={`signup-locale-container ${isDropdownOpen ? "is-open" : ""}`}
                ref={this.dropdownRef}
              >
                <div
                  className="signup-locale-trigger"
                  onClick={() => this.setState((prev) => ({ isDropdownOpen: !prev.isDropdownOpen }))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      this.setState((prev) => ({ isDropdownOpen: !prev.isDropdownOpen }));
                    }
                  }}
                >
                  <div className="signup-locale-text-block">
                    <span className="signup-locale-label">Locale</span>
                    <span className="signup-locale-value">{selectedLocale.name}</span>
                  </div>

                  <div className="signup-locale-actions">
                    <div
                      className="signup-info-btn"
                      title="Your locale determines features, currency, and language support."
                      onMouseEnter={() => this.setState({ showTooltip: true })}
                      onMouseLeave={() => this.setState({ showTooltip: false })}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.setState((prev) => ({ showTooltip: !prev.showTooltip }));
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>

                      {showTooltip && (
                        <div className="signup-tooltip">
                          Your locale determines available features, currency, and regulatory compliance.
                        </div>
                      )}
                    </div>

                    <svg
                      className={`signup-chevron-icon ${isDropdownOpen ? "rotated" : ""}`}
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {isDropdownOpen && (
                  <ul className="signup-locale-menu">
                    {LOCALES.map((locale) => (
                      <li
                        key={locale.id}
                        className={`signup-locale-item ${
                          locale.id === selectedLocale.id ? "is-selected" : ""
                        }`}
                        onClick={() => {
                          this.setState({ selectedLocale: locale, isDropdownOpen: false });
                        }}
                      >
                        {locale.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="signup-agreement-group">
                <label className="signup-checkbox-label">
                  <input
                    type="checkbox"
                    className="signup-checkbox-native"
                    checked={agreed}
                    onChange={(e) => this.setState({ agreed: e.target.checked })}
                  />
                  <span className="signup-custom-checkbox">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="signup-checkbox-text">
                    I agree to Square&apos;s{" "}
                    <a href="#terms" className="signup-inline-link">
                      Terms
                    </a>
                    ,{" "}
                    <a href="#privacy" className="signup-inline-link">
                      Privacy Policy
                    </a>
                    , and{" "}
                    <a href="#esign" className="signup-inline-link">
                      E-Sign Consent
                    </a>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="signup-submit-btn"
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="signup-signin-prompt">
              Already have a Square account?{" "}
              <Link to="/signin" className="signup-signin-link">
                Sign in.
              </Link>
            </p>
          </div>

          <div className="signup-footer">
            <p className="signup-recaptcha-text">
              This site is protected by reCAPTCHA Enterprise and the Google{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="signup-inline-link">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="signup-inline-link">
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </div>
        </div>

        <div className="signup-right-col">
          <div className="signup-showcase-card">
            <video
              className="signup-showcase-video"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src={VIDEO_SRC} type="video/webm" />
            </video>

            <div className="signup-showcase-overlay" />

            <div className="signup-showcase-content">
              <h2 className="signup-showcase-title">
                Join the 4 million+ businesses
                <br />
                running with Square.
              </h2>

              <div className="signup-showcase-logos-wrapper">
                <img
                  src={LOGOS_SRC}
                  alt="Businesses running with Square"
                  className="signup-showcase-logos"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
