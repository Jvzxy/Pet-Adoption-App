# Graph Report - Pet-Adoption-App  (2026-11-05)

## Corpus Check
- Corpus is ~41,055 words - fits in a single context window. You may not need a graph.

## Summary
- 488 nodes · 1286 edges · 56 communities (21 shown, 35 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.83)
- Token usage: unavailable from delegated-agent telemetry (0 input · 0 output recorded)
- Semantic extraction: 35/39 chunks completed; `.github/copilot-instructions.md`, `README.md`, and `src/images/Cats/Cat1.png`–`Cat3.png` were left unstamped for retry with `--update`.

## Community Hubs (Navigation)
- App Navigation and Routing
- Shared Form Components
- App Dependencies
- Product Catalog and UI
- Supabase Auth and Database
- Shopping and Bottom Navigation
- Xendit Payment Backend
- Android App Configuration
- Orders and Location Services
- Driver Map Tracking
- Image Asset Handling
- Checkout and Webhooks
- Order Tracking Screens
- TypeScript Configuration
- Settings Screen
- Admin Delivery Management
- Screen Label Components
- Privacy Policy Screen
- Splash Onboarding One
- Splash Onboarding Two
- Terms of Service Screen
- Brand Logo Assets
- Chevron Icon Asset
- Clock Icon Asset
- Settings Icon Asset
- Favorite Icon Assets
- Sign Out Icon Asset
- Fast Delivery Icon Assets
- JCB Payment Brand
- Google Logo Asset
- Left Angle Icon Asset
- Back Arrow Icon Asset
- Bell Icon Asset
- Box Icon Asset
- Camera Icon Asset
- Shopping Cart Icon Asset
- Checkmark Icon Asset
- Circle Check Icon Asset
- Help Icon Asset
- Clipboard List Icon Asset
- Comment Icon Asset
- Heart Icon Asset
- Home Icon Asset
- Location Marker Asset
- Lock Icon Asset
- Search Icon Asset
- Tag Icon Asset
- Moving Truck Icon Asset
- User Profile Icon Asset
- American Express Payment
- Cash on Delivery Payment
- GCash Payment
- Mastercard Payment
- Maya Payment
- UnionPay Payment
- Visa Payment

## God Nodes (most connected - your core abstractions)
1. `useAppPreferences()` - 88 edges
2. `react` - 51 edges
3. `react-native` - 49 edges
4. `AppColors` - 43 edges
5. `useAuth()` - 43 edges
6. `AppRouter()` - 42 edges
7. `radii` - 24 edges
8. `useAppData()` - 23 edges
9. `supabase` - 20 edges
10. `spacing` - 18 edges

## Surprising Connections (you probably didn't know these)
- `AdminRoute()` --calls--> `useAppPreferences()`  [EXTRACTED]
  App.tsx → src/services/AppPreferencesContext.tsx
- `DriverRoute()` --calls--> `useAppPreferences()`  [EXTRACTED]
  App.tsx → src/services/AppPreferencesContext.tsx
- `ThemedApp()` --calls--> `AppDataProvider()`  [EXTRACTED]
  App.tsx → src/services/AppDataContext.tsx
- `ThemedApp()` --calls--> `useAppPreferences()`  [EXTRACTED]
  App.tsx → src/services/AppPreferencesContext.tsx
- `AppRouter()` --calls--> `AddProductScreen()`  [EXTRACTED]
  App.tsx → src/screens/admin/AddProductScreen.tsx

## Import Cycles
- None detected.

## Communities (56 total, 35 thin omitted)

### Community 0 - "App Navigation and Routing"
Cohesion: 0.07
Nodes (47): AdminRoute(), App(), AppRouter(), createStyles(), DriverRoute(), ThemedApp(), BottomNavigation(), AssignedOrder (+39 more)

### Community 1 - "Shared Form Components"
Cohesion: 0.10
Nodes (42): BrandHeader(), createStyles(), createStyles(), FieldInput(), createStyles(), FieldLabel(), createStyles(), PillButton() (+34 more)

### Community 2 - "App Dependencies"
Cohesion: 0.05
Nodes (51): { getDefaultConfig }, dependencies, expo@~58.0.0, expo-image-picker@~58.0.10, expo-local-authentication@~58.0.2, @expo/metro-runtime@~58.0.16, expo-router@~58.0.26, expo-status-bar@~58.0.4 (+43 more)

### Community 3 - "Product Catalog and UI"
Cohesion: 0.09
Nodes (32): CatItem, AddProductScreen(), createStyles(), ScreenProps, AdminAddCatScreen(), createStyles(), PERSONALITY_OPTIONS, ScreenProps (+24 more)

### Community 4 - "Supabase Auth and Database"
Cohesion: 0.12
Nodes (28): adoption_notify_applicant, on_auth_user_created, one_pending_application_per_pet, orders_notify_customer, orders_notify_payment, public.admin_get_or_create_support_conversation(), public.adoption_applications, public.assign_delivery_driver() (+20 more)

