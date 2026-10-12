import React, { PureComponent } from "react";
import { SIGNIN_ITEMS } from "@/constants/signInItems";

const ITEM_COUNT = SIGNIN_ITEMS.length;

export default class SignInTicker extends PureComponent {
  render() {
    const {
      globalIndex,
      isTransitioning,
      viewportHeight,
      viewportRef,
    } = this.props;

    const tripleItems = [...SIGNIN_ITEMS, ...SIGNIN_ITEMS, ...SIGNIN_ITEMS];

    return (
      <div className="signin-showcase">
        <div className="signin-showcase-content">
          <div className="signin-ticker-viewport" ref={viewportRef}>
            <div
              className={`signin-ticker-track ${
                isTransitioning ? "has-transition" : "no-transition"
              }`}
              style={{
                transform: `translateY(-${globalIndex * viewportHeight}px)`,
              }}
            >
              {tripleItems.map((item, idx) => {
                const isActive = idx === globalIndex;
                return (
                  <div
                    key={`${item.text}-${idx}`}
                    className={`signin-ticker-item ${isActive ? "is-active" : ""}`}
                    style={{ height: `${viewportHeight}px` }}
                  >
                    <div className="signin-feature-visual">
                      <img
                        src={item.image}
                        alt={item.text}
                        className="signin-feature-img"
                        loading="lazy"
                      />
                    </div>
                    <div className="signin-feature-caption">
                      <h3 className="signin-feature-title">{item.text}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
