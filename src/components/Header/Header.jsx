import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { subscribeAuth, logoutUser } from "../../firebase/authService";
import styles from "./Header.module.css";

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

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSticky: false,
      currentUser: null,
    };
    this.unsubscribeAuth = null;
  }

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleScroll);
    this.handleScroll();

    this.unsubscribeAuth = subscribeAuth((user) => {
      this.setState({ currentUser: user });
    });
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleScroll);
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }

  handleScroll = () => {
    const heroEl = document.querySelector('[class*="hero-section"]');
    if (heroEl) {
      const heroHeight = heroEl.offsetHeight;
      const threshold = heroHeight * 0.6;
      this.setState({ isSticky: window.scrollY >= threshold });
    } else {
      const fallbackThreshold = window.innerHeight * 2.4 * 0.6;
      this.setState({ isSticky: window.scrollY >= fallbackThreshold });
    }
  };

  handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  render() {
    const { isSticky, currentUser } = this.state;

    return (
      <>
        <header className={styles["hero-header"]} aria-label="Main navigation">
          <div className={styles["hero-header-left"]}>
            <a href="#" className={styles["logo-link"]} aria-label="Square Home">
              <SquareLogo size={26} color="#ffffff" />
            </a>

            <nav className={styles["hero-nav"]}>
              <a href="#business-types" className={styles["nav-link"]}>
                Business types
              </a>
              <a href="#products" className={styles["nav-link"]}>
                Products
              </a>
              <a href="#hardware" className={styles["nav-link"]}>
                Hardware
              </a>
              <a href="#pricing" className={styles["nav-link"]}>
                Pricing
              </a>
              <a href="#whats-new" className={styles["nav-link"]}>
                What's new
              </a>
            </nav>
          </div>

          <div className={styles["hero-header-right"]}>
            {currentUser ? (
              <>
                <span className={styles["header-text-btn"]} style={{ opacity: 0.9 }}>
                  {currentUser.email ? currentUser.email.split("@")[0] : "Account"}
                </span>
                <button
                  type="button"
                  onClick={this.handleLogout}
                  className={styles["header-text-btn"]}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/signin" className={styles["header-text-btn"]}>
                Sign in
              </Link>
            )}

            <button type="button" className={styles["header-text-btn"]}>
              Support
            </button>
            <button
              type="button"
              className={styles["header-icon-btn"]}
              aria-label="Search"
            >
              <Search size={19} strokeWidth={2} />
            </button>
            <button
              type="button"
              className={styles["header-icon-btn"]}
              aria-label="Shopping Cart"
            >
              <ShoppingCart size={19} strokeWidth={2} />
            </button>
          </div>
        </header>

        <header
          className={`${styles["sticky-header"]} ${
            isSticky ? styles["is-visible"] : ""
          }`}
          aria-label="Sticky navigation"
        >
          <div className={styles["sticky-header-left"]}>
            <a href="#" className={styles["sticky-logo-link"]} aria-label="Square Home">
              <SquareLogo size={26} color="#000000" />
            </a>
          </div>

          <div className={styles["sticky-header-right"]}>
            <button type="button" className={styles["btn-contact-sales"]}>
              Contact sales
            </button>
            {currentUser ? (
              <button
                type="button"
                onClick={this.handleLogout}
                className={styles["btn-get-started"]}
              >
                Sign out
              </button>
            ) : (
              <Link to="/signup" className={styles["btn-get-started"]}>
                Get started
              </Link>
            )}
          </div>
        </header>
      </>
    );
  }
}