### Community 5 - "Shopping and Bottom Navigation"
Cohesion: 0.09
Nodes (15): BottomNavigationProps, BottomNavigationTab, createStyles(), TABS, createStyles(), FAQS, HelpSupportScreen(), ScreenProps (+7 more)

### Community 6 - "Xendit Payment Backend"
Cohesion: 0.09
Nodes (24): axios, cors, dotenv, express, author, dependencies, axios@^1.21.0, cors@^2.8.6 (+16 more)

### Community 7 - "Android App Configuration"
Cohesion: 0.08
Nodes (24): backgroundColor, foregroundImage, adaptiveIcon, edgeToEdgeEnabled, predictiveBackGestureEnabled, expo, android, icon (+16 more)

### Community 8 - "Orders and Location Services"
Cohesion: 0.16
Nodes (17): expo-location@~58.0.20, react-native-safe-area-context@~5.11.1, expo-location, react-native-safe-area-context, createStyles(), OrderConfirmationScreen(), ScreenProps, createStyles() (+9 more)

### Community 9 - "Driver Map Tracking"
Cohesion: 0.24
Nodes (9): MapCoordinates, OSMMap(), OSMMapProps, styles, ActiveOrder, Coordinates, createStyles(), DriverMapScreen() (+1 more)

### Community 10 - "Image Asset Handling"
Cohesion: 0.20
Nodes (7): *.jpeg, *.jpg, *.png, *.svg, react, ImageHolderProps, styles

### Community 12 - "Order Tracking Screens"
Cohesion: 0.32
Nodes (6): createStyles(), DriverLocation, ScreenProps, TimelineStep(), TrackedOrder, TrackOrderScreen()

### Community 13 - "TypeScript Configuration"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, exclude, extends

### Community 14 - "Settings Screen"
Cohesion: 0.40
Nodes (4): react-native, createStyles(), ScreenProps, SettingsScreen()

### Community 15 - "Admin Delivery Management"
Cohesion: 0.40
Nodes (5): AdminDeliveriesScreen(), createStyles(), DeliveryOrder, Driver, ScreenProps

### Community 16 - "Screen Label Components"
Cohesion: 0.40
Nodes (3): ScreenLabelProps, styles, colors

### Community 17 - "Privacy Policy Screen"
Cohesion: 0.50
Nodes (3): createStyles(), PrivacyPolicyScreen(), ScreenProps

### Community 18 - "Splash Onboarding One"
Cohesion: 0.67
Nodes (3): createStyles(), ScreenProps, Splash1Screen()

### Community 19 - "Splash Onboarding Two"
Cohesion: 0.67
Nodes (3): createStyles(), ScreenProps, Splash2Screen()

### Community 20 - "Terms of Service Screen"
Cohesion: 0.67
Nodes (3): createStyles(), ScreenProps, TermsOfServiceScreen()

### Community 21 - "Brand Logo Assets"
Cohesion: 1.00
Nodes (3): Cat-and-Paw Logo, Curled Cat Silhouette, Paw Print

## Knowledge Gaps
- **42 isolated node(s):** `expo/tsconfig.base`, `Google Logo`, `Solid Left Angle Icon`, `Angle-right chevron icon`, `Font Awesome Free` (+37 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 189 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Image Asset Handling` to `App Navigation and Routing`, `Shared Form Components`, `App Dependencies`, `Product Catalog and UI`, `Shopping and Bottom Navigation`, `Orders and Location Services`, `Driver Map Tracking`, `Order Tracking Screens`, `Settings Screen`, `Admin Delivery Management`, `Screen Label Components`, `Privacy Policy Screen`, `Splash Onboarding One`, `Splash Onboarding Two`, `Terms of Service Screen`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `Google Logo`, `Solid Left Angle Icon` to the rest of the system?**
  _42 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Navigation and Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.06853146853146853 - nodes in this community are weakly interconnected._
- **Why does `react-native` connect `Settings Screen` to `App Navigation and Routing`, `Shared Form Components`, `App Dependencies`, `Product Catalog and UI`, `Shopping and Bottom Navigation`, `Orders and Location Services`, `Driver Map Tracking`, `Image Asset Handling`, `Order Tracking Screens`, `Admin Delivery Management`, `Screen Label Components`, `Privacy Policy Screen`, `Splash Onboarding One`, `Splash Onboarding Two`, `Terms of Service Screen`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `Shared Form Components` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Why does `useAppPreferences()` connect `Shared Form Components` to `App Navigation and Routing`, `Product Catalog and UI`, `Shopping and Bottom Navigation`, `Orders and Location Services`, `Driver Map Tracking`, `Order Tracking Screens`, `Settings Screen`, `Admin Delivery Management`, `Privacy Policy Screen`, `Splash Onboarding One`, `Splash Onboarding Two`, `Terms of Service Screen`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Should `App Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05152394775036284 - nodes in this community are weakly interconnected._