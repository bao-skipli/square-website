import React, { Component } from "react";
import "./Newsletter.css";

export default class Newsletter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if (this.state.email.trim()) {
      this.setState({ email: "" });
    }
  };

  handleEmailChange = (e) => {
    this.setState({ email: e.target.value });
  };

  render() {
    const { email } = this.state;

    return (
      <section className="newsletter-section" aria-label="Square updates subscription">
        <div className="newsletter-container">
          <h2 className="newsletter-title">Get the latest updates from Square</h2>
          <form className="newsletter-form" onSubmit={this.handleSubmit}>
            <div className="newsletter-input-wrapper">
              <input
                type="email"
                className="newsletter-input"
                placeholder="Email address"
                value={email}
                onChange={this.handleEmailChange}
                aria-label="Email address"
              />
            </div>
            <button type="submit" className="newsletter-submit-btn">
              Submit
            </button>
          </form>
          <p className="newsletter-disclaimer">
            *This information may be transcribed, used, and stored by third parties in accordance with our{" "}
            <a href="#privacy">Privacy Policy</a>.
          </p>
        </div>
      </section>
    );
  }
}
