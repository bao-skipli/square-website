# Square Web Clone - Architecture & Engineering Documentation

## 1. Overview & Technology Constraints
- **Core Technology**: React (100% Class Components / `PureComponent`) + Vanilla CSS.
- **Build Tool**: Vite with `@/` path alias mapping to `src/`.
- **Backend / Realtime**: Firebase Authentication & Firebase Realtime Database.
- **Performance**: Route-level code splitting using `React.lazy` + `Suspense`.

---

## 2. Directory Structure

```
square-clone-2/
├── src/
│   ├── app/
│   │   └── routes.js                     # Central route definitions
│   ├── components/
│   │   ├── layout/                       # Layout components
│   │   │   └── DashboardLayout/          # Header, Sidebar (Nav, Footer), and Content Shell
│   │   ├── ui/                           # Reusable UI primitives (Class components)
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Toggle/
│   │   │   ├── Badge/
│   │   │   └── Icon/                     # Modularized SVG Icon components
│   │   ├── Dashboard/                    # Dashboard assembly & stylesheets
│   │   ├── SignIn/                       # Auth pages
│   │   ├── SignUp/
│   │   ├── VerifyEmail/
│   │   └── Onboarding/                   # Business onboarding flows
│   ├── constants/                        # Centralized static configuration
│   │   ├── dashboardMenus.js
│   │   ├── locales.js
│   │   ├── mccCategories.js
│   │   ├── sampleAddresses.js
│   │   └── signInItems.js
│   ├── features/                         # Feature-driven domain modules
│   │   ├── auth/                         # Showcase carousels & banners
│   │   ├── onboarding/                   # Onboarding sections & disclaimers
│   │   └── dashboard/                    # Dashboard domain logic & sub-views
│   │       ├── common/                   # GenericView, UnsavedChangesModal
│   │       ├── home/                     # HomeOnboardingGrid, HomeMetricsSection, DashboardHomeView
│   │       ├── items/                    # ItemLibraryView, ItemFilterDrawer, ItemFormModal, ItemFormDetails, ItemFormSettings
│   │       ├── categories/               # CategoriesView, CategoryFormModal, ParentCategoryModal, AddItemsModal
│   │       ├── DashboardBase.jsx         # Lifecycle, Firebase subscriptions & delay loader
│   │       ├── DashboardItemController.jsx # Item CRUD & filter drawer handlers
│   │       ├── DashboardCategoryController.jsx # Category CRUD & tree handlers
│   │       ├── dashboardSelectors.js     # Pure filter & search selectors
│   │       └── withRouter.jsx            # React Router 6 HOC for Class components
│   ├── firebase/                         # Firebase auth & realtime database services
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   └── itemService.js
│   ├── styles/                           # Global Design System
│   │   ├── tokens.css                    # CSS variables: colors, typography, spacing, shadows
│   │   ├── base.css                      # Base typography & body styling
│   │   ├── reset.css                     # Modern CSS reset
│   │   ├── variables.css                 # Legacy variables compatibility
│   │   └── global.css                    # Master stylesheet bundle
│   ├── pages/                            # Top-level page wrappers
│   │   └── HomePage.jsx
│   └── util/
│       └── loadingHelper.js              # withMinDelay dual-condition loader
├── jsconfig.json                         # Path alias resolution for IDE
└── vite.config.js                        # Vite alias configuration
```

---

## 3. Design Patterns & Best Practices

### A. React Class Component Hierarchy
To avoid massive monolithic files while maintaining pure React Class component architecture:
1. **Separation of Controller & View**:
   - `DashboardBase`: Handles state initialization, route synchronization, Firebase subscriptions, and dual-delay loading.
   - `DashboardItemController`: Handles Item CRUD operations, image uploads, and the filter drawer.
   - `DashboardCategoryController`: Handles Category CRUD, tree nesting, and popup selection modals.
   - `Dashboard`: Focuses purely on composing layout, feature views, and overlays.
2. **File Size Budget**:
   - Every file is kept under ~150–200 lines for maximum readability and ease of maintenance.
3. **PureComponent for Rendering Performance**:
   - Heavy visual elements (all Icons, UI buttons, table rows, badges) extend `React.PureComponent` to prevent unnecessary re-renders.

### B. Realtime Firebase & Dual-Delay Loading
- All Items and Categories are stored in Firebase Realtime Database.
- Loading indicator follows the strict rule:
  - Turns off only when **both** conditions are met:
    1. Initial snapshot from Firebase listener has arrived.
    2. Minimum display time (`MIN_LOADING_MS = 300ms`) has elapsed.
  - Tab transitions between already-cached views use a smooth 300ms transition without redundant network calls.

### C. Design Tokens & Styling
- All CSS variables are centralized in `src/styles/tokens.css` with semantic naming:
  - Colors: `--sq-color-primary`, `--sq-color-bg-base`, `--sq-color-border-subtle`, etc.
  - Spacing: `--sq-space-xs` through `--sq-space-3xl`.
  - Radius: `--sq-radius-sm` through `--sq-radius-full`.
  - Typography: System font stack with fluid font-size tokens.

---

## 4. How to Add a New Dashboard View
1. Add menu metadata in `src/constants/dashboardMenus.js`.
2. Create your view component in `src/features/dashboard/<feature-name>/<FeatureView>.jsx` extending `React.PureComponent`.
3. In `DashboardLayout` / `DashboardSidebarNav`, the menu item will link to your view.
4. If the view requires persistence, add subscription and helper methods to `src/firebase/itemService.js`.
