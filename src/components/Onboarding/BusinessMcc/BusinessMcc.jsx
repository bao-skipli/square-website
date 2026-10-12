import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import {
  subscribeAuth,
  saveUserBusinessInfo,
  getUserBusinessInfo,
} from "@/firebase/authService";
import { MCC_CATEGORIES } from "@/constants/mccCategories";
import { SearchIcon, CheckmarkIcon } from "@/components/ui/Icon";
import "./BusinessMcc.css";

export default class BusinessMcc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      selectedCategory: null,
      businessName: "",
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
        if (info) {
          let selected = null;
          if (info.mcc && info.mcc.id) {
            selected = MCC_CATEGORIES.find((c) => c.id === info.mcc.id) || null;
          }
          this.setState({
            businessName: info.businessName || "your business",
            selectedCategory: selected,
          });
        }
      } catch (err) {
        console.warn("Could not load business info:", err);
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  handleSelectCategory = (category) => {
    this.setState({ selectedCategory: category });
  };

  handleSubmit = async () => {
    const { selectedCategory, loading } = this.state;
    if (!selectedCategory || loading) return;

    this.setState({ loading: true });
    try {
      await saveUserBusinessInfo({
        mcc: {
          id: selectedCategory.id,
          title: selectedCategory.title,
          category: selectedCategory.category,
        },
      });
      this.setState({ loading: false, redirectToNext: true });
    } catch (err) {
      console.error("Save MCC error:", err);
      this.setState({ loading: false });
    }
  };

  getFilteredCategories = () => {
    const query = this.state.searchQuery.trim().toLowerCase();
    if (!query) {
      return MCC_CATEGORIES;
    }

    return MCC_CATEGORIES.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  };

  render() {
    const {
      searchQuery,
      selectedCategory,
      businessName,
      checkingAuth,
      loading,
      redirectToSignIn,
      redirectToNext,
    } = this.state;

    if (redirectToSignIn) {
      return <Navigate to="/signin" replace />;
    }

    if (redirectToNext) {
      return <Navigate to="/signup/estimated-annual-revenue" replace />;
    }

    if (checkingAuth) {
      return (
        <div className="business-mcc-page" style={{ justifyContent: "center", alignItems: "center" }}>
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      );
    }

    const filteredList = this.getFilteredCategories();
    const displayName = businessName || "your business";

    return (
      <div className="business-mcc-page">
        <header className="mcc-header">
          <button
            type="button"
            className="mcc-top-next-btn"
            disabled={!selectedCategory || loading}
            onClick={this.handleSubmit}
          >
            {loading ? "Saving..." : "Next"}
          </button>
        </header>

        <main className="business-mcc-container">
          <h1 className="mcc-title">
            What kind of business best describes {displayName}?
          </h1>
          <p className="mcc-description">
            Search or select your business type to help us categorize most of what you sell.
            We'll personalize Square to fit your business needs.
          </p>

          <div className="mcc-search-box">
            <span className="mcc-search-icon">
              <SearchIcon size={18} />
            </span>
            <input
              type="text"
              className="mcc-search-input"
              placeholder="Search business categories"
              value={searchQuery}
              onChange={this.handleSearchChange}
              autoFocus
            />
          </div>

          <div className="mcc-list-card">
            {filteredList.length === 0 ? (
              <div className="mcc-empty">
                No matching business categories found for &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredList.map((item) => {
                const isSelected = selectedCategory && selectedCategory.id === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`mcc-list-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => this.handleSelectCategory(item)}
                  >
                    <div className="mcc-item-text">
                      <span className="mcc-item-primary">{item.title}</span>
                      <span className="mcc-item-secondary">{item.category}</span>
                    </div>
                    {isSelected && (
                      <span className="mcc-check-icon">
                        <CheckmarkIcon size={18} />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </main>
      </div>
    );
  }
}
