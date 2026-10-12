import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import {
  subscribeAuth,
  saveUserBusinessInfo,
  getUserBusinessInfo,
} from "@/firebase/authService";
import { DebitCardIcon, SavingsCoinIcon } from "@/components/ui/Icon";
import SquareBankingDisclaimers from "@/features/onboarding/SquareBankingDisclaimers";
import "./SquareBanking.css";

export default class SquareBanking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkingEnabled: true,
      savingsEnabled: true,
      currentUser: null,
      checkingAuth: true,
      loading: false,
      redirectToSignIn: false,
      redirectToDashboard: false,
    };

    this.unsubscribeAuth = null;
  }

  componentDidMount() {
    this.unsubscribeAuth = subscribeAuth(async (user) => {
      if (!user) {
        this.setState({ checkingAuth: false, redirectToSignIn: true });
        return;
      }

      this.setState({ currentUser: user, checkingAuth: false });

      try {
        const info = await getUserBusinessInfo(user.uid);
        if (info?.squareBanking) {
          this.setState({
            checkingEnabled: info.squareBanking.checkingEnabled ?? true,
            savingsEnabled: info.squareBanking.savingsEnabled ?? true,
          });
        }
      } catch (err) {
        console.warn("Could not load banking info:", err);
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  toggleChecking = () => {
    this.setState((prev) => ({ checkingEnabled: !prev.checkingEnabled }));
  };

  toggleSavings = () => {
    this.setState((prev) => ({ savingsEnabled: !prev.savingsEnabled }));
  };

  handleContinue = async (isSkipping = false) => {
    if (this.state.loading) return;

    this.setState({ loading: true });
    try {
      const { checkingEnabled, savingsEnabled } = this.state;
      await saveUserBusinessInfo({
        squareBanking: {
          checkingEnabled: isSkipping ? false : checkingEnabled,
          savingsEnabled: isSkipping ? false : savingsEnabled,
          skipped: isSkipping,
        },
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString(),
      });
      this.setState({ loading: false, redirectToDashboard: true });
    } catch (err) {
      console.error("Save banking settings error:", err);
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      checkingEnabled,
      savingsEnabled,
      checkingAuth,
      loading,
      redirectToSignIn,
      redirectToDashboard,
    } = this.state;

    if (redirectToSignIn) {
      return <Navigate to="/signin" replace />;
    }

    if (redirectToDashboard) {
      return <Navigate to="/dashboard" replace />;
    }

    if (checkingAuth) {
      return (
        <div className="square-banking-page" style={{ justifyContent: "center" }}>
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      );
    }

    return (
      <div className="square-banking-page">
        <main className="square-banking-container">
          <h1 className="banking-title">Square Banking, built for your business</h1>
          <p className="banking-description">
            We'll save these to your dashboard. Set them up whenever you want.
          </p>

          <div className="banking-feature-box">
            {/* Square Checking */}
            <div className="banking-feature-row">
              <div className="banking-feature-icon">
                <DebitCardIcon />
              </div>
              <div className="banking-feature-content">
                <h2 className="banking-feature-title">
                  Business debit card with Square Checking
                </h2>
                <p className="banking-feature-subtitle">
                  Spend instantly², pay bills, deposit cash³ or checks
                </p>
              </div>
              <button
                type="button"
                className={`banking-toggle-btn ${checkingEnabled ? "is-active" : ""}`}
                onClick={this.toggleChecking}
                aria-label="Toggle Square Checking"
                aria-pressed={checkingEnabled}
              >
                <span className="banking-toggle-knob" />
              </button>
            </div>

            {/* Square Savings */}
            <div className="banking-feature-row">
              <div className="banking-feature-icon">
                <SavingsCoinIcon />
              </div>
              <div className="banking-feature-content">
                <h2 className="banking-feature-title">
                  High yield savings with Square Savings
                </h2>
                <p className="banking-feature-subtitle">
                  Save automatically and earn up to 4.25% APY¹
                </p>
              </div>
              <button
                type="button"
                className={`banking-toggle-btn ${savingsEnabled ? "is-active" : ""}`}
                onClick={this.toggleSavings}
                aria-label="Toggle Square Savings"
                aria-pressed={savingsEnabled}
              >
                <span className="banking-toggle-knob" />
              </button>
            </div>
          </div>

          <div className="banking-actions-row">
            <button
              type="button"
              className="banking-btn-skip"
              disabled={loading}
              onClick={() => this.handleContinue(true)}
            >
              Skip for now
            </button>
            <button
              type="button"
              className="banking-btn-continue"
              disabled={loading}
              onClick={() => this.handleContinue(false)}
            >
              {loading ? "Saving..." : "Continue with banking"}
            </button>
          </div>

          <SquareBankingDisclaimers />
        </main>
      </div>
    );
  }
}
