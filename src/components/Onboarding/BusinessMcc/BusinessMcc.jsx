import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import {
  subscribeAuth,
  saveUserBusinessInfo,
  getUserBusinessInfo,
} from "../../../firebase/authService";
import "./BusinessMcc.css";

const MCC_CATEGORIES = [
  { id: "clothing", title: "Clothing and Accessories", category: "Retail" },
  { id: "events", title: "Events/Festivals", category: "Leisure and Entertainment" },
  { id: "food_truck", title: "Food Truck/Cart", category: "Food and Drink" },
  { id: "taxi", title: "Taxi", category: "Transportation" },
  { id: "specialty_shop", title: "Specialty Shop", category: "Retail" },
  { id: "nail_salon", title: "Nail Salon", category: "Health and Beauty" },
  { id: "bakery", title: "Bakery", category: "Food and Drink" },
  { id: "coffee_shop", title: "Coffee Shop", category: "Food and Drink" },
  { id: "hair_salon", title: "Hair Salon / Barbershop", category: "Health and Beauty" },
  { id: "restaurant", title: "Restaurant / Bar", category: "Food and Drink" },
  { id: "fitness", title: "Fitness / Personal Training", category: "Sports and Recreation" },
  { id: "consulting", title: "Consulting / Professional Services", category: "Professional Services" },
  { id: "photography", title: "Photography", category: "Art and Photography" },
  { id: "home_services", title: "Home Services", category: "Home and Repair" },
];

function SearchIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CheckmarkIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

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
        {/* Top Header with Next button */}
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

          {/* Search Box */}
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

          {/* Category List */}
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
