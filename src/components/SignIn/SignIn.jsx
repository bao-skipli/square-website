import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import { loginUser, getFriendlyErrorMessage } from "../../firebase/authService";
import "./SignIn.css";

const SIGNIN_ITEMS = [
  {
    text: "Monitor your team's sales",
    image: "/images/signin/monitor-team-sales.png",
  },
  {
    text: "Sell prepaid services",
    image: "/images/signin/sell-prepaid-services.png",
  },
  {
    text: "Track your team's hours",
    image: "/images/signin/track-team-hours.png",
  },
  {
    text: "Fill cancellations",
    image: "/images/signin/fill-cancellations.png",
  },
  {
    text: "Optimize scheduling",
    image: "/images/signin/optimize-scheduling.png",
  },
  {
    text: "Track live sales",
    image: "/images/signin/track-live-sales.png",
  },
  {
    text: "Automate marketing",
    image: "/images/signin/automate-marketing.png",
  },
  {
    text: "Create floor plans",
    image: "/images/signin/create-floor-plans.png",
  },
  {
    text: "Pre-authorize cards",
    image: "/images/signin/pre-authorize-cards.png",
  },
  {
    text: "Grow your customer base",
    image: "/images/signin/grow-customer-base.png",
  },
  {
    text: "Receive instant payouts",
    image: "/images/signin/receive-instant-payouts.png",
  },
  {
    text: "Increase order speed",
    image: "/images/signin/increase-order-speed.png",
  },
  {
    text: "Build repeat business",
    image: "/images/signin/build-repeat-business.png",
  },
  {
    text: "Enable coursing",
    image: "/images/signin/enable-coursing.png",
  },
  {
    text: "Increase sales",
    image: "/images/signin/increase-sales.png",
  },
  {
    text: "Connect with your team",
    image: "/images/signin/connect-with-team.png",
  },
];

const TOTAL_ITEMS = [...SIGNIN_ITEMS, ...SIGNIN_ITEMS, ...SIGNIN_ITEMS];
const ITEM_COUNT = SIGNIN_ITEMS.length;
const ROW_HEIGHT = 52; // px

function SquareLogo({ size = 26, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Square"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke={color}
        strokeWidth="2.5"
      />
      <rect
        x="8.5"
        y="8.5"
        width="7"
        height="7"
        rx="1"
        fill={color}
      />
    </svg>
  );
}

