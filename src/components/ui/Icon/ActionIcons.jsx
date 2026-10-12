import React, { PureComponent } from "react";

export class DotsIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
        <circle cx="5" cy="12" r="1.5" />
      </svg>
    );
  }
}

export class FilterSlidersIcon extends PureComponent {
  render() {
    const { size = 15, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="4" x2="20" y1="6" y2="6" />
        <line x1="7" x2="17" y1="12" y2="12" />
        <line x1="10" x2="14" y1="18" y2="18" />
      </svg>
    );
  }
}

export class PlusIcon extends PureComponent {
  render() {
    const { size = 15, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" x2="12" y1="5" y2="19" />
        <line x1="5" x2="19" y1="12" y2="12" />
      </svg>
    );
  }
}

export class CloseXIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" x2="6" y1="6" y2="18" />
        <line x1="6" x2="18" y1="6" y2="18" />
      </svg>
    );
  }
}

export class ArrowLeftIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    );
  }
}

export class ChevronRightIcon extends PureComponent {
  render() {
    const { size = 16, color = "currentColor", className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }
}

export class ChevronDownIcon extends PureComponent {
  render() {
    const { size = 14, color = "currentColor", className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }
}

export class ChevronUpIcon extends PureComponent {
  render() {
    const { size = 14, color = "currentColor", className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="m18 15-6-6-6 6" />
      </svg>
    );
  }
}

export class ArrowUpIcon extends PureComponent {
  render() {
    const { size = 16, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" x2="12" y1="19" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    );
  }
}
