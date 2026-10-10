import React, { Component } from "react";
import SplitText from "../../common/SplitText/SplitText";
import "./MakeYourNextMove.css";

const IMAGES = [
  "https://images.ctfassets.net/2d5q1td6cyxq/2gJQ4VoAVwozevJEstfWum/292583cf5bd1152015d7b3f38c288be6/PD07743_-_man_carrying_pizzas.png?fm=avif&q=85&fit=fill&w=450",
  "https://images.ctfassets.net/2d5q1td6cyxq/46Kvvgf7rOBInftyvrCX13/90db0c9791023b5a3b44dd9d69b75709/PD07743_-_mechanic.png?fm=avif&q=85&fit=fill&w=400",
  "https://images.ctfassets.net/2d5q1td6cyxq/6m5BZ16kSmXvb0qxvHzugu/2c791d100d1c75a223468cf66b30968c/PD07743_-_USEN_register_pizza_shop.png?fm=avif&q=85&fit=fill&w=414",
  "https://images.ctfassets.net/2d5q1td6cyxq/6UtixBNNvdm51lv5hRRdj6/a554c7fd5ff026f5cf3e6e1a1e6b5fe3/PD07743_-_USEN_T3_phodega.png?fm=avif&q=85&fit=fill&w=480",
  "https://images.ctfassets.net/2d5q1td6cyxq/2ltlQY925uiWeSDy3aaFuV/f02a68c3b7ab9f960225e78ef9c3dbe7/PD07743_-_flower_person.png?fm=avif&q=85&fit=fill&w=464",
  "https://images.ctfassets.net/2d5q1td6cyxq/2l0Tud71FFtm4uWesUlW5R/f972dd0cfe1ec7d0e88431931ad0b1ca/PD07743_-_mush.png?fm=avif&q=85&fit=fill&w=604",
  "https://images.ctfassets.net/2d5q1td6cyxq/4J7X3ahr4KMdCFd7DfbmWb/e4e58d88a458857ecf5bcad24cb95b10/PD07743_-_hair_clip.png?fm=avif&q=85&fit=fill&w=480",
  "https://images.ctfassets.net/2d5q1td6cyxq/3IeOpuFwVkkbfJ8uvHDC86/f05c39a053a68283cc165e4a2239f6f0/PD07743_-_chef.png?fm=avif&q=85&fit=fill&w=398",
  "https://images.ctfassets.net/2d5q1td6cyxq/1ZogQZxHk2Uhssf8lV0WJ6/9b3001bf34f3de7057b6e06a0b4ef2da/placeholder.png?fm=avif&q=85&fit=fill&w=178",
];

export default class MakeYourNextMove extends Component {
  static defaultProps = {
    start: 660,
    end: 685,
  };

  constructor(props) {
    super(props);
    this.state = {
      currentImageIndex: 1,
      isCardBgHidden: false,
    };

    this.sectionRef = React.createRef();
    this.trailRef = React.createRef();
    this.intervalId = null;

    this.lastPos = { x: null, y: null };
    this.trailImgIndex = 0;
    this.zIndexCounter = 1;
    this.isCardBgHiddenRef = false;
    this.leaveTimeout = null;
  }

  componentDidMount() {
    this.startCycleTimer();
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  componentWillUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.leaveTimeout) clearTimeout(this.leaveTimeout);
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  }

  handleVisibilityChange = () => {
    if (document.hidden) {
      if (this.intervalId) clearInterval(this.intervalId);
    } else {
      this.startCycleTimer();
    }
  };

  startCycleTimer = () => {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.setState((prev) => ({
        currentImageIndex: (prev.currentImageIndex + 1) % IMAGES.length,
      }));
    }, 3000);
  };

  handleMouseEnter = () => {
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }
    if (!this.isCardBgHiddenRef) {
      this.isCardBgHiddenRef = true;
      this.setState({ isCardBgHidden: true });
    }
  };

  handleMouseMove = (e) => {
    if (!this.isCardBgHiddenRef) {
      this.isCardBgHiddenRef = true;
      this.setState({ isCardBgHidden: true });
    }
    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = null;
    }

    if (
      window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    if (!this.sectionRef.current || !this.trailRef.current) return;

    const rect = this.sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.lastPos.x === null || this.lastPos.y === null) {
      this.lastPos = { x, y };
      return;
    }

    const dx = x - this.lastPos.x;
    const dy = y - this.lastPos.y;
    const distance = Math.hypot(dx, dy);

    const isTablet = window.innerWidth <= 1024;
    const threshold = isTablet ? 80 : 100;

    if (distance >= threshold) {
      this.lastPos = { x, y };

      const imgSrc = IMAGES[this.trailImgIndex % IMAGES.length];
      this.trailImgIndex += 1;

      const trailItem = document.createElement("div");
      trailItem.className = "nm-trail-item";
      trailItem.style.left = `${x}px`;
      trailItem.style.top = `${y}px`;
      trailItem.style.zIndex = `${this.zIndexCounter++}`;

      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = "";
      img.className = "nm-trail-img";
      img.loading = "eager";

      trailItem.appendChild(img);
      this.trailRef.current.appendChild(trailItem);

      trailItem.addEventListener(
        "animationend",
        () => {
          trailItem.remove();
        },
        { once: true }
      );

      setTimeout(() => {
        if (trailItem && trailItem.parentNode) {
          trailItem.remove();
        }
      }, 1300);
    }
  };

  handleMouseLeave = () => {
    this.lastPos = { x: null, y: null };

    if (this.leaveTimeout) {
      clearTimeout(this.leaveTimeout);
    }
    this.leaveTimeout = setTimeout(() => {
      this.isCardBgHiddenRef = false;
      this.setState({ isCardBgHidden: false });
    }, 1000);
  };

  render() {
    const { start, end } = this.props;
    const { currentImageIndex, isCardBgHidden } = this.state;

    return (
      <section
        ref={this.sectionRef}
        className="next-move-section"
        id="make-your-next-move"
        aria-label="Make your next move"
        onMouseEnter={this.handleMouseEnter}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
      >
        <div ref={this.trailRef} className="next-move-trail-container" aria-hidden="true" />

        <div className={`next-move-card ${isCardBgHidden ? "is-bg-hidden" : ""}`}>
          <div
            className={`next-move-card-bg-layer ${isCardBgHidden ? "is-hidden" : ""}`}
            aria-hidden="true"
          >
            {IMAGES.map((imgUrl, idx) => (
              <img
                key={`card-bg-${idx}`}
                src={imgUrl}
                alt=""
                className={`next-move-card-bg-img ${
                  idx === currentImageIndex ? "is-active" : ""
                }`}
              />
            ))}
          </div>

          <div
            className={`next-move-card-overlay ${isCardBgHidden ? "is-hidden" : ""}`}
            aria-hidden="true"
          />

          <div className="next-move-content">
            <h2 className="next-move-heading">
              <span className="next-move-line">
                <SplitText start={start} end={end}>
                  Make your
                </SplitText>
              </span>
              <span className="next-move-line">
                <SplitText start={start + 5} end={end + 5}>
                  next move
                </SplitText>
              </span>
            </h2>

            <div className="next-move-buttons">
              <a
                href="https://app.squareup.com/signup/en-US"
                className="next-move-btn next-move-btn-start"
              >
                Get started
              </a>
              <a
                href="/sales/contact"
                className="next-move-btn next-move-btn-contact"
              >
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