export default class SignIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      showPasswordField: false,
      tellMeMore: true,
      globalIndex: ITEM_COUNT,
      isTransitioning: true,
      viewportHeight: 440,
      loading: false,
      error: "",
      redirectToHome: false,
      redirectToVerify: false,
    };

    this.viewportRef = React.createRef();
    this.tickerInterval = null;
    this.resetTimer = null;
  }

  componentDidMount() {
    this.updateViewportHeight();
    window.addEventListener("resize", this.updateViewportHeight);

    this.tickerInterval = setInterval(() => {
      this.setState((prev) => ({
        globalIndex: prev.globalIndex + 1,
        isTransitioning: true,
      }));
    }, 2800);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.globalIndex >= ITEM_COUNT * 2 && prevState.globalIndex < ITEM_COUNT * 2) {
      if (this.resetTimer) clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => {
        this.setState({
          isTransitioning: false,
          globalIndex: this.state.globalIndex - ITEM_COUNT,
        });
      }, 700);
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateViewportHeight);
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    if (this.resetTimer) clearTimeout(this.resetTimer);
  }

  updateViewportHeight = () => {
    if (this.viewportRef.current) {
      this.setState({ viewportHeight: this.viewportRef.current.offsetHeight });
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, showPasswordField } = this.state;

    if (!showPasswordField) {
      this.setState({ showPasswordField: true });
      return;
    }

    this.setState({ loading: true, error: "" });
    try {
      const user = await loginUser(email, password);
      if (!user.emailVerified) {
        this.setState({ redirectToVerify: true });
      } else {
        this.setState({ redirectToHome: true });
      }
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
      showPasswordField,
      tellMeMore,
      globalIndex,
      isTransitioning,
      viewportHeight,
      loading,
      error,
      redirectToHome,
      redirectToVerify,
    } = this.state;

    if (redirectToHome) {
      return <Navigate to="/" replace />;
    }
    if (redirectToVerify) {
      return <Navigate to="/verify" replace />;
    }

    const activeNormalizedIndex = globalIndex % ITEM_COUNT;
    const activeItem = SIGNIN_ITEMS[activeNormalizedIndex];
    const nextItem = SIGNIN_ITEMS[(activeNormalizedIndex + 1) % ITEM_COUNT];

    const centerOffset = viewportHeight / 2 - ROW_HEIGHT / 2;
    const translateY = centerOffset - globalIndex * ROW_HEIGHT;

    return (
      <div className="signin-page">
        <div className="signin-left-col">
          <Link to="/" className="signin-brand-link" aria-label="Square Home">
            <SquareLogo size={28} color="#000000" />
            <span className="signin-brand-text">Square</span>
          </Link>

          <div className="signin-form-wrapper">
            <h1 className="signin-title">Sign in</h1>
            <p className="signin-subtitle">
              New to Square?{" "}
              <Link to="/signup" className="signin-link">
                Sign up
              </Link>
            </p>

            {error && (
              <div
                style={{
                  color: "#d32f2f",
                  backgroundColor: "#ffebee",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                {error}
              </div>
            )}

            <form className="signin-form" onSubmit={this.handleSubmit}>
              <div className="signin-input-group">
                <input
                  type="text"
                  className="signin-input"
                  placeholder="Email or phone number"
                  value={email}
                  onChange={(e) => this.setState({ email: e.target.value })}
                  aria-label="Email or phone number"
                />
              </div>

              {showPasswordField && (
                <div className="signin-input-group" style={{ marginTop: "12px" }}>
                  <input
                    type="password"
                    className="signin-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => this.setState({ password: e.target.value })}
                    aria-label="Password"
                  />
                </div>
              )}

              <button
                type="submit"
                className="signin-submit-btn"
                disabled={loading}
              >
                {loading ? "Signing in..." : showPasswordField ? "Sign in" : "Continue"}
              </button>
            </form>

            <div className="signin-divider">
              <span>or</span>
            </div>

            <button type="button" className="signin-passkey-btn">
              <svg
                className="signin-passkey-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Sign in with a passkey</span>
            </button>
          </div>

          <div style={{ height: "20px" }} />
        </div>

        <div className="signin-right-col">
          <div className="signin-showcase-container">
            <div className="signin-dark-card">
              <div className="signin-ticker-viewport" ref={this.viewportRef}>
                <div className="signin-ticker-fade-top" />
                <div className="signin-ticker-fade-bottom" />

                <div
                  className="signin-ticker-track"
                  style={{
                    transform: `translateY(${translateY}px)`,
                    transition: isTransitioning
                      ? "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)"
                      : "none",
                  }}
                >
                  {TOTAL_ITEMS.map((item, idx) => {
                    const isActive = idx === globalIndex;
                    return (
                      <div
                        key={idx}
                        className={`signin-ticker-item ${isActive ? "is-active" : "is-inactive"
                          }`}
                        onClick={() => {
                          this.setState({
                            isTransitioning: true,
                            globalIndex: idx,
                          });
                        }}
                      >
                        {item.text}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="signin-preview-viewport">
                <div className="signin-card-preview-peek">
                  <img
                    src={nextItem.image}
                    alt=""
                    loading="lazy"
                  />
                </div>

                <div className="signin-card-preview" key={activeItem.image}>
                  <img
                    src={activeItem.image}
                    alt={activeItem.text}
                    className="signin-card-img"
                  />
                </div>
              </div>
            </div>

            <div className="signin-promo-section">
              <h2 className="signin-promo-title">
                See what's possible with Square Plus
              </h2>
              <p className="signin-promo-desc">
                More tools, lower processing fees, and features built for growing businesses.
              </p>

              <label className="signin-checkbox-label">
                <input
                  type="checkbox"
                  className="signin-checkbox-input"
                  checked={tellMeMore}
                  onChange={(e) => this.setState({ tellMeMore: e.target.checked })}
                />
                <span className="signin-custom-checkbox">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="signin-checkbox-text">
                  Tell me more after sign in
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
