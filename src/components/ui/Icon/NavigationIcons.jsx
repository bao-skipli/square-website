import React, { PureComponent } from "react";

export class UserIcon extends PureComponent {
  render() {
    const { size = 20, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }
}

export class SearchIcon extends PureComponent {
  render() {
    const { size = 15, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    );
  }
}

export class HomeIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  }
}

export class TagIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
        <circle cx="7" cy="7" r=".7" fill={color} />
      </svg>
    );
  }
}

export class ReceiptIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <line x1="8" x2="16" y1="10" y2="10" />
        <line x1="8" x2="12" y1="14" y2="14" />
      </svg>
    );
  }
}

export class CustomersIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 17a5 5 0 0 1 10 0" />
      </svg>
    );
  }
}

export class ReportsIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    );
  }
}

export class StaffIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
}

export class BankIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="3" x2="21" y1="22" y2="22" />
        <line x1="6" x2="6" y1="18" y2="11" />
        <line x1="10" x2="10" y1="18" y2="11" />
        <line x1="14" x2="14" y1="18" y2="11" />
        <line x1="18" x2="18" y1="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </svg>
    );
  }
}

export class ChevronIcon extends PureComponent {
  render() {
    const { size = 14, rotated = false, className = "" } = this.props;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`sq-chevron-icon ${rotated ? "is-rotated" : ""} ${className}`}
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }
}
