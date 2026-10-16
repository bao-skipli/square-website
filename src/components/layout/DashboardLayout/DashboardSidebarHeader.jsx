import React, { PureComponent } from "react";
import { UserIcon, SearchIcon } from "@/components/ui/Icon";

export default class DashboardSidebarHeader extends PureComponent {
  render() {
    const { businessName, searchQuery, onSearchChange } = this.props;

    return (
      <div className="sq-sidebar-header">
<div className="sq-account-card">
          <div className="sq-account-user-row">
            <span className="sq-account-avatar-icon">
              <UserIcon />
            </span>
            <span className="sq-account-name">{businessName}</span>
          </div>
          <button type="button" className="sq-account-badge">
            Square Free <span className="sq-account-badge-dot">·</span> See plans
          </button>
        </div>

<div className="sq-progress-section">
          <div className="sq-progress-bar-track">
            <div className="sq-progress-bar-fill" style={{ width: "17%" }} />
          </div>
          <div className="sq-progress-text-row">
            <span>Complete your setup</span>
            <span className="sq-progress-percent">17%</span>
          </div>
        </div>

<div className="sq-search-wrapper">
          <span className="sq-search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="sq-search-input"
            placeholder="Search"
            aria-label="Search"
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>
      </div>
    );
  }
}
