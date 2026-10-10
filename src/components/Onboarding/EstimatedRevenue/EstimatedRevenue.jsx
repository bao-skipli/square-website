import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import {
  subscribeAuth,
  saveUserBusinessInfo,
  getUserBusinessInfo,
} from "../../../firebase/authService";
import "./EstimatedRevenue.css";

const REVENUE_TIERS = [
  { id: "under_100k", title: "Less than $100K" },
  { id: "100k_250k", title: "$100K – $250K" },
  { id: "250k_1m", title: "$250K – $1M" },
  { id: "1m_5m", title: "$1M – $5M" },
  { id: "5m_25m", title: "$5M – $25M+" },
  {
    id: "not_sure",
    title: "Not sure yet",
    subtitle: "If you’re a new business, or don’t know right now",
  },
];

export default class EstimatedRevenue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTierId: null,
      currentUser: null,
      checkingAuth: true,
      loading: false,
      redirectToSignIn: false,
      redirectToNext: false,
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
        if (info && info.estimatedRevenue) {
          this.setState({ selectedTierId: info.estimatedRevenue.id || null });
        }
      } catch (err) {
        console.warn("Could not load business revenue info:", err);
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  handleSelectTier = async (tier) => {
    if (this.state.loading) return;

    this.setState({ selectedTierId: tier.id, loading: true });

    try {
      await saveUserBusinessInfo({
        estimatedRevenue: {
          id: tier.id,
          title: tier.title,
        },
      });
      // Short delay for subtle tactile transition
      setTimeout(() => {
        this.setState({ loading: false, redirectToNext: true });
      }, 150);
    } catch (err) {
      console.error("Save revenue tier error:", err);
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      selectedTierId,
      checkingAuth,
      redirectToSignIn,
      redirectToNext,
    } = this.state;

    if (redirectToSignIn) {
      return <Navigate to="/signin" replace />;
    }

    if (redirectToNext) {
      return <Navigate to="/signup/square-banking" replace />;
    }

    if (checkingAuth) {
      return (
        <div className="estimated-revenue-page" style={{ justifyContent: "center" }}>
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      );
    }

    return (
      <div className="estimated-revenue-page">
        <main className="estimated-revenue-container">
          <h1 className="revenue-title">What’s your annual revenue?</h1>
          <p className="revenue-description">
            This helps us provide the best solutions for your business.
          </p>

          <div className="revenue-options-list">
            {REVENUE_TIERS.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  className={`revenue-option-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => this.handleSelectTier(tier)}
                >
                  <span className="revenue-option-title">{tier.title}</span>
                  {tier.subtitle && (
                    <span className="revenue-option-subtitle">{tier.subtitle}</span>
                  )}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }
}
