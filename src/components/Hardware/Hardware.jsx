import React, { Component } from "react";
import HardwareProductSlider from "./HardwareProductSlider";
import SplitText from "../common/SplitText/SplitText";
import styles from "./Hardware.module.css";

export default class Hardware extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: null,
    };
  }

  setActiveIndex = (activeIndex) => {
    this.setState({ activeIndex });
  };

  render() {
    const { activeIndex } = this.state;

    return (
      <section className={styles["hardware-section"]}>
        <div className={styles["hardware-section-inner"]}>
          <div className={styles["hardware-section-eyebrow"]}>
            <SplitText start={3} end={35}>
              Hardware
            </SplitText>
          </div>
          <div className={styles["hardware-section-title"]}>
            <SplitText start={3} end={35}>
              Smooth checkout, every time
            </SplitText>
          </div>

          <HardwareProductSlider
            activeIndex={activeIndex}
            setActiveIndex={this.setActiveIndex}
          />

          <div className={styles["hardware-section-actions"]}>
            <a href="#shop-all" className={styles["btn-shop-all"]}>
              Shop all hardware
            </a>
            <a href="#compare" className={styles["btn-compare"]}>
              Compare hardware
            </a>
          </div>
        </div>
      </section>
    );
  }
}
