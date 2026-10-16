import React, { PureComponent } from "react";

export default class HomeSkeleton extends PureComponent {
  render() {
    return (
      <div className="sq-home-skeleton" aria-label="Loading home dashboard...">
<div className="sq-dashboard-header">
          <div className="sq-skel-line sq-skel-title" />
          <div className="sq-skel-line sq-skel-subtitle" />
        </div>

<section className="sq-onboarding-grid" aria-hidden="true">
<div className="sq-card-standard sq-skel-card">
            <div>
              <div className="sq-skel-line sq-skel-badge" />
              <div className="sq-skel-line sq-skel-promo-text-1" />
              <div className="sq-skel-line sq-skel-promo-text-2" />
            </div>
          </div>

<div className="sq-card-standard sq-skel-card">
            <div>
              <div className="sq-skel-icon" />
              <div className="sq-skel-line sq-skel-card-title" />
              <div className="sq-skel-line sq-skel-card-desc" />
            </div>
            <div className="sq-card-actions">
              <div className="sq-skel-btn" />
              <div className="sq-skel-btn-link" />
            </div>
          </div>

<div className="sq-card-standard sq-skel-card">
            <div>
              <div className="sq-skel-icon" />
              <div className="sq-skel-line sq-skel-card-title" />
              <div className="sq-skel-line sq-skel-card-desc" />
            </div>
            <div className="sq-card-actions">
              <div className="sq-skel-btn" />
            </div>
          </div>

<div className="sq-card-standard sq-skel-card">
            <div>
              <div className="sq-skel-icon" />
              <div className="sq-skel-line sq-skel-card-title" />
              <div className="sq-skel-line sq-skel-card-desc" />
            </div>
            <div className="sq-card-actions">
              <div className="sq-skel-btn" />
              <div className="sq-skel-btn-link" />
            </div>
          </div>

<div className="sq-card-standard sq-skel-card">
            <div>
              <div className="sq-skel-icon" />
              <div className="sq-skel-line sq-skel-card-title" />
              <div className="sq-skel-line sq-skel-card-desc" />
            </div>
            <div className="sq-card-actions">
              <div className="sq-skel-btn" />
            </div>
          </div>

<div className="sq-card-empty" />
        </section>

<section className="sq-dashboard-columns" aria-hidden="true">
<div className="sq-col-left">
<div className="sq-ai-input-card sq-skel-ai-card">
              <div className="sq-skel-line sq-skel-ai-placeholder" />
              <div className="sq-skel-circle-btn" />
            </div>

<div className="sq-order-volume-card sq-skel-card">
              <div className="sq-ov-header">
                <div>
                  <div className="sq-skel-line sq-skel-section-title" />
                  <div className="sq-ov-legend-row" style={{ marginTop: "8px" }}>
                    <div className="sq-skel-pill" style={{ width: "80px" }} />
                    <div className="sq-skel-pill" style={{ width: "70px" }} />
                    <div className="sq-skel-pill" style={{ width: "130px" }} />
                  </div>
                </div>
                <div className="sq-skel-line" style={{ width: "90px", height: "14px" }} />
              </div>

              <div className="sq-chart-area sq-skel-chart-area">
                <div className="sq-chart-gridlines">
                  <div className="sq-gridline" />
                  <div className="sq-gridline" />
                  <div className="sq-gridline" />
                </div>
                <div className="sq-skel-center-badge" />
                <div className="sq-chart-x-axis" style={{ opacity: 0.4 }}>
                  <span>3:00 AM</span>
                  <span>4:00 AM</span>
                  <span>5:00 AM</span>
                  <span>6:00 AM</span>
                  <span>7:00 AM</span>
                  <span>8:00 AM</span>
                  <span>9:00 AM</span>
                  <span>10:00 AM</span>
                  <span>11:00 AM</span>
                </div>
              </div>
            </div>

<div className="sq-performance-card sq-skel-card">
              <div className="sq-skel-line sq-skel-section-title" />

<div className="sq-perf-filters">
                <div className="sq-skel-chip" />
                <div className="sq-skel-chip" />
                <div className="sq-skel-chip" />
              </div>

<div className="sq-perf-main-row">
                <div className="sq-net-sales-block">
                  <div>
                    <div className="sq-skel-line" style={{ width: "65px", height: "12px", marginBottom: "8px" }} />
                    <div className="sq-skel-line" style={{ width: "95px", height: "26px", marginBottom: "8px" }} />
                    <div className="sq-skel-pill" style={{ width: "60px", height: "18px" }} />
                  </div>
                  <div className="sq-perf-legend-col" style={{ marginTop: "16px" }}>
                    <div className="sq-skel-pill" style={{ width: "75px" }} />
                    <div className="sq-skel-pill" style={{ width: "120px" }} />
                  </div>
                </div>

                <div className="sq-perf-chart-wrap sq-skel-chart-area">
                  <div className="sq-chart-gridlines">
                    <div className="sq-gridline" />
                    <div className="sq-gridline" />
                    <div className="sq-gridline" />
                  </div>
                  <div className="sq-skel-center-badge" />
                  <div className="sq-chart-x-axis" style={{ opacity: 0.4 }}>
                    <span>8am</span>
                    <span>9</span>
                    <span>10</span>
                    <span>11</span>
                    <span>12pm</span>
                    <span>1</span>
                    <span>2pm</span>
                  </div>
                </div>
              </div>

              <hr className="sq-perf-divider" />

<div className="sq-metrics-grid">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="sq-metric-item">
                    <div className="sq-metric-info" style={{ width: "70%" }}>
                      <div className="sq-skel-line" style={{ width: "80px", height: "12px", marginBottom: "6px" }} />
                      <div className="sq-skel-line" style={{ width: "50px", height: "18px" }} />
                    </div>
                    <div className="sq-skel-pill" style={{ width: "50px", height: "18px" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

<div className="sq-col-right">
<div className="sq-banking-card sq-skel-card">
              <div className="sq-skel-line sq-skel-section-title" />
              <div className="sq-banking-row" style={{ marginTop: "16px" }}>
                <div className="sq-skel-line" style={{ width: "60px", height: "14px" }} />
                <div className="sq-skel-line" style={{ width: "80px", height: "16px" }} />
              </div>
            </div>

<div className="sq-quick-actions-card sq-skel-card">
              <div className="sq-skel-line sq-skel-section-title" style={{ marginBottom: "16px" }} />
              <ul className="sq-qa-list">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="sq-qa-item" style={{ marginBottom: "10px" }}>
                    <div className="sq-skel-btn-row" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
