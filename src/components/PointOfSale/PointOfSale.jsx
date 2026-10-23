import React, { Component } from "react";
import SplitText from "../common/SplitText/SplitText";
import styles from "./PointOfSale.module.css";

const posItems = [
  {
    id: "take-payments",
    title: "Take payments",
    description:
      "Sell anything in person and online with a point of sale platform that works for whatever you sell.",
    linkText: "Learn more",
    linkUrl: "#take-payments",
    image: "/images/point-of-sale/PD07745_-_cpos_background.avif",
    alt: "Square Point of Sale food order screen with items grid and cart checkout",
  },
  {
    id: "manage-team",
    title: "Manage your team",
    description:
      "Run payroll, schedule shifts, and take care of admin — so your team can focus on performing their best.",
    linkText: "Learn more",
    linkUrl: "#manage-team",
    image: "/images/point-of-sale/PD07745_-_payroll_background.avif",
    alt: "Square Team Management and Payroll in restaurant kitchen",
  },
  {
    id: "grow-customers",
    title: "Grow your customer base",
    description:
      "Set up the right marketing campaigns and loyalty program to welcome new customers and keep them coming back for more.",
    linkText: "Learn more",
    linkUrl: "#grow-customers",
    image: "/images/point-of-sale/PD07745_-_loyalty_background.avif",
    alt: "Square Customer Loyalty and Marketing",
  },
  {
    id: "cash-flow",
    title: "Control your cash flow",
    description:
      "Bring your revenue under one roof. Instantly access your funds, save for future expenses, and get quicker access to loans.",
    linkText: "Learn more",
    linkUrl: "#cash-flow",
    image: "/images/point-of-sale/PD07745_-_banking_background_compressed_v3.avif",
    alt: "Square Banking and Cash Flow Management",
  },
  {
    id: "connect-apps",
    title: "Connect your favorite apps",
    description:
      "Square partners with hundreds of apps so you can manage your entire business without jumping between.",
    linkText: "Learn more",
    linkUrl: "#connect-apps",
    image: "/images/point-of-sale/PD07745_-_apps_background.avif",
    alt: "Square App Marketplace and Integrations",
  },
];

export default class PointOfSale extends Component {
  static defaultProps = {
    start: 280,
    end: 320,
  };

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 0,
    };
  }

  handleTabClick = (index) => {
    this.setState({ activeTab: index });
  };

  render() {
    const { start, end } = this.props;
    const { activeTab } = this.state;

    return (
      <section className={styles["pos-section"]} id="point-of-sale">
        <div className={styles["pos-container"]}>
          <div className={styles["pos-left-column"]}>
            <div className={styles["pos-eyebrow"]}>
              <SplitText start={10} end={50}>
                POINT OF SALE
              </SplitText>
            </div>

            <h2 className={styles["pos-title"]}>
              <SplitText start={10} end={50}>
                See your whole business click into place
              </SplitText>
            </h2>

            <div
              className={styles["pos-accordion-wrapper"]}
              style={{
                "--pos-reveal-start": `${start + 20}vh`,
                "--pos-reveal-end": `${end + 40}vh`,
              }}
            >
              <div className={styles["pos-accordion-list"]}>
                {posItems.map((item, index) => {
                  const isActive = activeTab === index;
                  return (
                    <div
                      key={item.id}
                      className={`${styles["pos-accordion-item"]} ${
                        isActive ? styles["active"] : ""
                      }`.trim()}
                    >
                      <button
                        type="button"
                        className={styles["pos-accordion-header"]}
                        onClick={() => this.handleTabClick(index)}
                        aria-expanded={isActive}
                      >
                        <span className={styles["pos-accordion-title"]}>
                          {item.title}
                        </span>
                        <span
                          className={styles["pos-accordion-icon"]}
                          aria-hidden="true"
                        >
                          {isActive ? (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <line
                                x1="3"
                                y1="9"
                                x2="15"
                                y2="9"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <line
                                x1="9"
                                y1="3"
                                x2="9"
                                y2="15"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                              />
                              <line
                                x1="3"
                                y1="9"
                                x2="15"
                                y2="9"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </span>
                      </button>

                      <div
                        className={`${styles["pos-accordion-body"]} ${
                          isActive ? styles["expanded"] : styles["collapsed"]
                        }`}
                      >
                        <div className={styles["pos-accordion-content"]}>
                          <p className={styles["pos-description"]}>
                            {item.description}
                          </p>
                          <a href={item.linkUrl} className={styles["pos-link"]}>
                            {item.linkText}
                          </a>
                        </div>
                      </div>

                      <div className={styles["pos-divider"]} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles["pos-right-column"]}>
            <div
              className={styles["pos-image-container"]}
              style={{
                "--pos-img-start": `${start}vh`,
                "--pos-img-end": `${end + 40}vh`,
              }}
            >
              {posItems.map((item, index) => {
                const isActive = activeTab === index;
                return (
                  <div
                    key={item.id}
                    className={`${styles["pos-image-slide"]} ${
                      isActive ? styles["active"] : ""
                    }`.trim()}
                  >
                    <img
                      src={item.image}
                      alt={item.alt}
                      className={styles["pos-image-media"]}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }
}
