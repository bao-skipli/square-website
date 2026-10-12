import React, { PureComponent } from "react";

export default class SignInShowcase extends PureComponent {
  render() {
    const {
      viewportRef,
      translateY,
      isTransitioning,
      totalItems,
      globalIndex,
      onItemClick,
      nextItem,
      activeItem,
      tellMeMore,
      onTellMeMoreChange,
    } = this.props;

    return (
      <div className="signin-right-col">
        <div className="signin-showcase-container">
          <div className="signin-dark-card">
            <div className="signin-ticker-viewport" ref={viewportRef}>
              <div className="signin-ticker-fade-top" />
              <div className="signin-ticker-fade-bottom" />

              <div
                className="signin-ticker-track"
                style={{
                  transform: `translateY(${translateY}px)`,
                  transition: isTransitioning
                    ? "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)"
                    : "none",
                }}
              >
                {totalItems.map((item, idx) => {
                  const isActive = idx === globalIndex;
                  return (
                    <div
                      key={idx}
                      className={`signin-ticker-item ${
                        isActive ? "is-active" : "is-inactive"
                      }`}
                      onClick={() => onItemClick(idx)}
                    >
                      {item.text}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="signin-preview-viewport">
              <div className="signin-card-preview-peek">
                <img src={nextItem.image} alt="" loading="lazy" />
              </div>

              <div className="signin-card-preview" key={activeItem.image}>
                <img
                  src={activeItem.image}
                  alt={activeItem.text}
                  className="signin-card-img"
                />
              </div>
            </div>
          </div>

          <div className="signin-promo-section">
            <h2 className="signin-promo-title">
              See what's possible with Square Plus
            </h2>
            <p className="signin-promo-desc">
              More tools, lower processing fees, and features built for growing businesses.
            </p>

            <label className="signin-checkbox-label">
              <input
                type="checkbox"
                className="signin-checkbox-input"
                checked={tellMeMore}
                onChange={onTellMeMoreChange}
              />
              <span className="signin-custom-checkbox">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <span className="signin-checkbox-text">
                Tell me more after sign in
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  }
}
