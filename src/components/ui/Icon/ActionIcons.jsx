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

export class TrashIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor", className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    );
  }
}

export class SlidersIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor", className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    );
  }
}

export class DragHandleIcon extends PureComponent {
  render() {
    const { size = 16, color = "currentColor", className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
    );
  }
}

export class DotsDragHandleIcon extends PureComponent {
  render() {
    const { size = 16, color = "currentColor", className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
        <circle cx="8" cy="6" r="1.5" />
        <circle cx="16" cy="6" r="1.5" />
        <circle cx="8" cy="12" r="1.5" />
        <circle cx="16" cy="12" r="1.5" />
        <circle cx="8" cy="18" r="1.5" />
        <circle cx="16" cy="18" r="1.5" />
      </svg>
    );
  }
}

export class NestedArrowIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor", className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
        <path d="M9 5H4v14h5" />
        <polyline points="14 8 18 12 14 16" />
        <line x1="8" y1="12" x2="18" y2="12" />
      </svg>
    );
  }
}

export class EmptyModifiersDeviceIcon extends PureComponent {
  render() {
    const { size = 64, className = "" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
        <circle cx="32" cy="32" r="32" fill="#F4F4F5" />
        <rect x="18" y="16" width="28" height="24" rx="3" stroke="#18181B" strokeWidth="2" fill="#FFFFFF" />
        <path d="M25 28l4 4 10-10" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 44h12M32 40v4" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
}

