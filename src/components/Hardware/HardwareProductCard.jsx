import React, { Component } from "react";
import styles from "./HardwareProductCard.module.css";

export default class HardwareProductCard extends Component {
  constructor(props) {
    super(props);
    this.videoRef = React.createRef();
  }

  componentDidMount() {
    this.updateVideoPlayState();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isActive !== this.props.isActive) {
      this.updateVideoPlayState();
    }
  }

  updateVideoPlayState = () => {
    const video = this.videoRef.current;
    if (!video) return;

    if (this.props.isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  render() {
    const { product, isActive, onMouseEnter, innerRef } = this.props;

    return (
      <article
        ref={innerRef}
        className={`${styles["hardware-product-card"]} ${
          isActive ? styles["is-active"] : ""
        }`.trim()}
        onMouseEnter={onMouseEnter}
      >
        <div className={styles["hardware-product-media"]}>
          <img
            src={product.image}
            alt={product.title}
            className={`${styles["hardware-product-image"]} ${
              isActive ? styles["is-hidden"] : ""
            }`.trim()}
          />

          <video
            ref={this.videoRef}
            className={`${styles["hardware-product-video"]} ${
              isActive ? styles["is-visible"] : ""
            }`.trim()}
            src={product.video}
            muted
            loop
            playsInline
          />

          <div className={styles["hardware-product-overlay"]} />

          <div className={styles["hardware-product-content"]}>
            <h3 className={styles["hardware-product-title-wrapper"]}>
              <button
                type="button"
                className={styles["hardware-product-title-btn"]}
                aria-label={`Select ${product.title}`}
              >
                {product.title}
              </button>
            </h3>

            <p className={styles["hardware-product-desc"]}>
              {product.description}
            </p>

            <div className={styles["hardware-product-actions"]}>
              <span className={styles["hardware-product-price"]}>
                {product.price}
              </span>
              <a
                href="#shop"
                className={styles["hardware-product-shop-btn"]}
              >
                Shop
              </a>
            </div>
          </div>
        </div>
      </article>
    );
  }
}
