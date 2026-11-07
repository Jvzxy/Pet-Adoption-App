---
type: "query"
date: "2026-11-05T10:31:11.744957+00:00"
question: "Why does react connect Image Asset Handling to App Navigation and Routing, Shared Form Components, App Dependencies, Product Catalog and UI, Shopping and Bottom Navigation, Orders and Location Services, Driver Map Tracking, Order Tracking Screens, Settings Screen, Admin Delivery Management, Screen Label Components, Privacy Policy Screen, Splash Onboarding One, Splash Onboarding Two, and Terms of Service Screen?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["react", "package.json", "App.tsx", "FieldInput.tsx", "ImageHolder.tsx", "OSMMap.tsx", "TrackOrderScreen.tsx", "SettingsScreen.tsx"]
---

# Q: Why does react connect Image Asset Handling to App Navigation and Routing, Shared Form Components, App Dependencies, Product Catalog and UI, Shopping and Bottom Navigation, Orders and Location Services, Driver Map Tracking, Order Tracking Screens, Settings Screen, Admin Delivery Management, Screen Label Components, Privacy Policy Screen, Splash Onboarding One, Splash Onboarding Two, and Terms of Service Screen?

## Answer

Expanded from the original question via graph vocabulary: [react, image, navigation, form, product, catalog, shopping, orders, location, driver, settings, delivery]. The graph places react at package.json L22 and gives it 51 direct neighbors: 49 imports_from edges across 16 communities, plus package.json imports/declares links. Examples include App.tsx L1, FieldInput.tsx L1, OSMMap.tsx L1, TrackOrderScreen.tsx L1, and SettingsScreen.tsx L1. The bridge exists because React is a shared package dependency imported throughout otherwise distinct UI components and screens. Its Image Asset Handling community label is a clustering label shared with declarations.d.ts and ImageHolder.tsx; it does not mean React is specifically an image utility. Bypasses: not applicable because react is an external package node, not a local utility function with a computation to grep for. Diagnostics report 73 dangling-endpoint edges and 12 collapsed edge groups, so interpret the graph with that limitation.

## Outcome

- Signal: useful

## Source Nodes

- react
- package.json
- App.tsx
- FieldInput.tsx
- ImageHolder.tsx
- OSMMap.tsx
- TrackOrderScreen.tsx
- SettingsScreen.tsx