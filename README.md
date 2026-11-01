# Pawfect Cats

Expo React Native app for pet adoption, store orders, customer support, and delivery tracking. User-generated catalog, cart, order, adoption, chat, notification, and profile data is stored in Supabase.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the client-safe values for your Supabase project. Do not use a Supabase `service_role` key in the app.
3. In Supabase SQL Editor, run the complete `supabase/schema.sql`. It creates/updates the tables, access policies, Storage bucket, and database functions used by the app. Re-run it after pulling schema changes; it is written to be re-runnable.
4. No mapping API key is required. Start Expo with `npx expo start -c`.

The app uses Expo's WebView package to render Leaflet and OpenStreetMap tiles. If setting up dependencies manually, install the Expo-compatible native module with `npx expo install react-native-webview`. Leaflet's browser files and map tiles are loaded over the internet; there is no Google Maps dependency or map API key.

## Supabase-backed features

- Catalog pets and products, including uploaded photos, are shared across signed-in devices. The app reads available catalog items publicly; creating and managing items requires the `admin` role. Images are stored in the `catalog-images` bucket created by the schema.
- Favorites and cart contents are saved to the signed-in account. Checkout creates an order through a server-side database function, checks current product availability and variation prices, and charges a fixed ₱100 delivery fee.
- Cash on Delivery works without a payment processor. Card, Maya, and GCash use PayMongo-hosted checkout; payment credentials are entered on PayMongo, never stored in this app. Online payments stay pending until PayMongo's signed webhook confirms payment, and admins cannot assign unpaid online orders.
- Adoption submissions are stored in Supabase. Admins can review pending applications from **Profile → Admin Tools → Review adoption applications**; approval marks the pet unavailable. Applicants receive database notifications when an application is reviewed.
- Support chat stores messages in Supabase and updates through Realtime. Customers start a support conversation from **Chat**; admins can reply from the same screen or select **New** in the admin inbox to start a conversation with a customer. If the admin inbox is empty, no customer has started a conversation yet; use **New** or ask the customer to open Chat. Run the latest schema so the admin conversation RPC is available.
- Notifications are database-backed. Order, adoption, and support replies can generate notifications.
- The app requires signed-in accounts for cart, favorites, orders, applications, notifications, and chat. Catalog browsing is available without a session.
- Catalog entries that existed only in the older device-local storage are not automatically imported. Re-create any listings you still need from the admin tools before uninstalling or clearing that older app installation.

Run the schema in Supabase before using these features. To enable admin tools, promote a trusted account in the SQL Editor:

```sql
update public.users
set role = 'admin'
where lower(username) = lower('admin@example.com');
```

Changing a role does not affect a session already open in the app; sign out and back in after changing it. The SQL schema enforces these roles with row-level security, so hiding admin screens is not the only access control.

## Appearance and biometric payment confirmation

- **Dark Mode** can be toggled in **Profile → Settings**. The preference is saved on the current device and applies across the app, including account, customer, admin, and driver screens. It does not change Supabase data.
- **Biometric payment confirmation** is optional in the same Settings screen. Enable it on a device with biometrics enrolled; the app asks for biometric confirmation before continuing with a non-Cash-on-Delivery payment. The app does not store biometric data or payment credentials.
- `expo-local-authentication` is already included as an Expo SDK-compatible dependency. After native configuration changes, rebuild the development/production app (`npx expo run:android` or an EAS build); a JavaScript reload alone cannot add native permissions or modules.
- Biometric confirmation does not make online payments available by itself. Card, Maya, and GCash still require the optional PayMongo setup below.

## Delivery tracking

- Checkout asks for foreground location permission and saves the device's current GPS coordinates as the order destination. Place the order while at the intended delivery location.
- An administrator creates a driver account, then promotes it in Supabase SQL Editor:

  ```sql
  update public.users
  set role = 'driver'
  where lower(username) = lower('driver@example.com');
  ```

- Admins assign orders from **Profile → Admin Tools → Manage deliveries**; the driver list shows each driver's active/off-duty availability.
- Drivers open **Profile → Driver → My Deliveries**, use **Go active** or **Go off duty** to update their availability for admins, then start assigned deliveries and keep the **Delivery GPS** screen open to share their location. Driver deliveries are filtered to orders assigned to that driver; customer **My Orders** is not shown for driver accounts.
- **My Orders** is shown only to customer accounts and queries rows by the signed-in customer's ID, even though admins can see order records in the separate delivery-management tool to assign drivers.
- Customers can open an order from **My Orders** to see its destination, latest driver position, and delivery status.

Driver GPS is shared only while the driver is using the delivery screen; background tracking and turn-by-turn routing are not enabled. The map uses the public OpenStreetMap tile server, which is free to access but community-operated, rate-limited, and has no uptime guarantee. Follow the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/); for high-traffic production use, select a tile provider or host tiles that meets your usage requirements.

## PayMongo setup (optional)

PayMongo card, GCash, and Maya checkout is disabled until a verified PayMongo account and server-side secrets are configured. Create a PayMongo account and enable the desired payment methods in its dashboard. Then deploy the Edge Functions and store secrets in Supabase (never in `.env.local` or the mobile app):

```powershell
supabase functions deploy create-paymongo-checkout
supabase functions deploy paymongo-webhook
supabase secrets set PAYMONGO_SECRET_KEY=your-server-side-secret
supabase secrets set PAYMONGO_WEBHOOK_SECRET=your-webhook-signing-secret
```

In the PayMongo dashboard, register `https://<project-ref>.supabase.co/functions/v1/paymongo-webhook` as a webhook for `checkout_session.payment.paid`. Use the matching test-mode key and webhook secret while testing; replace them with live-mode secrets only after validating the integration. Finally, set `EXPO_PUBLIC_PAYMONGO_ENABLED=true` in `.env.local` and restart Expo with `npx expo start -c`. Leave it `false` until both functions and the webhook are configured. A custom app build registers the `pawfectcats` return scheme; Expo Go may require returning to the app manually after the hosted payment page, while the verified webhook remains the source of truth.
