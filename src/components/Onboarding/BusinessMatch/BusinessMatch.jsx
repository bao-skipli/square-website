import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import {
  subscribeAuth,
  saveUserBusinessInfo,
  getUserBusinessInfo,
} from "../../../firebase/authService";
import "./BusinessMatch.css";

const SAMPLE_ADDRESSES = [
  { primary: "Baoy Ave", secondary: "Port Charlotte, FL, USA" },
  { primary: "Boabab Circle", secondary: "Holladay, UT, USA" },
  { primary: "Boardwalk", secondary: "Point Pleasant Beach, NJ, USA" },
  { primary: "Baorwater Way", secondary: "San Antonio, TX, USA" },
  { primary: "Baobab Wy", secondary: "Crosby, TX, USA" },
  { primary: "1455 Market St", secondary: "San Francisco, CA, USA" },
  { primary: "100 Broadway", secondary: "New York, NY, USA" },
  { primary: "500 Elm Street", secondary: "Dallas, TX, USA" },
  { primary: "220 Michigan Ave", secondary: "Chicago, IL, USA" },
];

export default class BusinessMatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessName: "",
      businessAddress: "",
      noPermanentAddress: false,
      showAddressDropdown: false,
      currentUser: null,
      checkingAuth: true,
      loading: false,
      redirectToSignIn: false,
      redirectToNext: false,
    };

    this.dropdownRef = React.createRef();
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
          this.setState({
            businessName: info.businessName || "",
            businessAddress: info.businessAddress || "",
            noPermanentAddress: !!info.noPermanentAddress,
          });
        }
      } catch (err) {
        console.warn("Could not load initial business info:", err);
      }
    });

    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = (e) => {
    if (this.dropdownRef.current && !this.dropdownRef.current.contains(e.target)) {
      this.setState({ showAddressDropdown: false });
    }
  };

  handleNameChange = (e) => {
    this.setState({ businessName: e.target.value });
  };

  handleAddressChange = (e) => {
    this.setState({
      businessAddress: e.target.value,
      showAddressDropdown: true,
    });
  };

  handleAddressSelect = (item) => {
    const fullAddress = `${item.primary}, ${item.secondary}`;
    this.setState({
      businessAddress: fullAddress,
      showAddressDropdown: false,
    });
  };

  handleCheckboxToggle = (e) => {
    const checked = e.target.checked;
    this.setState({
      noPermanentAddress: checked,
      showAddressDropdown: false,
      businessAddress: checked ? "" : this.state.businessAddress,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { businessName, businessAddress, noPermanentAddress, loading } = this.state;
    if (!businessName.trim() || loading) return;

    this.setState({ loading: true });
    try {
      await saveUserBusinessInfo({
        businessName: businessName.trim(),
        businessAddress: noPermanentAddress ? "No permanent physical address" : businessAddress.trim(),
        noPermanentAddress,
      });
      this.setState({ loading: false, redirectToNext: true });
    } catch (err) {
      console.error("Save business info error:", err);
      this.setState({ loading: false });
    }
  };

  getFilteredAddresses = () => {
    const query = this.state.businessAddress.trim().toLowerCase();
    if (!query) {
      return SAMPLE_ADDRESSES.slice(0, 5);
    }
    const filtered = SAMPLE_ADDRESSES.filter(
      (item) =>
        item.primary.toLowerCase().includes(query) ||
        item.secondary.toLowerCase().includes(query)
    );
    return filtered.length > 0 ? filtered : SAMPLE_ADDRESSES.slice(0, 3);
  };

  render() {
    const {
      businessName,
      businessAddress,
      noPermanentAddress,
      showAddressDropdown,
      checkingAuth,
      loading,
      redirectToSignIn,
      redirectToNext,
    } = this.state;

    if (redirectToSignIn) {
      return <Navigate to="/signin" replace />;
    }

    if (redirectToNext) {
      return <Navigate to="/signup/business-mcc-selection" replace />;
    }

    if (checkingAuth) {
      return (
        <div className="business-match-page" style={{ justifyContent: "center" }}>
          <p style={{ color: "#666" }}>Loading...</p>
        </div>
      );
    }

    const canSubmit = businessName.trim().length > 0;
    const addressSuggestions = this.getFilteredAddresses();

    return (
      <div className="business-match-page">
        <main className="business-match-container">
          <h1 className="business-match-title">Tell us about your business</h1>
          <p className="business-match-description">
            This is what we will use on your emails, receipts, and messages to customers. We
            will also use this to gather information on your business from publicly available
            online sources.
          </p>

          <form className="business-match-form" onSubmit={this.handleSubmit}>
            {/* Business Name Input */}
            <div className="bm-input-group">
              <div className="bm-input-wrapper">
                {businessName && <label className="bm-label">Business name</label>}
                <input
                  type="text"
                  className="bm-input"
                  placeholder="Business name"
                  value={businessName}
                  onChange={this.handleNameChange}
                  autoFocus
                />
              </div>
            </div>

            {/* Business Address Input with Autocomplete */}
            <div className="bm-input-group" ref={this.dropdownRef}>
              <div
                className={`bm-input-wrapper ${
                  noPermanentAddress ? "is-disabled" : ""
                }`}
              >
                {businessAddress && !noPermanentAddress && (
                  <label className="bm-label">Business address</label>
                )}
                <input
                  type="text"
                  className="bm-input"
                  placeholder="Business address"
                  value={businessAddress}
                  onChange={this.handleAddressChange}
                  onFocus={() => {
                    if (!noPermanentAddress) {
                      this.setState({ showAddressDropdown: true });
                    }
                  }}
                  disabled={noPermanentAddress}
                />
              </div>

              {showAddressDropdown && !noPermanentAddress && (
                <div className="bm-address-dropdown">
                  {addressSuggestions.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      className="bm-address-item"
                      onClick={() => this.handleAddressSelect(item)}
                    >
                      <span className="bm-address-primary">{item.primary}</span>
                      <span className="bm-address-secondary">{item.secondary}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Checkbox */}
            <label className="bm-checkbox-row">
              <input
                type="checkbox"
                className="bm-checkbox-input"
                checked={noPermanentAddress}
                onChange={this.handleCheckboxToggle}
              />
              <span className="bm-checkbox-label">
                My business doesn't have a permanent physical address.
              </span>
            </label>

            {/* Action Row */}
            <div className="bm-action-row">
              <button
                type="submit"
                className="bm-next-btn"
                disabled={!canSubmit || loading}
              >
                {loading ? "Saving..." : "Next"}
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }
}
