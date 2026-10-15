import React, { useState } from "react";

export function ImageSkeleton({ src, alt, className = "", wrapperClassName = "", aspectRatio = "1/1" }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`sf-img-skeleton-wrap ${wrapperClassName}`}
      style={{ aspectRatio }}
    >
      {!loaded && !error && <div className="sf-skeleton sf-skeleton-img" />}
      {error ? (
        <div className="sf-img-placeholder">
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
    <div className="sf-header sf-header-skeleton">
      <div className="sf-header-left">
        <div className="sf-skeleton sf-skeleton-icon" />
      </div>
      <div className="sf-header-center">
        <div className="sf-skeleton sf-skeleton-logo" />
      </div>
      <div className="sf-header-right">
        <div className="sf-skeleton sf-skeleton-pill" />
        <div className="sf-skeleton sf-skeleton-pill" />
      </div>
    </div>
  );
}

export function CategoryTabsSkeleton() {
  return (
    <div className="sf-tabs-bar sf-tabs-skeleton">
      <div className="sf-tabs-scroll">
        <div className="sf-skeleton sf-tab-pill" style={{ width: "120px" }} />
        <div className="sf-skeleton sf-tab-pill" style={{ width: "80px" }} />
        <div className="sf-skeleton sf-tab-pill" style={{ width: "160px" }} />
        <div className="sf-skeleton sf-tab-pill" style={{ width: "100px" }} />
        <div className="sf-skeleton sf-tab-pill" style={{ width: "90px" }} />
        <div className="sf-skeleton sf-tab-pill" style={{ width: "140px" }} />
      </div>
    </div>
  );
}

export function MenuSkeleton() {
  return (
    <div className="sf-menu-skeleton-container">
      {[1, 2].map((sec) => (
        <div key={sec} className="sf-section-skeleton">
          <div className="sf-skeleton sf-skeleton-section-title" />
          <div className="sf-items-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="sf-item-card sf-item-card-skeleton">
                <div className="sf-item-card-left">
                  <div className="sf-skeleton sf-skeleton-line" style={{ width: "70%", height: "20px" }} />
                  <div className="sf-skeleton sf-skeleton-line" style={{ width: "95%", height: "14px", marginTop: "8px" }} />
                  <div className="sf-skeleton sf-skeleton-line" style={{ width: "60%", height: "14px", marginTop: "4px" }} />
                  <div className="sf-skeleton sf-skeleton-line" style={{ width: "40%", height: "18px", marginTop: "auto" }} />
                </div>
                <div className="sf-item-card-right">
                  <div className="sf-skeleton sf-skeleton-card-img" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ItemModalSkeleton() {
  return (
    <div className="sf-modal-overlay">
      <div className="sf-modal-container sf-modal-skeleton">
        <div className="sf-modal-left">
          <div className="sf-skeleton sf-modal-img-skeleton" />
          <div className="sf-skeleton sf-skeleton-line" style={{ width: "75%", height: "32px", marginTop: "24px" }} />
          <div className="sf-skeleton sf-skeleton-line" style={{ width: "90%", height: "16px", marginTop: "12px" }} />
        </div>
        <div className="sf-modal-right">
          <div className="sf-skeleton sf-skeleton-line" style={{ width: "50%", height: "22px" }} />
          <div className="sf-skeleton sf-skeleton-line" style={{ width: "100%", height: "48px", marginTop: "16px" }} />
          <div className="sf-skeleton sf-skeleton-line" style={{ width: "100%", height: "48px", marginTop: "12px" }} />
          <div className="sf-skeleton sf-skeleton-line" style={{ width: "100%", height: "48px", marginTop: "12px" }} />
        </div>
      </div>
    </div>
  );
}
