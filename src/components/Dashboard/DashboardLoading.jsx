import React, { PureComponent } from "react";

export default class DashboardLoading extends PureComponent {
  render() {
    const { message, size = 36 } = this.props;

    return (
      <div
        className="sq-dashboard-loading-area"
        role="status"
        aria-live="polite"
        aria-label="Loading content"
      >
        <div className="sq-dashboard-loading-wrapper">
          <svg
            className="sq-dashboard-loading-spinner"
            width={size}
            height={size}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="18"
              cy="18"
              r="14"
              stroke="#111111"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeDasharray="64 88"
            />
          </svg>
          {message && <p className="sq-dashboard-loading-text">{message}</p>}
        </div>
      </div>
    );
  }
}
