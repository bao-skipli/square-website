import React, { PureComponent } from "react";
import { ArrowUpIcon } from "@/components/ui/Icon";

export default class HomeMetricsSection extends PureComponent {
  render() {
    const {
      aiQuery,
      onAiSubmit,
      onAiQueryChange,
      selectedDateChip,
      selectedVsChip,
      selectedChecksChip,
    } = this.props;

    return (
      <section className="sq-dashboard-columns">
<div className="sq-col-left">
<form className="sq-ai-input-card" onSubmit={onAiSubmit}>
            <input
              type="text"
              className="sq-ai-input-field"
              placeholder="How do I deactivate an employee?"
              value={aiQuery}
              onChange={onAiQueryChange}
              aria-label="Ask Square AI"
            />
            <button type="submit" className="sq-ai-submit-btn" aria-label="Send Query">
              <ArrowUpIcon />
            </button>
          </form>

<div className="sq-order-volume-card">
            <div className="sq-ov-header">
              <div>
                <h2 className="sq-ov-title">Order volume</h2>
                <div className="sq-ov-legend-row">
                  <span className="sq-ov-legend-label">New orders</span>
                  <span className="sq-ov-legend-today">
                    <span className="sq-box-solid-blue" />
                    Today
                  </span>
                  <span className="sq-ov-legend-comparison">
                    <span className="sq-box-striped-blue" />
                    Friday, October 2, 2026
                  </span>
                </div>
              </div>
              <a href="#view-orders" className="sq-ov-link-orders">
                View orders
              </a>
            </div>

            <div className="sq-chart-area">
              <div className="sq-chart-gridlines">
                <div className="sq-gridline" />
                <div className="sq-gridline" />
                <div className="sq-gridline" />
              </div>
              <div className="sq-chart-empty-badge">No current order activity</div>
              <div className="sq-chart-x-axis">
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

<div className="sq-performance-card">
            <h2 className="sq-perf-title">Performance</h2>

<div className="sq-perf-filters">
              <button type="button" className="sq-filter-chip">
                <span className="sq-chip-prefix">Date</span>
                <span className="sq-chip-val">{selectedDateChip}</span>
              </button>
              <button type="button" className="sq-filter-chip">
                <span className="sq-chip-prefix">vs</span>
                <span className="sq-chip-val">{selectedVsChip}</span>
              </button>
              <button type="button" className="sq-filter-chip">
                <span className="sq-chip-prefix">Checks</span>
                <span className="sq-chip-val">{selectedChecksChip}</span>
              </button>
            </div>

<div className="sq-perf-main-row">
              <div className="sq-net-sales-block">
                <div>
                  <span className="sq-net-sales-label">Net sales</span>
                  <h3 className="sq-net-sales-val">$0.00</h3>
                  <span className="sq-na-badge">
                    <span className="sq-na-triangle">▲</span> N/A
                  </span>
                </div>

                <div className="sq-perf-legend-col">
                  <div className="sq-perf-legend-item">
                    <span className="sq-box-solid-blue" />
                    <span>Today</span>
                  </div>
                  <div className="sq-perf-legend-item">
                    <span className="sq-box-light-blue" />
                    <span>Thu, Oct 8, 2026</span>
                  </div>
                </div>
              </div>

              <div className="sq-perf-chart-wrap">
                <div className="sq-chart-gridlines">
                  <div className="sq-gridline" />
                  <div className="sq-gridline" />
                  <div className="sq-gridline" />
                </div>
                <div className="sq-chart-empty-badge">
                  No data available for selected timeframe
                </div>
                <div className="sq-chart-x-axis">
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
              <div className="sq-metric-item">
                <div className="sq-metric-info">
                  <span className="sq-metric-label">Gross sales</span>
                  <span className="sq-metric-val">$0.00</span>
                </div>
                <span className="sq-na-badge">
                  <span className="sq-na-triangle">▲</span> N/A
                </span>
              </div>

              <div className="sq-metric-item">
                <div className="sq-metric-info">
                  <span className="sq-metric-label">Transactions</span>
                  <span className="sq-metric-val">0</span>
                </div>
                <span className="sq-na-badge">
                  <span className="sq-na-triangle">▲</span> N/A
                </span>
              </div>

              <div className="sq-metric-item">
                <div className="sq-metric-info">
                  <span className="sq-metric-label">Labor % of net sales</span>
                  <span className="sq-metric-val">0.00%</span>
                </div>
                <span className="sq-na-badge">
                  <span className="sq-na-triangle">▲</span> N/A
                </span>
              </div>

              <div className="sq-metric-item">
                <div className="sq-metric-info">
                  <span className="sq-metric-label">Average sale</span>
                  <span className="sq-metric-val">$0.00</span>
                </div>
                <span className="sq-na-badge">
                  <span className="sq-na-triangle">▲</span> N/A
                </span>
              </div>

              <div className="sq-metric-item">
                <div className="sq-metric-info">
                  <span className="sq-metric-label">Comps &amp; discounts</span>
                  <span className="sq-metric-val">$0.00</span>
                </div>
                <span className="sq-na-badge">
                  <span className="sq-na-triangle">▲</span> N/A
                </span>
              </div>

              <div className="sq-metric-item">
                <div className="sq-metric-info">
                  <span className="sq-metric-label">Tips</span>
                  <span className="sq-metric-val">$0.00</span>
                </div>
                <span className="sq-na-badge">
                  <span className="sq-na-triangle">▲</span> N/A
                </span>
              </div>
            </div>
          </div>
        </div>

<div className="sq-col-right">
<div className="sq-banking-card">
            <h3 className="sq-banking-title">Banking</h3>
            <div className="sq-banking-row">
              <span className="sq-banking-balance-label">Balance</span>
              <span className="sq-banking-balance-val">0,00 US$</span>
            </div>
          </div>

<div className="sq-quick-actions-card">
            <h3 className="sq-qa-title">Quick actions</h3>
            <ul className="sq-qa-list">
              <li className="sq-qa-item">
                <button
                  type="button"
                  className="sq-qa-btn"
                  onClick={() => alert("Action: Take payment")}
                >
                  Take payment
                </button>
              </li>
              <li className="sq-qa-item">
                <button
                  type="button"
                  className="sq-qa-btn"
                  onClick={() => alert("Action: Edit menu")}
                >
                  Edit menu
                </button>
              </li>
              <li className="sq-qa-item">
                <button
                  type="button"
                  className="sq-qa-btn"
                  onClick={() => alert("Action: Add item")}
                >
                  Add item
                </button>
              </li>
              <li className="sq-qa-item">
                <button
                  type="button"
                  className="sq-qa-btn"
                  onClick={() => alert("Action: Pay a bill")}
                >
                  Pay a bill
                </button>
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  }
}
