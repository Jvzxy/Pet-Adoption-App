---
type: "query"
date: "2026-11-05T17:04:09.610577+00:00"
question: "Why does useAppPreferences() link the screen communities?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["useAppPreferences()", "AppPreferencesProvider()", "useAuth()", "FieldInput()", "SettingsScreen()", "AppRouter()"]
---

# Q: Why does useAppPreferences() link the screen communities?

## Answer

Expanded from the original question via graph vocabulary: [preferences, context, app, navigation, auth, data, settings, theme, provider, user]. The graph records 45 direct calls to useAppPreferences() across 14 communities. The largest are App Navigation and Routing (14 callers), Shared Form Components (12), and Product Catalog and UI (6), with other callers in orders/location, driver delivery/map, settings, policy, onboarding, and tracking. The hook at src/services/AppPreferencesContext.tsx L156 reads the provider context and throws if used outside AppPreferencesProvider (L158); it does not implement theme state itself. App.tsx wraps ThemedApp with AuthProvider then AppPreferencesProvider (L125-L130); the provider uses useAuth and exposes account-specific preferences, colors, and loading state. Components use the hook to obtain colors (e.g. FieldInput.tsx L7 and SettingsScreen.tsx L12). The hook lands in Shared Form Components because its context source is grouped there, even though its direct consumers span many communities. Bypasses: exact guard-string search only matched the hook implementation; there is no separate duplicate of that guard in other source files.

## Outcome

- Signal: useful

## Source Nodes

- useAppPreferences()
- AppPreferencesProvider()
- useAuth()
- FieldInput()
- SettingsScreen()
- AppRouter()