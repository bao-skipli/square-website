import React, { Component } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { subscribeAuth, getUserBusinessInfo } from "../../firebase/authService";
import "./Dashboard.css";

/* ==========================================================================
   INLINE SVG ICONS (Pixel-perfect matching Square dashboard)
   ========================================================================== */

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <circle cx="7" cy="7" r=".7" fill="currentColor" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="8" x2="16" y1="10" y2="10" />
      <line x1="8" x2="12" y1="14" y2="14" />
    </svg>
  );
}

function CustomersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 17a5 5 0 0 1 10 0" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function StaffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
    </svg>
  );
}

function ChannelsGridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function ChevronIcon({ rotated = false }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`sq-chevron-icon ${rotated ? "is-rotated" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  );
}

function PosMonitorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HardwareGridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="16" cy="8" r="1.5" />
      <circle cx="8" cy="16" r="1.5" />
      <circle cx="16" cy="16" r="1.5" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="19" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function StarBadgeIcon() {
  return (
    <span className="sq-star-badge" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </span>
  );
}

/* Icons for Item Library & Create Item */
function BarcodeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 8v8M10 8v8M14 8v8M17 8v8" />
    </svg>
  );
}

function ForkKnifeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2v20M18 2a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3M6 2v6a3 3 0 0 0 6 0V2M9 11v11" />
    </svg>
  );
}

function InfoCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function UploadImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      <path d="M14 7h6M17 4v6" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function FilterSlidersIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="7" x2="17" y1="12" y2="12" />
      <line x1="10" x2="14" y1="18" y2="18" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

function CloseXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function TablePlaceholderThumbIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const DEFAULT_CATEGORIES = [
  "Uncategorized",
  "Desserts",
  "Food",
  "Beverage",
  "Liquor",
  "Beer",
  "Wine",
  "Coffee & Tea",
  "Pho",
];

const INITIAL_LIBRARY_ITEMS = [
  { id: "item-1", name: "Banana Pudding", category: "Desserts", status: "Available", price: "$6.00" },
  { id: "item-2", name: "Brownie", category: "Desserts", status: "Available", price: "$4.50" },
  { id: "item-3", name: "Cheesecake", category: "Desserts", status: "Available", price: "$7.00" },
  { id: "item-4", name: "Cookie", category: "Desserts", status: "Available", price: "$3.00" },
  { id: "item-5", name: "Ice Cream", category: "Desserts", status: "Available", price: "$5.00" },
  { id: "item-6", name: "Pho ga", category: "Pho", status: "Available", price: "$14.50" },
];

/* ==========================================================================
   REACT ROUTER HOC FOR CLASS COMPONENT
   ========================================================================== */
function withRouter(Component) {
  return function ComponentWithRouterProp(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return <Component {...props} router={{ location, navigate, params }} />;
  };
}

/* ==========================================================================
   DASHBOARD CLASS COMPONENT
   ========================================================================== */

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      businessName: "Skipli",
      currentView: "home", // "home" | "item-library"
      activeMenu: "home",
      isItemsMenusOpen: false,
      isItemsOpen: false,
      searchQuery: "",
      aiQuery: "",
      dismissedPosCard: false,
      selectedDateChip: "Oct 9",
      selectedVsChip: "Prior day",
      selectedChecksChip: "Closed",

      // Item Library State (Sample items matching Square reference screenshots)
      items: [...INITIAL_LIBRARY_ITEMS],
      librarySearchQuery: "",
      isCreateItemOpen: false,
      isHeaderScrolled: false,
      formError: "",

      // Filter Drawer State (Ảnh image.png, image copy.png, image copy 2.png)
      isFilterDrawerOpen: false,
      filterDrawerView: "all", // "all" | "category" | "status"
      drawerCategorySearch: "",
      appliedCategories: [],
      draftCategories: [],
      appliedStatuses: [],
      draftStatuses: [],

      // Actions Dropdown Menu State (Ảnh image copy 3.png)
      isActionsOpen: false,

      // Create Item Form Values
      formName: "",
      formItemType: "Prepared food and beverage",
      formKitchenName: "",
      formPrice: "",
      formPriceUnit: "ea",
      formDescription: "",
      formCategory: "",
      formMenu: "",
      formSku: "",
      formGtin: "",
      formStatus: "Available",
      formShippingWeight: "0.00",
      formCannotBePurchasedAlone: false,
      formSkipCustomization: true,
      formContainsAlcohol: false,
      formPointsOfSale: true,

      // Accordion & Banner Toggles in Create Item
      nutritionalInfoOpen: false,
      manageCheckoutOpen: true,
      fulfillOrdersOpen: true,
      checkoutBannerVisible: true,
      statusDropdownOpen: false,
    };

    this.unsubscribeAuth = null;
    this.actionsRef = null;
  }

  componentDidMount() {
    this.syncRouteWithState();
    document.addEventListener("mousedown", this.handleClickOutside);

    this.unsubscribeAuth = subscribeAuth(async (user) => {
      if (user) {
        try {
          const info = await getUserBusinessInfo(user.uid);
          if (info && info.businessMatch && info.businessMatch.businessName) {
            this.setState({ businessName: info.businessMatch.businessName });
          }
        } catch (err) {
          console.warn("Could not fetch business info for dashboard:", err);
        }
      }
    });
  }

  componentWillUnmount() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.router &&
      prevProps.router &&
      this.props.router.location.pathname !== prevProps.router.location.pathname
    ) {
      this.syncRouteWithState();
    }
  }

  /* Sync URL Path with Component State */
  syncRouteWithState = () => {
    if (!this.props.router || !this.props.router.location) return;
    const { pathname } = this.props.router.location;
    if (pathname === "/dashboard/items/library/new") {
      this.setState({
        currentView: "item-library",
        activeMenu: "item-library",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateItemOpen: true,
      });
    } else if (
      pathname === "/dashboard/items/library" ||
      pathname.startsWith("/dashboard/items/library")
    ) {
      this.setState({
        currentView: "item-library",
        activeMenu: "item-library",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateItemOpen: false,
      });
    } else if (pathname === "/dashboard") {
      this.setState({
        currentView: "home",
        activeMenu: "home",
        isCreateItemOpen: false,
      });
    }
  };

  /* Navigation Helpers */
  navigateToHome = () => {
    if (this.props.router && this.props.router.navigate) {
      this.props.router.navigate("/dashboard");
    } else {
      this.setState({ currentView: "home", activeMenu: "home" });
    }
  };

  navigateToItemLibrary = () => {
    if (this.props.router && this.props.router.navigate) {
      this.props.router.navigate("/dashboard/items/library");
    } else {
      this.setState({
        currentView: "item-library",
        activeMenu: "item-library",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateItemOpen: false,
      });
    }
  };

  navigateToCreateItem = () => {
    if (this.props.router && this.props.router.navigate) {
      this.props.router.navigate("/dashboard/items/library/new");
    } else {
      this.setState({
        currentView: "item-library",
        activeMenu: "item-library",
        isItemsMenusOpen: true,
        isItemsOpen: true,
        isCreateItemOpen: true,
      });
    }
  };

  /* Interaction Handlers */
  toggleItemsMenus = () => {
    this.setState((prev) => ({
      isItemsMenusOpen: !prev.isItemsMenusOpen,
    }));
  };

  toggleItems = (e) => {
    if (e) e.stopPropagation();
    this.setState((prev) => ({
      isItemsOpen: !prev.isItemsOpen,
    }));
  };

  handleMenuClick = (menuKey) => {
    if (menuKey === "home") {
      this.navigateToHome();
    } else if (menuKey === "item-library") {
      this.navigateToItemLibrary();
    } else {
      this.setState({ activeMenu: menuKey });
    }
  };

  handleAiSubmit = (e) => {
    e.preventDefault();
    if (this.state.aiQuery.trim()) {
      alert(`Square AI query received: "${this.state.aiQuery}"`);
      this.setState({ aiQuery: "" });
    }
  };

  handleDismissPos = () => {
    this.setState({ dismissedPosCard: true });
  };

  /* Create Item Handlers */
  handleOpenCreateItem = () => {
    this.navigateToCreateItem();
  };

  handleCloseCreateItem = () => {
    const { formName } = this.state;
    if (formName.trim() && !window.confirm("You have unsaved changes. Are you sure you want to close?")) {
      return;
    }
    this.setState({
      isCreateItemOpen: false,
      formError: "",
      formName: "",
      formPrice: "",
      formDescription: "",
      formKitchenName: "",
      formCategory: "",
      formMenu: "",
      formSku: "",
      formGtin: "",
    });
    this.navigateToItemLibrary();
  };

  handleSaveItem = (e) => {
    if (e) e.preventDefault();
    const { formName, formPrice, formCategory, formStatus, items } = this.state;
    if (!formName.trim()) {
      this.setState({ formError: "Item name is required." });
      return;
    }
    const newItem = {
      id: `item-${Date.now()}`,
      name: formName.trim(),
      category: formCategory.trim() || "Uncategorized",
      status: formStatus || "Available",
      price: formPrice ? (formPrice.startsWith("$") ? formPrice : `$${formPrice}`) : "—",
    };
    this.setState({
      items: [newItem, ...items],
      isCreateItemOpen: false,
      formError: "",
      formName: "",
      formPrice: "",
      formDescription: "",
      formKitchenName: "",
      formCategory: "",
      formMenu: "",
      formSku: "",
      formGtin: "",
    });
    this.navigateToItemLibrary();
  };

  handleCreateItemScroll = (e) => {
    const isScrolled = e.target.scrollTop > 50;
    if (isScrolled !== this.state.isHeaderScrolled) {
      this.setState({ isHeaderScrolled: isScrolled });
    }
  };


  /* Filter Drawer Handlers (Ảnh image.png, image copy.png, image copy 2.png) */
  openCategoryFilter = () => {
    this.setState((prev) => ({
      isFilterDrawerOpen: true,
      filterDrawerView: "category",
      draftCategories: [...prev.appliedCategories],
      draftStatuses: [...prev.appliedStatuses],
      drawerCategorySearch: "",
      isActionsOpen: false,
    }));
  };

  openStatusFilter = () => {
    this.setState((prev) => ({
      isFilterDrawerOpen: true,
      filterDrawerView: "status",
      draftCategories: [...prev.appliedCategories],
      draftStatuses: [...prev.appliedStatuses],
      isActionsOpen: false,
    }));
  };

  openAllFilters = () => {
    this.setState((prev) => ({
      isFilterDrawerOpen: true,
      filterDrawerView: "all",
      draftCategories: [...prev.appliedCategories],
      draftStatuses: [...prev.appliedStatuses],
      isActionsOpen: false,
    }));
  };

  closeFilterDrawer = () => {
    this.setState({ isFilterDrawerOpen: false });
  };

  handleDrawerBack = () => {
    this.setState({ filterDrawerView: "all" });
  };

  handleToggleCategoryDraft = (catName) => {
    this.setState((prev) => {
      const exists = prev.draftCategories.includes(catName);
      return {
        draftCategories: exists
          ? prev.draftCategories.filter((c) => c !== catName)
          : [...prev.draftCategories, catName],
      };
    });
  };

  handleToggleStatusDraft = (statusName) => {
    this.setState((prev) => {
      const exists = prev.draftStatuses.includes(statusName);
      return {
        draftStatuses: exists
          ? prev.draftStatuses.filter((s) => s !== statusName)
          : [...prev.draftStatuses, statusName],
      };
    });
  };

  handleToggleSelectAllStatusDraft = () => {
    this.setState((prev) => {
      const allChecked =
        prev.draftStatuses.includes("Active") &&
        prev.draftStatuses.includes("Archived");
      return {
        draftStatuses: allChecked ? [] : ["Active", "Archived"],
      };
    });
  };

  handleResetCategoryDraft = () => {
    this.setState({ draftCategories: [] });
  };

  handleResetStatusDraft = () => {
    this.setState({ draftStatuses: [] });
  };

  handleResetAllDrafts = () => {
    this.setState({ draftCategories: [], draftStatuses: [] });
  };

  handleApplyFilters = () => {
    this.setState((prev) => ({
      appliedCategories: [...prev.draftCategories],
      appliedStatuses: [...prev.draftStatuses],
      isFilterDrawerOpen: false,
    }));
  };

  /* Actions Dropdown Handlers (Ảnh image copy 3.png) */
  toggleActionsDropdown = (e) => {
    e.stopPropagation();
    this.setState((prev) => ({ isActionsOpen: !prev.isActionsOpen }));
  };

  handleActionItemClick = (actionName) => {
    this.setState({ isActionsOpen: false });
    alert(`Action: ${actionName}`);
  };

  handleClickOutside = (e) => {
    if (this.actionsRef && !this.actionsRef.contains(e.target)) {
      if (this.state.isActionsOpen) {
        this.setState({ isActionsOpen: false });
      }
    }
  };

  render() {
    const {
      businessName,
      currentView,
      activeMenu,
      isItemsMenusOpen,
      isItemsOpen,
      searchQuery,
      aiQuery,
      dismissedPosCard,
      selectedDateChip,
      selectedVsChip,
      selectedChecksChip,
      items,
      librarySearchQuery,
      isCreateItemOpen,
      isHeaderScrolled,
      formError,
      isFilterDrawerOpen,
      filterDrawerView,
      drawerCategorySearch,
      appliedCategories,
      draftCategories,
      appliedStatuses,
      draftStatuses,
      isActionsOpen,
      formName,
      formItemType,
      formKitchenName,
      formPrice,
      formPriceUnit,
      formDescription,
      formCategory,
      formMenu,
      formSku,
      formGtin,
      formStatus,
      formShippingWeight,
      formCannotBePurchasedAlone,
      formSkipCustomization,
      formContainsAlcohol,
      formPointsOfSale,
      nutritionalInfoOpen,
      manageCheckoutOpen,
      fulfillOrdersOpen,
      checkoutBannerVisible,
      statusDropdownOpen,
    } = this.state;

    // Available categories (DEFAULT + any custom ones from items)
    const customCats = items
      .map((i) => i.category)
      .filter((c) => c && c !== "—" && !DEFAULT_CATEGORIES.includes(c));
    const allCategoriesCombined = Array.from(
      new Set([...DEFAULT_CATEGORIES, ...customCats])
    );
    const availableCategoriesList = allCategoriesCombined.filter((cat) =>
      cat.toLowerCase().includes(drawerCategorySearch.toLowerCase().trim())
    );

    // Filter items for table
    const filteredItems = items.filter((item) => {
      if (librarySearchQuery.trim()) {
        const q = librarySearchQuery.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchCat = (item.category || "").toLowerCase().includes(q);
        const matchPrice = (item.price || "").toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchPrice) return false;
      }

      if (appliedCategories.length > 0) {
        const itemCat = item.category || "";
        const isUncategorized =
          !itemCat || itemCat === "—" || itemCat.toLowerCase() === "uncategorized";
        const matchCat = appliedCategories.some((cat) => {
          if (cat === "Uncategorized") return isUncategorized;
          return itemCat.toLowerCase() === cat.toLowerCase();
        });
        if (!matchCat) return false;
      }

      if (appliedStatuses.length > 0 && appliedStatuses.length < 2) {
        const itemStatus = item.status || "Available";
        const isActive = itemStatus === "Available" || itemStatus === "Active";
        if (appliedStatuses.includes("Active") && !isActive) return false;
        if (appliedStatuses.includes("Archived") && isActive) return false;
      }

      return true;
    });

    return (
      <div className="sq-dashboard-root">
        {/* ================================================================
            LEFT SIDEBAR (Ảnh 3, Ảnh 7, Ảnh 8)
            ================================================================ */}
        <aside className="sq-sidebar" aria-label="Square Sidebar Navigation">
          {/* Top Fixed Header: Account, Progress, Search */}
          <div className="sq-sidebar-header">
            {/* 1. Account Card */}
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

            {/* 2. Setup Progress Bar */}
            <div className="sq-progress-section">
              <div className="sq-progress-bar-track">
                <div className="sq-progress-bar-fill" style={{ width: "17%" }} />
              </div>
              <div className="sq-progress-text-row">
                <span>Complete your setup</span>
                <span className="sq-progress-percent">17%</span>
              </div>
            </div>

            {/* 3. Search Pill */}
            <div className="sq-search-wrapper">
              <span className="sq-search-icon">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="sq-search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => this.setState({ searchQuery: e.target.value })}
                aria-label="Search dashboard"
              />
            </div>
          </div>

          {/* Scrollable Navigation Menu */}
          <div className="sq-sidebar-menu-scroll">
            {/* 4. Main Menu Items */}
            <ul className="sq-nav-list">
              {/* Home */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "home" && currentView === "home" ? "is-active" : ""}`}
                  onClick={this.navigateToHome}
                >
                  <span className="sq-nav-btn-icon">
                    <HomeIcon />
                  </span>
                  <span className="sq-nav-btn-label">Home</span>
                </button>
              </li>

              {/* Items & menus (Interactive Accordion) */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${
                    activeMenu === "items-menus" || isItemsMenusOpen ? "is-active" : ""
                  }`}
                  onClick={this.toggleItemsMenus}
                  aria-expanded={isItemsMenusOpen}
                >
                  <span className="sq-nav-btn-icon">
                    <TagIcon />
                  </span>
                  <span className="sq-nav-btn-label">Items &amp; menus</span>
                  <ChevronIcon rotated={isItemsMenusOpen} />
                </button>

                {/* Submenu Level 1 (Ảnh 7) */}
                {isItemsMenusOpen && (
                  <div className="sq-submenu-level-1">
                    {/* Items (sub-level accordion) */}
                    <div>
                      <button
                        type="button"
                        className={`sq-submenu-btn ${activeMenu === "items" ? "is-active" : ""}`}
                        onClick={this.toggleItems}
                        aria-expanded={isItemsOpen}
                      >
                        <span>Items</span>
                        <ChevronIcon rotated={isItemsOpen} />
                      </button>

                      {/* Submenu Level 2 (Ảnh 8) */}
                      {isItemsOpen && (
                        <div className="sq-submenu-level-2">
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "item-library" && currentView === "item-library" ? "is-active" : ""}`}
                            onClick={this.navigateToItemLibrary}
                          >
                            <span>Item library</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "channel-listings" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("channel-listings")}
                          >
                            <span>Channel listings</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "service-library" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("service-library")}
                          >
                            <span>Service library</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "image-library" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("image-library")}
                          >
                            <span>Image library</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "modifiers" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("modifiers")}
                          >
                            <span>Modifiers</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "categories" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("categories")}
                          >
                            <span>Categories</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "discounts" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("discounts")}
                          >
                            <span>Discounts</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "options" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("options")}
                          >
                            <span>Options</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "units" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("units")}
                          >
                            <span>Units</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "custom-attributes" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("custom-attributes")}
                          >
                            <span>Custom attributes</span>
                          </button>
                          <button
                            type="button"
                            className={`sq-subitem-btn ${activeMenu === "item-settings" ? "is-active" : ""}`}
                            onClick={() => this.handleMenuClick("item-settings")}
                          >
                            <span>Settings</span>
                            <ChevronIcon rotated={false} />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className={`sq-submenu-btn ${activeMenu === "menus" ? "is-active" : ""}`}
                      onClick={() => this.handleMenuClick("menus")}
                    >
                      <span>Menus</span>
                    </button>
                    <button
                      type="button"
                      className={`sq-submenu-btn ${activeMenu === "inventory-mgmt" ? "is-active" : ""}`}
                      onClick={() => this.handleMenuClick("inventory-mgmt")}
                    >
                      <span>Inventory management</span>
                      <StarBadgeIcon />
                    </button>
                    <button
                      type="button"
                      className={`sq-submenu-btn ${activeMenu === "order-guide" ? "is-active" : ""}`}
                      onClick={() => this.handleMenuClick("order-guide")}
                    >
                      <span>Order guide</span>
                      <StarBadgeIcon />
                    </button>
                    <button
                      type="button"
                      className={`sq-submenu-btn ${activeMenu === "gift-cards" ? "is-active" : ""}`}
                      onClick={() => this.handleMenuClick("gift-cards")}
                    >
                      <span>Gift Cards</span>
                      <ChevronIcon rotated={false} />
                    </button>
                    <button
                      type="button"
                      className={`sq-submenu-btn ${activeMenu === "subscription-plans" ? "is-active" : ""}`}
                      onClick={() => this.handleMenuClick("subscription-plans")}
                    >
                      <span>Subscription plans</span>
                    </button>
                  </div>
                )}
              </li>

              {/* Orders & payments */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "orders-payments" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("orders-payments")}
                >
                  <span className="sq-nav-btn-icon">
                    <ReceiptIcon />
                  </span>
                  <span className="sq-nav-btn-label">Orders &amp; payments</span>
                </button>
              </li>

              {/* Customers */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "customers" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("customers")}
                >
                  <span className="sq-nav-btn-icon">
                    <CustomersIcon />
                  </span>
                  <span className="sq-nav-btn-label">Customers</span>
                </button>
              </li>

              {/* Reports */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "reports" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("reports")}
                >
                  <span className="sq-nav-btn-icon">
                    <ReportsIcon />
                  </span>
                  <span className="sq-nav-btn-label">Reports</span>
                </button>
              </li>

              {/* Staff */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "staff" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("staff")}
                >
                  <span className="sq-nav-btn-icon">
                    <StaffIcon />
                  </span>
                  <span className="sq-nav-btn-label">Staff</span>
                </button>
              </li>

              {/* Banking */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "banking" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("banking")}
                >
                  <span className="sq-nav-btn-icon">
                    <BankIcon />
                  </span>
                  <span className="sq-nav-btn-label">Banking</span>
                </button>
              </li>

              {/* What's new */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "whats-new" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("whats-new")}
                >
                  <span className="sq-nav-btn-icon">
                    <MegaphoneIcon />
                  </span>
                  <span className="sq-nav-btn-label">What's new</span>
                </button>
              </li>

              {/* Settings */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "settings" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("settings")}
                >
                  <span className="sq-nav-btn-icon">
                    <SettingsIcon />
                  </span>
                  <span className="sq-nav-btn-label">Settings</span>
                </button>
              </li>

              {/* Add more */}
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "add-more" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("add-more")}
                >
                  <span className="sq-nav-btn-icon">
                    <DotsIcon />
                  </span>
                  <span className="sq-nav-btn-label">Add more</span>
                </button>
              </li>
            </ul>

            {/* Divider */}
            <hr className="sq-sidebar-divider" />

            {/* Channels & Online ordering */}
            <ul className="sq-nav-list">
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "channels" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("channels")}
                >
                  <span className="sq-nav-btn-icon">
                    <ChannelsGridIcon />
                  </span>
                  <span className="sq-nav-btn-label">Channels</span>
                </button>
              </li>
              <li className="sq-nav-item">
                <button
                  type="button"
                  className={`sq-nav-btn ${activeMenu === "online-ordering" ? "is-active" : ""}`}
                  onClick={() => this.handleMenuClick("online-ordering")}
                >
                  <span className="sq-nav-btn-icon">
                    <BagIcon />
                  </span>
                  <span className="sq-nav-btn-label">Online ordering</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Bottom Area: 4 Icons + Take payment */}
          <div className="sq-sidebar-bottom">
            <div className="sq-sidebar-icons-row">
              <button type="button" className="sq-icon-button" aria-label="Notifications">
                <BellIcon />
              </button>
              <button type="button" className="sq-icon-button" aria-label="Messages">
                <ChatIcon />
              </button>
              <button type="button" className="sq-icon-button" aria-label="Help">
                <HelpIcon />
              </button>
              <button type="button" className="sq-icon-button" aria-label="AI Assistant">
                <SparkleIcon />
              </button>
            </div>
            <button
              type="button"
              className="sq-btn-take-payment"
              onClick={() => alert("Take Payment Modal opened")}
            >
              Take payment
            </button>
          </div>
        </aside>

        {/* ================================================================
            MAIN CONTENT AREA
            Switches between Home Dashboard and Item Library based on currentView
            ================================================================ */}
        <main className="sq-main-content">
          {currentView === "item-library" ? (
            /* ============================================================
               VIEW 2: ITEM LIBRARY (Ảnh 2)
               ============================================================ */
            <section className="sq-item-library-view" aria-label="Item Library">
              {/* Toolbar */}
              <div className="sq-library-toolbar">
                <div className="sq-toolbar-left">
                  {/* Search pill */}
                  <div className="sq-search-wrapper" style={{ marginBottom: 0, width: "230px" }}>
                    <span className="sq-search-icon">
                      <SearchIcon />
                    </span>
                    <input
                      type="text"
                      className="sq-search-input"
                      placeholder="Search"
                      aria-label="Search items"
                      value={librarySearchQuery}
                      onChange={(e) => this.setState({ librarySearchQuery: e.target.value })}
                    />
                  </div>

                  {/* Filter Chips (Ảnh image.png, image copy.png, image copy 2.png) */}
                  <button
                    type="button"
                    className={`sq-chip-btn ${appliedCategories.length > 0 ? "is-filtered" : ""}`}
                    onClick={this.openCategoryFilter}
                  >
                    Category
                    {appliedCategories.length > 0 && (
                      <span className="sq-chip-val">
                        : <strong>{appliedCategories.length === 1 ? appliedCategories[0] : `${appliedCategories.length} selected`}</strong>
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className={`sq-chip-btn ${appliedStatuses.length > 0 && appliedStatuses.length < 2 ? "is-filtered" : ""}`}
                    onClick={this.openStatusFilter}
                  >
                    Status
                    {appliedStatuses.length === 1 && (
                      <span className="sq-chip-val">
                        : <strong>{appliedStatuses[0]}</strong>
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    className="sq-chip-btn"
                    onClick={this.openAllFilters}
                  >
                    <FilterSlidersIcon />
                    All filters
                  </button>
                </div>

                <div className="sq-toolbar-right">
                  {/* Actions button & dropdown menu (Ảnh image copy 3.png) */}
                  <div className="sq-actions-dropdown-wrap" ref={(el) => (this.actionsRef = el)}>
                    <button
                      type="button"
                      className={`sq-btn-actions ${isActionsOpen ? "is-open" : ""}`}
                      onClick={this.toggleActionsDropdown}
                    >
                      Actions
                      <ChevronIcon rotated={isActionsOpen} />
                    </button>
                    {isActionsOpen && (
                      <div className="sq-actions-dropdown-menu">
                        <button
                          type="button"
                          className="sq-actions-dropdown-item"
                          onClick={() => this.handleActionItemClick("Import library")}
                        >
                          Import library
                        </button>
                        <div className="sq-actions-dropdown-divider" />
                        <button
                          type="button"
                          className="sq-actions-dropdown-item"
                          onClick={() => this.handleActionItemClick("Export library")}
                        >
                          Export library
                        </button>
                        <div className="sq-actions-dropdown-divider" />
                        <button
                          type="button"
                          className="sq-actions-dropdown-item"
                          onClick={() => this.handleActionItemClick("Collapse all items")}
                        >
                          Collapse all items
                        </button>
                        <div className="sq-actions-dropdown-divider" />
                        <button
                          type="button"
                          className="sq-actions-dropdown-item"
                          onClick={() => this.handleActionItemClick("Create items from template")}
                        >
                          Create items from template
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="sq-btn-create-item"
                    onClick={this.navigateToCreateItem}
                  >
                    Create item
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="sq-table-container">
                <table className="sq-item-table">
                  <thead>
                    <tr>
                      <th className="sq-col-checkbox">
                        <input type="checkbox" className="sq-checkbox-custom" aria-label="Select all items" />
                      </th>
                      <th>Item</th>
                      <th>Reporting category</th>
                      <th>Status</th>
                      <th>Price</th>
                      <th style={{ textAlign: "right", width: "40px" }}>
                        <button type="button" className="sq-btn-add-col" title="Add column">
                          +
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Quick create row */}
                    <tr>
                      <td colSpan="6" style={{ padding: 0 }}>
                        <div
                          className="sq-quick-create-row"
                          onClick={this.navigateToCreateItem}
                        >
                          <PlusIcon />
                          <span className="underline-text">Quick create</span>
                        </div>
                      </td>
                    </tr>

                    {/* Empty State vs Item List */}
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="sq-empty-state-box">
                          {librarySearchQuery || appliedCategories.length > 0 || (appliedStatuses.length > 0 && appliedStatuses.length < 2) ? (
                            <>No items match your search or filter criteria.</>
                          ) : (
                            <>
                              No items yet. Click <strong>Create item</strong> to get started.
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => (
                        <tr key={item.id}>
                          <td className="sq-col-checkbox">
                            <input type="checkbox" className="sq-checkbox-custom" />
                          </td>
                          <td>
                            <div className="sq-table-item-cell">
                              <div className="sq-item-thumb-placeholder">
                                <TablePlaceholderThumbIcon />
                              </div>
                              <span className="sq-item-cell-name">{item.name}</span>
                            </div>
                          </td>
                          <td style={{ color: "#555555" }}>{item.category}</td>
                          <td>
                            <button type="button" className="sq-badge-available">
                              {item.status} <ChevronIcon />
                            </button>
                          </td>
                          <td style={{ fontWeight: 500 }}>{item.price}</td>
                          <td style={{ textAlign: "right" }}>
                            <button type="button" className="sq-btn-row-more" aria-label="More item options">
                              <DotsIcon />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            /* ============================================================
               VIEW 1: HOME DASHBOARD (Ảnh 1, 2, 4, 5, 6)
               ============================================================ */
            <>
              {/* Header (Ảnh 2) */}
              <header className="sq-dashboard-header">
                <h1 className="sq-dashboard-title">Set up your business to start selling</h1>
                <p className="sq-dashboard-subtitle">1 of 6 steps completed</p>
              </header>

              {/* Onboarding Cards Grid (Ảnh 4) */}
              <section className="sq-onboarding-grid" aria-label="Setup Guides">
                {/* Row 1, Card 1: Promo card */}
                <div className="sq-card-promo">
                  <span className="sq-promo-expiry">Expires in 2 days 23 hours</span>
                  <p className="sq-promo-text">
                    Get free processing on up to $1,000 when you take your first card payment
                  </p>
                </div>

                {/* Row 1, Card 2: Demo your new POS */}
                {!dismissedPosCard && (
                  <div className="sq-card-standard">
                    <div>
                      <div className="sq-card-icon-wrap">
                        <PosMonitorIcon />
                      </div>
                      <h3 className="sq-card-title">Demo your new POS</h3>
                      <p className="sq-card-desc">Run a test sale to get familiar.</p>
                    </div>
                    <div className="sq-card-actions">
                      <button type="button" className="sq-btn-pill-gray">
                        Try it out
                      </button>
                      <button
                        type="button"
                        className="sq-link-dismiss"
                        onClick={this.handleDismissPos}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}

                {/* Row 1, Card 3: Get approved to take payments */}
                <div className="sq-card-standard">
                  <div>
                    <div className="sq-card-icon-wrap">
                      <ShieldCheckIcon />
                    </div>
                    <h3 className="sq-card-title">Get approved to take payments</h3>
                    <p className="sq-card-desc">Verify your identity to accept payments.</p>
                  </div>
                  <div className="sq-card-actions">
                    <button type="button" className="sq-btn-pill-gray">
                      Verify your identity
                    </button>
                  </div>
                </div>

                {/* Row 2, Card 1: Add hardware */}
                <div className="sq-card-standard">
                  <div>
                    <div className="sq-card-icon-wrap">
                      <HardwareGridIcon />
                    </div>
                    <h3 className="sq-card-title">Add hardware</h3>
                    <p className="sq-card-desc">Order hardware or set up devices you have.</p>
                  </div>
                  <div className="sq-card-actions">
                    <button type="button" className="sq-btn-pill-gray">
                      Shop hardware
                    </button>
                    <button type="button" className="sq-link-dismiss">
                      Set up hardware
                    </button>
                  </div>
                </div>

                {/* Row 2, Card 2: Take your first payment */}
                <div className="sq-card-standard">
                  <div>
                    <div className="sq-card-icon-wrap">
                      <CreditCardIcon />
                    </div>
                    <h3 className="sq-card-title">Take your first payment</h3>
                    <p className="sq-card-desc">Choose how you'd like to take your first payment.</p>
                  </div>
                  <div className="sq-card-actions">
                    <button type="button" className="sq-btn-pill-gray">
                      Get started
                    </button>
                  </div>
                </div>

                {/* Row 2, Card 3: Empty slot (Ảnh 1 & 4) */}
                <div className="sq-card-empty" aria-hidden="true" />
              </section>

              {/* 2-Column Main Section (Ảnh 5 & 6) */}
              <section className="sq-dashboard-columns">
                {/* Left Column (~70%) */}
                <div className="sq-col-left">
                  {/* AI Chat Prompt Input (Ảnh 5) */}
                  <form className="sq-ai-input-card" onSubmit={this.handleAiSubmit}>
                    <input
                      type="text"
                      className="sq-ai-input-field"
                      placeholder="How do I deactivate an employee?"
                      value={aiQuery}
                      onChange={(e) => this.setState({ aiQuery: e.target.value })}
                      aria-label="Ask Square AI"
                    />
                    <button type="submit" className="sq-ai-submit-btn" aria-label="Send Query">
                      <ArrowUpIcon />
                    </button>
                  </form>

                  {/* Order Volume Card (Ảnh 5) */}
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

                  {/* Performance Card (Ảnh 6) */}
                  <div className="sq-performance-card">
                    <h2 className="sq-perf-title">Performance</h2>

                    {/* 3 Filter Chips */}
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

                    {/* Chart & Net Sales Block */}
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

                    {/* Metrics 2-Column Grid */}
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

                {/* Right Column (~30%) */}
                <div className="sq-col-right">
                  {/* Banking Card */}
                  <div className="sq-banking-card">
                    <h3 className="sq-banking-title">Banking</h3>
                    <div className="sq-banking-row">
                      <span className="sq-banking-balance-label">Balance</span>
                      <span className="sq-banking-balance-val">0,00 US$</span>
                    </div>
                  </div>

                  {/* Quick Actions Card */}
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
            </>
          )}
        </main>

        {/* ================================================================
            CREATE ITEM FULL-SCREEN PAGE (Ảnh 3 → 9)
            Covers entire screen, hiding sidebar, has sticky header & 2-column form
            ================================================================ */}
        {isCreateItemOpen && (
          <div
            className="sq-create-item-overlay"
            onScroll={this.handleCreateItemScroll}
            role="dialog"
            aria-modal="true"
            aria-label="Create item"
          >
            {/* Sticky Header */}
            <div className="sq-create-sticky-header">
              <button
                type="button"
                className="sq-btn-close-create"
                onClick={this.handleCloseCreateItem}
                aria-label="Close"
              >
                <CloseXIcon />
              </button>

              <div
                className={`sq-header-centered-title ${
                  isHeaderScrolled ? "is-visible" : "is-hidden"
                }`}
              >
                Create item
              </div>

              <button
                type="button"
                className="sq-btn-save-item"
                onClick={this.handleSaveItem}
              >
                Save
              </button>
            </div>

            {/* Form Content Body */}
            <div className="sq-create-content-container">
              <h1 className="sq-create-large-title">Create item</h1>

              <div className="sq-create-grid">
                {/* --------------------------------------------------------
                    LEFT COLUMN (~65% Form Body - Ảnh 3 → 8)
                    -------------------------------------------------------- */}
                <div className="sq-create-form-left">
                  {/* (a) Ảnh 3: Top Inputs */}
                  {/* 1. Item Type */}
                  <div className="sq-item-type-box">
                    <div className="sq-item-type-left">
                      <div className="sq-item-type-icon-wrap">
                        <ForkKnifeIcon />
                      </div>
                      <div className="sq-item-type-text-col">
                        <span className="sq-item-type-label">Item type</span>
                        <span className="sq-item-type-val">{formItemType}</span>
                      </div>
                    </div>
                    <ChevronIcon />
                  </div>

                  {/* 2. Name (required) */}
                  <div className={`sq-form-box ${formError ? "is-error" : ""}`}>
                    <input
                      type="text"
                      className="sq-form-box-input"
                      placeholder="Name (required)"
                      value={formName}
                      onChange={(e) =>
                        this.setState({ formName: e.target.value, formError: "" })
                      }
                      autoFocus
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#555" }}>
                      <BarcodeIcon />
                      <DotsIcon />
                    </div>
                  </div>
                  {formError && <div className="sq-error-msg">{formError}</div>}

                  {/* 3. Kitchen name */}
                  <div className="sq-form-box">
                    <input
                      type="text"
                      className="sq-form-box-input"
                      placeholder="Kitchen name"
                      value={formKitchenName}
                      onChange={(e) => this.setState({ formKitchenName: e.target.value })}
                    />
                    <span style={{ color: "#71717a" }}>
                      <InfoCircleIcon />
                    </span>
                  </div>

                  {/* 4. Price */}
                  <div className="sq-form-box">
                    <input
                      type="text"
                      className="sq-form-box-input"
                      placeholder="Price"
                      value={formPrice}
                      onChange={(e) => this.setState({ formPrice: e.target.value })}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          fontSize: "13.5px",
                          fontWeight: 600,
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        {formPriceUnit} ⌄
                      </span>
                      <DotsIcon />
                    </div>
                  </div>

                  {/* 5. Margin Chip */}
                  <div className="sq-chip-margin">Add unit cost to see margins</div>

                  {/* 6. Customer-facing description */}
                  <textarea
                    className="sq-textarea-desc"
                    placeholder="Customer-facing description"
                    value={formDescription}
                    onChange={(e) => this.setState({ formDescription: e.target.value })}
                  />

                  {/* 7. Image Upload Dropzone */}
                  <div className="sq-upload-dropzone">
                    <div className="sq-upload-icon">
                      <UploadImageIcon />
                    </div>
                    <div className="sq-upload-text">
                      Drop images here,{" "}
                      <span className="sq-upload-link">browse files</span>, or{" "}
                      <span className="sq-upload-link">add from image library</span>
                    </div>
                  </div>

                  {/* (b) Ảnh 4: Taxes, Nutritional Information, Inventory */}
                  {/* 8. Taxes */}
                  <div className="sq-section-row">
                    <div className="sq-section-row-info">
                      <span className="sq-section-row-title">Taxes</span>
                      <span className="sq-section-row-desc">No taxes created</span>
                    </div>
                    <button type="button" className="sq-btn-pill-gray">
                      Set up
                    </button>
                  </div>

                  {/* 9. Nutritional Information Accordion */}
                  <button
                    type="button"
                    className="sq-accordion-header"
                    onClick={() =>
                      this.setState((prev) => ({
                        nutritionalInfoOpen: !prev.nutritionalInfoOpen,
                      }))
                    }
                  >
                    <div className="sq-section-row-info">
                      <span className="sq-section-row-title">Nutritional information</span>
                      <span className="sq-section-row-desc">
                        Calorie count, dietary preferences, and food allergens.
                      </span>
                    </div>
                    <ChevronIcon rotated={nutritionalInfoOpen} />
                  </button>
                  {nutritionalInfoOpen && (
                    <div className="sq-accordion-body">
                      <div className="sq-form-box">
                        <input
                          type="text"
                          className="sq-form-box-input"
                          placeholder="Calories (kcal)"
                        />
                      </div>
                      <div className="sq-form-box">
                        <input
                          type="text"
                          className="sq-form-box-input"
                          placeholder="Allergens (e.g. Milk, Nuts, Soy)"
                        />
                      </div>
                    </div>
                  )}

                  {/* 10. Thick Gray Divider Block */}
                  <div className="sq-divider-thick-block" />

                  {/* 11. Manage Inventory */}
                  <div style={{ marginTop: "8px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 10px 0" }}>
                      Manage inventory
                    </h3>
                    <table className="sq-inventory-table">
                      <thead>
                        <tr>
                          <th>Location</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{businessName}</td>
                          <td>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                              <button type="button" className="sq-badge-available">
                                Available ⌄
                              </button>
                              <DotsIcon />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 12. SKU and GTIN */}
                  <div className="sq-two-inputs-row">
                    <div className="sq-form-box" style={{ marginBottom: 0 }}>
                      <input
                        type="text"
                        className="sq-form-box-input"
                        placeholder="SKU"
                        value={formSku}
                        onChange={(e) => this.setState({ formSku: e.target.value })}
                      />
                      <InfoCircleIcon />
                    </div>
                    <div className="sq-form-box" style={{ marginBottom: 0 }}>
                      <input
                        type="text"
                        className="sq-form-box-input"
                        placeholder="GTIN"
                        value={formGtin}
                        onChange={(e) => this.setState({ formGtin: e.target.value })}
                      />
                      <InfoCircleIcon />
                    </div>
                  </div>

                  {/* (c) Ảnh 5: Unit cost link, Variations, Units, Modifiers */}
                  <div style={{ marginTop: "12px" }}>
                    <span className="sq-link-blue-star">
                      Add unit cost and vendor
                      <StarBadgeIcon />
                    </span>
                  </div>

                  {/* Thick Divider */}
                  <div className="sq-divider-thick-block" />

                  {/* 15. Variations */}
                  <div className="sq-section-row">
                    <div className="sq-section-row-info">
                      <span className="sq-section-row-title">Variations</span>
                      <span className="sq-section-row-desc">
                        Add options like portions or sizes, then set prices and availability.
                      </span>
                    </div>
                    <button type="button" className="sq-btn-pill-gray">
                      Add ⌄
                    </button>
                  </div>

                  {/* 16. Units */}
                  <div className="sq-section-row">
                    <div className="sq-section-row-info">
                      <span className="sq-section-row-title">
                        Units <StarBadgeIcon />
                      </span>
                      <span className="sq-section-row-desc">
                        Sell this item in multiple units, such as individually or by the case.
                      </span>
                    </div>
                    <button type="button" className="sq-btn-pill-gray">
                      Add
                    </button>
                  </div>

                  {/* 17. Modifiers */}
                  <div className="sq-section-row">
                    <div className="sq-section-row-info">
                      <span className="sq-section-row-title">Modifiers</span>
                      <span className="sq-section-row-desc">
                        Allow customizations such as toppings, sides, or special requests.{" "}
                        <a href="#learn" style={{ textDecoration: "underline", color: "#111" }}>
                          Learn more
                        </a>
                      </span>
                    </div>
                    <button type="button" className="sq-btn-pill-gray">
                      Add
                    </button>
                  </div>

                  {/* (d) Ảnh 6: Bundle, Custom attributes */}
                  {/* 18. Bundle */}
                  <div className="sq-section-row">
                    <div className="sq-section-row-info">
                      <span className="sq-section-row-title">
                        Bundle <StarBadgeIcon />
                      </span>
                      <span className="sq-section-row-desc">
                        Sell goods from your library as a bundle
                      </span>
                    </div>
                    <button type="button" className="sq-btn-pill-gray">
                      Add
                    </button>
                  </div>

                  {/* 19. Custom attributes */}
                  <div className="sq-section-row">
                    <div className="sq-section-row-info">
                      <span className="sq-section-row-title">Custom attributes</span>
                      <span className="sq-section-row-desc">
                        Track additional details for this item.{" "}
                        <a href="#learn" style={{ textDecoration: "underline", color: "#111" }}>
                          Learn more
                        </a>
                      </span>
                    </div>
                    <button type="button" className="sq-btn-pill-gray">
                      Add
                    </button>
                  </div>

                  {/* Thick Divider */}
                  <div className="sq-divider-thick-block" />

                  {/* (e) Ảnh 7: Manage checkout */}
                  <div>
                    <button
                      type="button"
                      className="sq-accordion-header"
                      onClick={() =>
                        this.setState((prev) => ({
                          manageCheckoutOpen: !prev.manageCheckoutOpen,
                        }))
                      }
                    >
                      <div className="sq-accordion-header-left">
                        <div className="sq-accordion-icon-box">
                          <ReceiptIcon />
                        </div>
                        <span className="sq-accordion-title">Manage checkout</span>
                      </div>
                      <ChevronIcon rotated={manageCheckoutOpen} />
                    </button>

                    {manageCheckoutOpen && (
                      <div className="sq-accordion-body">
                        {/* Info Banner */}
                        {checkoutBannerVisible && (
                          <div className="sq-checkout-info-banner">
                            <InfoCircleIcon />
                            <span>
                              Create and manage payment links in{" "}
                              <strong>Payments &amp; invoices &gt; Payment links</strong>. Once links
                              are created, you can copy the link from your Item Library.
                            </span>
                            <button
                              type="button"
                              className="sq-btn-dismiss-banner"
                              onClick={() => this.setState({ checkoutBannerVisible: false })}
                              aria-label="Dismiss banner"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {/* Toggle: Cannot be purchased on its own */}
                        <div className="sq-toggle-row-gray">
                          <div className="sq-section-row-info">
                            <span className="sq-section-row-title">
                              This item cannot be purchased on its own
                            </span>
                            <span className="sq-section-row-desc">
                              Recommended for tracking internal costs such as packing materials.{" "}
                              <a href="#learn" style={{ textDecoration: "underline", color: "#111" }}>
                                Learn more
                              </a>
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`sq-toggle-switch ${
                              formCannotBePurchasedAlone ? "is-on" : ""
                            }`}
                            onClick={() =>
                              this.setState((prev) => ({
                                formCannotBePurchasedAlone: !prev.formCannotBePurchasedAlone,
                              }))
                            }
                            aria-label="Toggle item cannot be purchased alone"
                          >
                            <span className="sq-toggle-knob" />
                          </button>
                        </div>

                        {/* Discount eligibility */}
                        <div className="sq-section-row">
                          <div className="sq-section-row-info">
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span className="sq-section-row-title">Discount eligibility</span>
                              <span
                                style={{
                                  backgroundColor: "#e8f8ec",
                                  color: "#1b7a2d",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: "999px",
                                }}
                              >
                                Beta ⌄
                              </span>
                            </div>
                            <span className="sq-section-row-desc">
                              Allow or prevent discounts from being applied to this item at checkout.
                            </span>
                          </div>
                          <button type="button" className="sq-btn-pill-gray">
                            Eligible ⌄
                          </button>
                        </div>

                        {/* Point of sale subheader & toggle */}
                        <div style={{ marginTop: "16px" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#71717a",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Point of sale
                          </span>
                          <div className="sq-section-row" style={{ borderBottom: "none" }}>
                            <div className="sq-section-row-info" style={{ maxWidth: "85%" }}>
                              <span className="sq-section-row-title">
                                Skip customization when possible
                              </span>
                              <span className="sq-section-row-desc">
                                Item customization steps (variations, modifiers, seat, etc.) will only
                                appear if selections are required. Once all required selections have
                                been made, the item will be automatically added to the cart.
                              </span>
                            </div>
                            <button
                              type="button"
                              className={`sq-toggle-switch ${formSkipCustomization ? "is-on" : ""}`}
                              onClick={() =>
                                this.setState((prev) => ({
                                  formSkipCustomization: !prev.formSkipCustomization,
                                }))
                              }
                              aria-label="Toggle skip customization"
                            >
                              <span className="sq-toggle-knob" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thick Divider */}
                  <div className="sq-divider-thick-block" />

                  {/* (f) Ảnh 8: Fulfill orders */}
                  <div>
                    <button
                      type="button"
                      className="sq-accordion-header"
                      onClick={() =>
                        this.setState((prev) => ({
                          fulfillOrdersOpen: !prev.fulfillOrdersOpen,
                        }))
                      }
                    >
                      <div className="sq-accordion-header-left">
                        <div className="sq-accordion-icon-box">
                          <PackageIcon />
                        </div>
                        <span className="sq-accordion-title">Fulfill orders</span>
                      </div>
                      <ChevronIcon rotated={fulfillOrdersOpen} />
                    </button>

                    {fulfillOrdersOpen && (
                      <div className="sq-accordion-body">
                        {/* Item prep time */}
                        <div className="sq-section-row">
                          <div className="sq-section-row-info">
                            <span className="sq-section-row-title">Item prep time</span>
                            <span className="sq-section-row-desc">Based on location default</span>
                          </div>
                          <span className="sq-link-edit">Edit</span>
                        </div>

                        {/* Item contains alcohol */}
                        <div className="sq-section-row">
                          <div className="sq-section-row-info">
                            <span className="sq-section-row-title">Item contains alcohol</span>
                            <span className="sq-section-row-desc">
                              Require ID on delivery and set alcohol limits for QR code orders.{" "}
                              <a href="#learn" style={{ textDecoration: "underline", color: "#111" }}>
                                Learn more
                              </a>
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`sq-toggle-switch ${formContainsAlcohol ? "is-on" : ""}`}
                            onClick={() =>
                              this.setState((prev) => ({
                                formContainsAlcohol: !prev.formContainsAlcohol,
                              }))
                            }
                            aria-label="Toggle item contains alcohol"
                          >
                            <span className="sq-toggle-knob" />
                          </button>
                        </div>

                        {/* Shipping weight */}
                        <div className="sq-section-row" style={{ borderBottom: "none" }}>
                          <span className="sq-section-row-title">Shipping weight</span>
                          <div
                            className="sq-form-box"
                            style={{ width: "140px", marginBottom: 0, padding: "8px 12px" }}
                          >
                            <input
                              type="text"
                              className="sq-form-box-input"
                              placeholder="0.00"
                              value={formShippingWeight}
                              onChange={(e) => this.setState({ formShippingWeight: e.target.value })}
                            />
                            <span style={{ fontSize: "14px", color: "#6b7280" }}>lb</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* --------------------------------------------------------
                    RIGHT COLUMN (~35% Cards - Ảnh 9)
                    -------------------------------------------------------- */}
                <div className="sq-create-cards-right">
                  {/* Card 1: Status */}
                  <div className="sq-create-card">
                    <div className="sq-create-card-header" style={{ marginBottom: 0 }}>
                      <h3 className="sq-create-card-title">Status</h3>
                      <div style={{ position: "relative" }}>
                        <button
                          type="button"
                          className="sq-badge-available"
                          onClick={this.toggleStatusDropdown}
                        >
                          {formStatus} <ChevronIcon rotated={statusDropdownOpen} />
                        </button>
                        {statusDropdownOpen && (
                          <div
                            style={{
                              position: "absolute",
                              right: 0,
                              top: "100%",
                              marginTop: "6px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #e5e5e5",
                              borderRadius: "10px",
                              boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                              padding: "4px",
                              zIndex: 10,
                              minWidth: "120px",
                            }}
                          >
                            <button
                              type="button"
                              className="sq-nav-btn"
                              style={{ padding: "6px 10px", fontSize: "13px" }}
                              onClick={() => this.selectStatus("Available")}
                            >
                              Available
                            </button>
                            <button
                              type="button"
                              className="sq-nav-btn"
                              style={{ padding: "6px 10px", fontSize: "13px" }}
                              onClick={() => this.selectStatus("Unavailable")}
                            >
                              Unavailable
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Categories */}
                  <div className="sq-create-card">
                    <h3 className="sq-create-card-title">Categories</h3>
                    <p className="sq-create-card-desc">
                      For printer routing and sales reporting.
                    </p>
                    <div className="sq-card-search-pill">
                      <span className="sq-search-icon">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        className="sq-card-search-input"
                        placeholder="Add to categories"
                        value={formCategory}
                        onChange={(e) => this.setState({ formCategory: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Card 3: Menus */}
                  <div className="sq-create-card">
                    <h3 className="sq-create-card-title">Menus</h3>
                    <p className="sq-create-card-desc">
                      For online ordering sites, delivery apps, kiosks, and any restaurant POS modes.
                    </p>
                    <div className="sq-card-search-pill">
                      <span className="sq-search-icon">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        className="sq-card-search-input"
                        placeholder="Add to menus"
                        value={formMenu}
                        onChange={(e) => this.setState({ formMenu: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Card 4: Locations and channels */}
                  <div className="sq-create-card">
                    <div className="sq-create-card-header">
                      <h3 className="sq-create-card-title">Locations and channels</h3>
                      <span className="sq-link-edit">Edit POS tile</span>
                    </div>

                    {/* Location Row */}
                    <div className="sq-location-row">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: "#111" }}>
                          <BankIcon />
                        </span>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600 }}>Locations</span>
                            <span
                              style={{
                                backgroundColor: "#f4f4f5",
                                color: "#555",
                                fontSize: "11px",
                                fontWeight: 600,
                                padding: "1px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              All
                            </span>
                          </div>
                          <span style={{ fontSize: "12.5px", color: "#6b7280" }}>
                            {businessName}
                          </span>
                        </div>
                      </div>
                      <span className="sq-link-edit">Edit</span>
                    </div>

                    {/* Points of sale */}
                    <div className="sq-location-row">
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <GlobeIcon />
                        <span style={{ fontSize: "14px", fontWeight: 600 }}>Points of sale</span>
                      </div>
                      <button
                        type="button"
                        className={`sq-toggle-switch ${formPointsOfSale ? "is-on" : ""}`}
                        onClick={() =>
                          this.setState((prev) => ({
                            formPointsOfSale: !prev.formPointsOfSale,
                          }))
                        }
                        aria-label="Toggle points of sale"
                      >
                        <span className="sq-toggle-knob" />
                      </button>
                    </div>

                    {/* Add channel */}
                    <button type="button" className="sq-btn-add-channel">
                      <PlusIcon />
                      Add channel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            FILTER DRAWER (Ảnh image.png, image copy.png, image copy 2.png)
            ================================================================ */}
        {isFilterDrawerOpen && (
          <div className="sq-drawer-backdrop" onClick={this.closeFilterDrawer} />
        )}

        <aside
          className={`sq-filter-drawer ${isFilterDrawerOpen ? "is-open" : ""}`}
          aria-label="Filter panel"
        >
          {/* Header: Circle Back/Close Button + Actions (Reset + Apply) */}
          <div className="sq-drawer-header">
            {filterDrawerView === "all" ? (
              <button
                type="button"
                className="sq-drawer-btn-circle"
                onClick={this.closeFilterDrawer}
                title="Close filters"
              >
                <CloseXIcon />
              </button>
            ) : (
              <button
                type="button"
                className="sq-drawer-btn-circle"
                onClick={this.handleDrawerBack}
                title="Back to all filters"
              >
                <ArrowLeftIcon />
              </button>
            )}

            <div className="sq-drawer-header-actions">
              {filterDrawerView === "category" ? (
                <button
                  type="button"
                  className="sq-drawer-btn-reset"
                  onClick={this.handleResetCategoryDraft}
                >
                  Reset
                </button>
              ) : filterDrawerView === "status" ? (
                <button
                  type="button"
                  className="sq-drawer-btn-reset"
                  onClick={this.handleResetStatusDraft}
                >
                  Reset
                </button>
              ) : (
                <button
                  type="button"
                  className="sq-drawer-btn-reset"
                  onClick={this.handleResetAllDrafts}
                >
                  Reset all filters
                </button>
              )}

              <button
                type="button"
                className="sq-drawer-btn-apply"
                onClick={this.handleApplyFilters}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="sq-drawer-body">
            {/* VIEW 1: CATEGORY (Ảnh image.png) */}
            {filterDrawerView === "category" && (
              <div>
                <span className="sq-drawer-sublabel">Filter by</span>
                <h2 className="sq-drawer-title">Category</h2>

                {/* Search categories input pill */}
                <div className="sq-drawer-search-pill">
                  <span className="sq-search-icon">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    className="sq-drawer-search-input"
                    placeholder="Search categories"
                    value={drawerCategorySearch}
                    onChange={(e) =>
                      this.setState({ drawerCategorySearch: e.target.value })
                    }
                  />
                </div>

                {/* Categories list */}
                <div className="sq-drawer-list">
                  {availableCategoriesList.map((cat) => {
                    const isChecked = draftCategories.includes(cat);
                    return (
                      <div
                        key={cat}
                        className="sq-drawer-list-item"
                        onClick={() => this.handleToggleCategoryDraft(cat)}
                      >
                        <div className="sq-drawer-item-left">
                          <div className="sq-drawer-item-icon">
                            {cat === "Uncategorized" ? <FolderIcon /> : <ImageIcon />}
                          </div>
                          <div>
                            <div className="sq-drawer-item-title">{cat}</div>
                            {cat === "Uncategorized" && (
                              <div className="sq-drawer-item-subtitle">
                                Items with no categorization
                              </div>
                            )}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="sq-checkbox-custom"
                          checked={isChecked}
                          onChange={() => this.handleToggleCategoryDraft(cat)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: STATUS (Ảnh image copy 2.png) */}
            {filterDrawerView === "status" && (
              <div>
                <span className="sq-drawer-sublabel">Filter by</span>
                <h2 className="sq-drawer-title">Status</h2>

                <div className="sq-drawer-list">
                  {/* Select all */}
                  <div
                    className="sq-drawer-list-item"
                    onClick={this.handleToggleSelectAllStatusDraft}
                  >
                    <span className="sq-drawer-item-title">Select all</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span className="sq-drawer-count">2</span>
                      <input
                        type="checkbox"
                        className="sq-checkbox-custom"
                        checked={
                          draftStatuses.includes("Active") &&
                          draftStatuses.includes("Archived")
                        }
                        onChange={this.handleToggleSelectAllStatusDraft}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Active */}
                  <div
                    className="sq-drawer-list-item"
                    onClick={() => this.handleToggleStatusDraft("Active")}
                  >
                    <span className="sq-drawer-item-title">Active</span>
                    <input
                      type="checkbox"
                      className="sq-checkbox-custom"
                      checked={draftStatuses.includes("Active")}
                      onChange={() => this.handleToggleStatusDraft("Active")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Archived */}
                  <div
                    className="sq-drawer-list-item"
                    onClick={() => this.handleToggleStatusDraft("Archived")}
                  >
                    <span className="sq-drawer-item-title">Archived</span>
                    <input
                      type="checkbox"
                      className="sq-checkbox-custom"
                      checked={draftStatuses.includes("Archived")}
                      onChange={() => this.handleToggleStatusDraft("Archived")}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 3: ALL FILTERS (Ảnh image copy.png) */}
            {filterDrawerView === "all" && (
              <div>
                <h2 className="sq-drawer-title" style={{ marginTop: "4px" }}>
                  Filter by
                </h2>

                <div className="sq-drawer-menu-list">
                  {/* Category */}
                  <div
                    className="sq-drawer-menu-row"
                    onClick={() => this.setState({ filterDrawerView: "category" })}
                  >
                    <div>
                      <div className="sq-drawer-row-label">Category</div>
                      <div className="sq-drawer-row-sub">
                        {draftCategories.length === 0
                          ? "Any"
                          : draftCategories.length === 1
                          ? draftCategories[0]
                          : `${draftCategories.length} selected`}
                      </div>
                    </div>
                    <ChevronRightIcon />
                  </div>

                  {/* Channel assignment */}
                  <div className="sq-drawer-menu-row">
                    <div>
                      <div className="sq-drawer-row-label">Channel assignment</div>
                      <div className="sq-drawer-row-sub">Any</div>
                    </div>
                    <ChevronRightIcon />
                  </div>

                  {/* Inventory */}
                  <div className="sq-drawer-menu-row">
                    <div>
                      <div className="sq-drawer-row-label">Inventory</div>
                      <div className="sq-drawer-row-sub">All inventory</div>
                    </div>
                    <ChevronRightIcon />
                  </div>

                  {/* Item type */}
                  <div className="sq-drawer-menu-row">
                    <div>
                      <div className="sq-drawer-row-label">Item type</div>
                      <div className="sq-drawer-row-sub">Any</div>
                    </div>
                    <ChevronRightIcon />
                  </div>

                  {/* Discount eligibility */}
                  <div className="sq-drawer-menu-row">
                    <div>
                      <div className="sq-drawer-row-label">Discount eligibility</div>
                      <div className="sq-drawer-row-sub">Any</div>
                    </div>
                    <ChevronRightIcon />
                  </div>

                  {/* Status */}
                  <div
                    className="sq-drawer-menu-row"
                    onClick={() => this.setState({ filterDrawerView: "status" })}
                  >
                    <div>
                      <div className="sq-drawer-row-label">Status</div>
                      <div className="sq-drawer-row-sub">
                        {draftStatuses.length === 0
                          ? "Any"
                          : draftStatuses.length === 2
                          ? "Any"
                          : draftStatuses.join(", ")}
                      </div>
                    </div>
                    <ChevronRightIcon />
                  </div>

                  {/* Stock quantity */}
                  <div className="sq-drawer-menu-row">
                    <div>
                      <div className="sq-drawer-row-label">Stock quantity</div>
                      <div className="sq-drawer-row-sub">Any</div>
                    </div>
                    <ChevronRightIcon />
                  </div>

                  {/* Item contains alcohol */}
                  <div className="sq-drawer-menu-row">
                    <div>
                      <div className="sq-drawer-row-label">Item contains alcohol</div>
                      <div className="sq-drawer-row-sub">Any</div>
                    </div>
                    <ChevronRightIcon />
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    );
  }
}

export default withRouter(Dashboard);
