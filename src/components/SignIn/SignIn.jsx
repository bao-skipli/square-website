import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import { loginUser, subscribeAuth, getFriendlyErrorMessage } from "@/firebase/authService";
import { SIGNIN_ITEMS } from "@/constants/signInItems";
import { SquareLogoIcon } from "@/components/ui/Icon";
import SignInShowcase from "@/features/auth/SignInShowcase";
import "./SignIn.css";

const ROW_HEIGHT = 48;
const ITEM_COUNT = SIGNIN_ITEMS.length;
const TOTAL_ITEMS = [...SIGNIN_ITEMS, ...SIGNIN_ITEMS, ...SIGNIN_ITEMS];

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
      redirectToDashboard: false,
      redirectToVerify: false,
    };

    this.viewportRef = React.createRef();
    this.tickerInterval = null;
    this.resetTimer = null;
    this.unsubscribeAuth = null;
  }

  componentDidMount() {
    this.unsubscribeAuth = subscribeAuth((user) => {
      if (user) {
        this.setState({ redirectToDashboard: true });
      }
    });

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
    if (this.unsubscribeAuth) this.unsubscribeAuth();
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
      await loginUser(email, password);
      this.setState({ redirectToDashboard: true });
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
      redirectToDashboard,
      redirectToVerify,
    } = this.state;

    if (redirectToDashboard) {
      return <Navigate to="/dashboard" replace />;
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
            <SquareLogoIcon size={28} color="#000000" />
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

        <SignInShowcase
          viewportRef={this.viewportRef}
          translateY={translateY}
          isTransitioning={isTransitioning}
          totalItems={TOTAL_ITEMS}
          globalIndex={globalIndex}
          onItemClick={(idx) =>
            this.setState({ isTransitioning: true, globalIndex: idx })
          }
          nextItem={nextItem}
          activeItem={activeItem}
          tellMeMore={tellMeMore}
          onTellMeMoreChange={(e) =>
            this.setState({ tellMeMore: e.target.checked })
          }
        />
      </div>
    );
  }
}
