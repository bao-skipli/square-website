import React, { Component } from "react";
import styles from "./SplitText.module.css";

export default class SplitText extends Component {
  static defaultProps = {
    className: "",
    start: 0,
    end: 40,
    stagger: 6,
  };

  render() {
    const {
      children,
      className,
      start,
      end,
      stagger,
      timeline,
      rangeName,
    } = this.props;

    const words = typeof children === "string" ? children.trim().split(/\s+/) : [];

    const vars = {
      "--start": `${start}%`,
      "--end": `${end}%`,
      "--stagger": `${stagger}%`,
    };
    if (timeline) vars["--tl"] = timeline;
    if (rangeName) vars["--rn"] = rangeName;

    return (
      <span className={`${styles["scroll-reveal-text"]} ${className}`.trim()} style={vars}>
        {words.map((word, index) => (
          <span
            className={styles["scroll-reveal-mask"]}
            key={`${word}-${index}`}
          >
            <span
              className={styles["scroll-reveal-word"]}
              style={{ "--index": index }}
            >
              {word}
            </span>
          </span>
        ))}
      </span>
    );
  }
}
