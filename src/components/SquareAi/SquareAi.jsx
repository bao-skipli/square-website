import React, { Component } from "react";
import SplitText from "../common/SplitText/SplitText";
import styles from "./SquareAi.module.css";

const VIDEO_URL =
  "/1ca286d3-e996-4d1c-a860-fa9af614d544-en-e231a903-d473-49ef-9632-abe0c1331eda-en-SQ-AI-Mockup-Animation-16x9-Hero-img-v2.webm";

export default class SquareAi extends Component {
  static defaultProps = {
    start: 505,
    end: 525,
  };

  constructor(props) {
    super(props);
    this.sectionRef = React.createRef();
    this.mediaRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener("scroll", this.updateScale, { passive: true });
    window.addEventListener("resize", this.updateScale);
    this.updateScale();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.updateScale);
    window.removeEventListener("resize", this.updateScale);
  }

  updateScale = () => {
    if (!this.sectionRef.current || !this.mediaRef.current) return;
    const rect = this.sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const startTrigger = windowHeight * 1.0;
    const endTrigger = windowHeight * 0.35;

    let progress;
    if (rect.top >= startTrigger) {
      progress = 0;
    } else if (rect.top <= endTrigger) {
      progress = 1;
    } else {
      progress = (startTrigger - rect.top) / (startTrigger - endTrigger);
    }
    progress = Math.max(0, Math.min(1, progress));

    const currentScale = 0.75 + progress * 0.25;
    const currentRadius = (1 - progress) * 20;

    this.mediaRef.current.style.transform = `scale(${currentScale.toFixed(4)})`;
    this.mediaRef.current.style.borderRadius = `${currentRadius.toFixed(1)}px`;
  };

  render() {
    return (
      <section
        ref={this.sectionRef}
        className={styles["square-ai-section"]}
        id="square-ai"
        aria-label="Square AI"
      >
        <div
          ref={this.mediaRef}
          className={styles["square-ai-media"]}
          style={{
            transform: "scale(0.75)",
            borderRadius: "20px",
          }}
        >
          <video
            className={styles["square-ai-video"]}
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={VIDEO_URL} type="video/webm" />
          </video>

          <div className={styles["square-ai-overlay"]} />
        </div>

        <div className={styles["square-ai-content"]}>
          <div className={styles["square-ai-content-inner"]}>
            <div className={styles["square-ai-eyebrow"]}>
              <SplitText start={10} end={40}>
                SQUARE AI
              </SplitText>
            </div>

            <h2 className={styles["square-ai-title"]}>
              <SplitText start={10} end={40}>
                Make smart decisions, fast
              </SplitText>
            </h2>

            <div className={styles["square-ai-actions"]}>
              <p className={styles["square-ai-description"]}>
                Ask Square AI anything about your business to get immediate insights.
              </p>

              <div className={styles["square-ai-controls"]}>
                <a
                  href="#learn-more"
                  className={styles["square-ai-link"]}
                >
                  Learn more
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
