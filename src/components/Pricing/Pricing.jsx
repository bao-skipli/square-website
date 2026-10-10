import React, { Component } from "react";
import SplitText from "../common/SplitText/SplitText";
import styles from "./Pricing.module.css";

const pricingPlans = [
  {
    id: "free",
    name: "Free",
    badge: null,
    description: "Sell in person, online, and over the phone with essential POS tools.",
    price: "$0",
    location: "per location",
    buttonText: "Get started",
    buttonVariant: "white",
    buttonWidth: "115px",
    link: "#get-started",
  },
  {
    id: "plus",
    name: "Plus",
    badge: "BEST VALUE",
    description: "Advanced features built for complex operations and team management.",
    price: "$89/mo.",
    location: "per location",
    buttonText: "Try free for 30 days",
    buttonVariant: "blue",
    buttonWidth: "165px",
    link: "#try-plus",
  },
  {
    id: "premium",
    name: "Premium",
    badge: null,
    description: "Custom rates, dedicated account support, and enterprise tooling.",
    price: "$149/mo.",
    location: "per location",
    buttonText: "Try free for 30 days",
    buttonVariant: "white",
    buttonWidth: "165px",
    link: "#try-premium",
  },
];

export default class Pricing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
    };
    this.wrapperRef = React.createRef();
    this.observer = null;
  }

  componentDidMount() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.setState({ isVisible: true });
          if (this.observer) this.observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (this.wrapperRef.current) {
      this.observer.observe(this.wrapperRef.current);
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  render() {
    const { isVisible } = this.state;

    return (
      <div className={styles["pricing-section-container"]}>
        <section
          className={styles["pricing-section"]}
          id="pricing"
          aria-label="Pricing"
        >
          <div className={styles["pricing-header"]}>
            <div className={styles["pricing-eyebrow"]}>
              <SplitText start={10} end={40}>
                PRICING
              </SplitText>
            </div>

            <h2 className={styles["pricing-title"]}>
              <SplitText start={10} end={40}>
                Run your entire business with one plan
              </SplitText>
            </h2>
          </div>

          <div
            ref={this.wrapperRef}
            className={`${styles["pricing-animated-wrapper"]} ${
              isVisible ? styles["is-visible"] : ""
            }`.trim()}
          >
            <p className={styles["pricing-subtitle"]}>
              No hidden fees or locked-in contracts. Cancel or switch plans anytime.
            </p>

            <div className={styles["pricing-grid"]}>
              {pricingPlans.map((plan) => (
                <article key={plan.id} className={styles["pricing-col"]}>
                  <div className={styles["pricing-col-top"]}>
                    <div className={styles["pricing-plan-header"]}>
                      <h3 className={styles["pricing-plan-title"]}>{plan.name}</h3>
                      {plan.badge && (
                        <span className={styles["pricing-badge"]}>
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <p className={styles["pricing-plan-desc"]}>
                      {plan.description}
                    </p>

                    <div className={styles["pricing-col-divider"]} />
                  </div>

                  <div className={styles["pricing-col-bottom"]}>
                    <div className={styles["pricing-price-row"]}>
                      <div className={styles["pricing-price-value"]}>
                        {plan.price}
                      </div>
                    </div>

                    <div className={styles["pricing-location-text"]}>
                      {plan.location}
                    </div>

                    <a
                      href={plan.link}
                      className={`${styles["pricing-btn"]} ${
                        plan.buttonVariant === "blue"
                          ? styles["pricing-btn-blue"]
                          : styles["pricing-btn-white"]
                      }`}
                      style={{ width: plan.buttonWidth }}
                    >
                      {plan.buttonText}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }
}
