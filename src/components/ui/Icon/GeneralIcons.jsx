import React, { PureComponent } from "react";

export class SparkleIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </svg>
    );
  }
}

export class BellIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    );
  }
}

export class ChatIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    );
  }
}

export class HelpIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    );
  }
}

export class BarcodeIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M7 8v8M10 8v8M14 8v8M17 8v8" />
      </svg>
    );
  }
}

export class ForkKnifeIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 2v20M18 2a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3M6 2v6a3 3 0 0 0 6 0V2M9 11v11" />
      </svg>
    );
  }
}

export class InfoCircleIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    );
  }
}

export class UploadImageIcon extends PureComponent {
  render() {
    const { size = 24, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        <path d="M14 7h6M17 4v6" />
      </svg>
    );
  }
}

export class PackageIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
      </svg>
    );
  }
}

export class GlobeIcon extends PureComponent {
  render() {
    const { size = 18, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" x2="22" y1="12" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    );
  }
}

export class TablePlaceholderThumbIcon extends PureComponent {
  render() {
    const { size = 20, color = "#A1A1AA" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    );
  }
}

export class FolderIcon extends PureComponent {
  render() {
    const { size = 20, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      </svg>
    );
  }
}

export class ImageIcon extends PureComponent {
  render() {
    const { size = 20, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    );
  }
}

export class TreeHierarchyIcon extends PureComponent {
  render() {
    const { size = 20, color = "currentColor", strokeWidth = "2" } = this.props;
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8v5" />
        <path d="M6 13h12" />
        <path d="M6 13v3" />
        <path d="M18 13v3" />
        <circle cx="6" cy="19" r="3" />
        <circle cx="18" cy="19" r="3" />
      </svg>
    );
  }
}

export class BulletListIcon extends PureComponent {
  render() {
    const { size = 16, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4.5" cy="6" r="1.5" fill={color} />
        <circle cx="4.5" cy="12" r="1.5" fill={color} />
        <circle cx="4.5" cy="18" r="1.5" fill={color} />
      </svg>
    );
  }
}

export class PosTerminalIcon extends PureComponent {
  render() {
    const { size = 20, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="13" rx="2" />
        <path d="M7 21h10M12 16v5" />
        <line x1="7" y1="8" x2="11" y2="8" />
      </svg>
    );
  }
}

export class SlashCircleIcon extends PureComponent {
  render() {
    const { size = 20, color = "currentColor" } = this.props;
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    );
  }
}

export class StarBadgeIcon extends PureComponent {
  render() {
    return (
      <span className="sq-star-badge" aria-hidden="true">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </span>
    );
  }
}

export class DebitCardIcon extends PureComponent {
  render() {
    return (
      <svg
        width="48"
        height="34"
        viewBox="0 0 48 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="46"
          height="32"
          rx="5"
          fill="#F0F1F2"
          stroke="#D2D6DC"
          strokeWidth="1.5"
        />
        <rect x="6" y="8" width="8" height="6" rx="1.5" fill="#E2E5E9" />
        <rect x="6" y="24" width="10" height="2" rx="1" fill="#CBD0D6" />
        <circle cx="38" cy="25" r="3" fill="#D2D6DC" />
      </svg>
    );
  }
}

export class SavingsCoinIcon extends PureComponent {
  render() {
    return (
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="22" cy="22" r="20" fill="#F4F5F7" stroke="#E2E4E8" strokeWidth="1.5" />
        <text
          x="22"
          y="29"
          textAnchor="middle"
          fontSize="24"
          fontWeight="800"
          fill="#111111"
          fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
        >
          $
        </text>
      </svg>
    );
  }
}

