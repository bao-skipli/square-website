import React, { Component } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  subscribeAuth,
  saveUserBusinessInfo,
  getUserBusinessInfo,
} from "../../../firebase/authService";
import "./SquareBanking.css";

function DebitCardIcon() {
  return (
    <svg
      width="48"
      height="34"
      viewBox="0 0 48 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="46"
        height="32"
        rx="5"
        fill="#F0F1F2"
        stroke="#D2D6DC"
        strokeWidth="1.5"
      />
      <rect x="6" y="8" width="8" height="6" rx="1.5" fill="#E2E5E9" />
      <rect x="6" y="24" width="10" height="2" rx="1" fill="#CBD0D6" />
      <circle cx="38" cy="25" r="3" fill="#D2D6DC" />
    </svg>
  );
}

function SavingsCoinIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="22" cy="22" r="20" fill="#F4F5F7" stroke="#E2E4E8" strokeWidth="1.5" />
      <text
        x="22"
        y="29"
        textAnchor="middle"
        fontSize="24"
        fontWeight="800"
        fill="#111111"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
      >
        $
      </text>
    </svg>
  );
}

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
        if (info && info.squareBanking) {
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

          {/* Feature Card Box */}
          <div className="banking-feature-box">
            {/* Row 1: Square Checking */}
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

            {/* Row 2: Square Savings */}
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

          {/* Action Buttons */}
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

          {/* Legal Disclaimers */}
          <footer className="banking-disclaimers">
            <p>
              Block, Inc. is a financial services platform and not an FDIC-insured bank. Square
              Checking is provided by Sutton Bank, Member FDIC. Square Debit Card is issued by
              Sutton Bank, Member FDIC, pursuant to a license from Mastercard International
              Incorporated.
            </p>
            <p>
              Savings accounts are provided by Square Financial Services, Inc. Member FDIC.
            </p>
            <p>
              ¹Accrue annual percentage yield (APY) of 1.00% based on your total savings
              balance (inclusive of all folders and accrued unpaid interest). You may qualify
              for an increased APY of 4.25% if your total savings balance (inclusive of all
              folders and accrued unpaid interest) is at least $10,000 and settled into your
              account by 7:00 PM Mountain Time to qualify for the increased APY of 4.25% on a
              given day. See <a>Square Savings Deposit Account Terms</a> and the{" "}
              <a>Interest Rate Chart</a> for more information. APY subject to change, current as
              of 9/28/2026. No minimum deposit is required to open an account. Accounts will
              not be charged monthly fees. The Square Savings deposit sweep program distributes
              your funds among multiple FDIC-insured partner banks, meaning your eligible
              savings deposits have FDIC insurance coverage of up to $2.5 million. Pending
              balances are not subject to FDIC insurance.
            </p>
            <p>
              ²Instant availability of Square payments. Funds generated through Square's payment
              processing services are generally available in the Square Checking account
              balance immediately after a payment is processed. Fund availability times may vary
              due to technical issues. ACH transfer fund availability: Instant availability does
              not apply to funds added to the Square Checking account via ACH transfer. ACH
              credit transfers to your account may take 1–2 business days.
            </p>
            <p>
              ³Cash deposited into your Square Checking account is generally available in your
              checking account balance immediately after a deposit is processed. Fund
              availability times may vary due to technical issues. VanillaDirect Pay is
              provided by InComm Financial Services California, Inc. and by InComm Financial
              Services, Inc. (NMLS# 912772), which is licensed as a Money Transmitter by the
              New York State Department of Financial Services. Terms and conditions apply.
            </p>
            <p>
              To help the government fight the funding of terrorism and money laundering
              activities, federal law requires financial institutions to obtain, verify, and
              record information that identifies each person who opens an account.
            </p>
            <p>© 2026 Square, Inc. and/or Square Financial Services, Inc. All rights reserved.</p>
            <p>
              <Link to="/legal" style={{ color: "#111", textDecoration: "underline" }}>
                Privacy Notice
              </Link>
            </p>
          </footer>
        </main>
      </div>
    );
  }
}
