import { useState } from "react";

export function ImageSkeleton({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  aspectRatio,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src) {
    return (
      <div
        className={`sf-skeleton-shimmer ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`sf-img-skeleton-wrap ${wrapperClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && !error && (
        <div className={`sf-skeleton-shimmer sf-skeleton-img-fill ${className}`} />
      )}
      {error ? (
        <div className="sf-img-placeholder" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      ) : (
        <img
          src={src}
          alt={alt || "Item"}
          className={`sf-img ${className} ${loaded ? "is-loaded" : "is-loading"}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <header className="sf-header sf-header-wrapper sf-header--skeleton" aria-label="Loading header">
      <div className="sf-header-inner">
        <div className="sf-header-left">
          <div className="sf-skeleton-hamburger sf-skeleton-shimmer" />
        </div>

        <div className="sf-header-center">
          <div className="sf-skeleton-brand">
            <div className="sf-skeleton-brand-mark sf-skeleton-shimmer" />
            <div className="sf-skeleton-brand-title sf-skeleton-shimmer" />
          </div>
        </div>

        <div className="sf-header-right">
          <div className="sf-skeleton-pill sf-skeleton-shimmer" />
          <div className="sf-skeleton-pill sf-skeleton-shimmer" />
        </div>
      </div>
    </header>
  );
}

export function CategoryTabsSkeleton() {
  const tabWidths = [88, 120, 96, 134, 104, 112];

  return (
    <nav className="sf-category-tabs-wrapper sf-category-tabs-wrapper--skeleton" aria-label="Loading categories">
      <div className="sf-category-tabs-container">
        {tabWidths.map((width, idx) => (
          <div
            key={idx}
            className={`sf-category-tab sf-category-tab--skeleton ${idx === 0 ? "sf-category-tab--skeleton-active" : ""}`}
          >
            <span
              className="sf-skeleton-tab-label sf-skeleton-shimmer"
              style={{ width: `${width}px` }}
            />
          </div>
        ))}
      </div>
    </nav>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="sf-item-card sf-item-card--skeleton">
      <div className="sf-item-card__content">
        <div className="sf-item-card__text-group">
          <div
            className="sf-skeleton-line sf-skeleton-shimmer"
            style={{ width: "68%", height: "18px", borderRadius: "4px", marginBottom: "8px" }}
          />
          <div
            className="sf-skeleton-line sf-skeleton-shimmer"
            style={{ width: "92%", height: "13px", borderRadius: "4px", marginBottom: "6px" }}
          />
          <div
            className="sf-skeleton-line sf-skeleton-shimmer"
            style={{ width: "55%", height: "13px", borderRadius: "4px" }}
          />
        </div>

        <div className="sf-item-card__footer">
          <div className="sf-item-card__price-row">
            <div
              className="sf-skeleton-line sf-skeleton-shimmer"
              style={{ width: "72px", height: "16px", borderRadius: "4px" }}
            />
          </div>
        </div>
      </div>

      <div className="sf-item-card__image-wrapper">
        <div className="sf-skeleton-card-img sf-skeleton-shimmer" />
      </div>
    </div>
  );
}

export function MenuSkeleton() {
  return (
    <div className="sf-menu-skeleton-wrapper">
      {[1, 2].map((sectionIndex) => (
        <section key={sectionIndex} className="sf-menu-section sf-menu-section--skeleton">
          <div className="sf-menu-section__header">
            <div
              className="sf-skeleton-section-title sf-skeleton-shimmer"
              style={{ width: sectionIndex === 1 ? "190px" : "150px" }}
            />
          </div>

          <div className="sf-menu-section__grid">
            {[1, 2, 3, 4].map((cardIndex) => (
              <ItemCardSkeleton key={cardIndex} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function BannerSkeleton({ className = "" }) {
  return (
    <div className={`sf-banner sf-banner--skeleton ${className}`}>
      <div className="sf-banner__content">
        <div
          className="sf-skeleton-line sf-skeleton-shimmer"
          style={{ width: "45%", height: "24px", borderRadius: "6px", marginBottom: "12px" }}
        />
        <div
          className="sf-skeleton-line sf-skeleton-shimmer"
          style={{ width: "70%", height: "14px", borderRadius: "4px", marginBottom: "8px" }}
        />
        <div
          className="sf-skeleton-line sf-skeleton-shimmer"
          style={{ width: "50%", height: "14px", borderRadius: "4px" }}
        />
      </div>
      <div className="sf-banner__media">
        <div
          className="sf-skeleton-card-img sf-skeleton-shimmer"
          style={{ width: "100%", height: "100%", borderRadius: "12px" }}
        />
      </div>
    </div>
  );
}

export function ItemModalSkeleton({ onClose }) {
  return (
    <div className="sf-modal-overlay" role="dialog" aria-modal="true" aria-label="Loading details">
      <div className="sf-modal-card sf-modal-card--skeleton">
        {onClose && (
          <button
            type="button"
            className="sf-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="sf-modal-body">
          <div className="sf-modal-col-left">
            <div className="sf-modal-image-wrapper">
              <div className="sf-skeleton-shimmer sf-modal-img-skeleton" />
            </div>

            <p className="sf-modal-illustration-notice" style={{ visibility: "hidden" }}>
              * Image shown is for illustration purposes only
            </p>

            <div className="sf-modal-item-info">
              <div className="sf-modal-title-row">
                <div
                  className="sf-skeleton-line sf-skeleton-shimmer"
                  style={{ width: "70%", height: "28px", borderRadius: "6px", marginBottom: "8px" }}
                />
              </div>

              <div
                className="sf-skeleton-line sf-skeleton-shimmer"
                style={{ width: "95%", height: "14px", borderRadius: "4px", marginBottom: "6px" }}
              />
              <div
                className="sf-skeleton-line sf-skeleton-shimmer"
                style={{ width: "60%", height: "14px", borderRadius: "4px" }}
              />
            </div>
          </div>

          <div className="sf-modal-col-right">
            <div className="sf-modal-modifiers-scroll">
              {[1, 2].map((blockIdx) => (
                <div key={blockIdx} className="sf-mod-set-block">
                  <div className="sf-mod-set-header">
                    <div
                      className="sf-skeleton-line sf-skeleton-shimmer"
                      style={{ width: "45%", height: "18px", borderRadius: "4px" }}
                    />
                    <div
                      className="sf-skeleton-line sf-skeleton-shimmer"
                      style={{ width: "65px", height: "18px", borderRadius: "4px" }}
                    />
                  </div>
                  <div className="sf-mod-set-divider" />
                  <div className="sf-mod-options-list">
                    {[1, 2, 3].map((optIdx) => (
                      <div key={optIdx} className="sf-mod-row sf-mod-row--skeleton">
                        <div
                          className="sf-skeleton-shimmer"
                          style={{ width: "20px", height: "20px", borderRadius: "9999px" }}
                        />
                        <div
                          className="sf-skeleton-line sf-skeleton-shimmer"
                          style={{ width: "40%", height: "15px", borderRadius: "4px", marginLeft: "12px" }}
                        />
                        <div
                          className="sf-skeleton-line sf-skeleton-shimmer"
                          style={{ width: "50px", height: "15px", borderRadius: "4px", marginLeft: "auto" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sf-modal-footer">
              <div className="sf-qty-selector">
                <div
                  className="sf-skeleton-shimmer"
                  style={{ width: "100px", height: "40px", borderRadius: "9999px" }}
                />
              </div>
              <div
                className="sf-skeleton-shimmer"
                style={{ width: "170px", height: "48px", borderRadius: "12px", marginLeft: "auto" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
