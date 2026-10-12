import React, { PureComponent } from "react";

const VIDEO_SRC = "/images/signup/30a093e0-ab59-4745-b05a-179535ceb901-en-PD06867_-_auto_video_15_cut_mobile.webm";
const LOGOS_SRC = "/images/signup/us-logos.72b97247.webp";

export default class SignUpShowcase extends PureComponent {
  render() {
    return (
      <div className="signup-right-col">
        <div className="signup-showcase-card">
          <video
            className="signup-showcase-video"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={VIDEO_SRC} type="video/webm" />
          </video>

          <div className="signup-showcase-overlay" />

          <div className="signup-showcase-content">
            <h2 className="signup-showcase-title">
              Join the 4 million+ businesses
              <br />
              running with Square.
            </h2>

            <div className="signup-showcase-logos-wrapper">
              <img
                src={LOGOS_SRC}
                alt="Businesses running with Square"
                className="signup-showcase-logos"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
