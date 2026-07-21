# Supabase migration plan for shared users, permissions, and events

## Top-Level Overview

Keep the frontend hosted from GitHub and move shared persistence to Supabase. The frontend will keep the current custom login screen behavior from [`src/components/LoginPage.js`](src/components/LoginPage.js:13), but user records, role-based tab permissions, and event data will be loaded from and written to Supabase instead of browser-only storage. The client integration will use the Supabase project URL and publishable key only; the exposed secret key must not be used in this frontend and should be rotated in Supabase. The current access-control model in [`src/App.js`](src/App.js:33) and [`src/contexts/UserContext.js`](src/contexts/UserContext.js:61) will be simplified to the three required roles: `seller`, `marketer`, and `admin-manager`.

## Sub-Tasks

### 1. Add the Supabase client foundation
- **Intent** — Install and configure the minimal client-side Supabase integration required for the GitHub-hosted frontend to reach shared data in Supabase.
- **Expected Outcomes** — The project includes the Supabase JavaScript client, client configuration is centralized, and the frontend reads environment-based connection settings without embedding the secret key.
- **Todo List**
  1. Add the required npm dependency for the Supabase client.
  2. Add a small shared client module for connecting to Supabase.
  3. Configure the frontend to read the Supabase URL and publishable key from environment-aware configuration.
  4. Ensure the secret key is not referenced anywhere in frontend code or committed configuration.
- **Relevant Context** — [`package.json`](package.json:10), [`webpack.config.js`](webpack.config.js:4)
- **Status** — [x] complete

### 2. Define the Supabase data model for users, roles, permissions, and events
- **Intent** — Replace local-only JSON-style state with a shared relational structure that still supports the app’s current behavior and required role rules.
- **Expected Outcomes** — A clear schema exists for users, role labels, marketer tab permissions, and events, with the three required roles and stable tab ids matching the frontend.
- **Todo List**
  1. Define the `users` table fields needed to support the current custom login flow and active status.
  2. Define how marketer tab permissions will be stored, such as a dedicated permissions table or a permissions field keyed by tab id.
  3. Define how seller and admin-manager permissions remain fixed and enforced.
  4. Define the `events` table structure needed for current event-library and event-management screens.
  5. Map existing frontend tab ids to the stored permission ids used by Supabase.
- **Relevant Context** — [`src/App.js`](src/App.js:33), [`src/contexts/UserContext.js`](src/contexts/UserContext.js:13), [`src/components/UserAccessTab.js`](src/components/UserAccessTab.js:43)
- **Status** — [ ] pending

### 3. Refactor user session and access control to load from Supabase
- **Intent** — Keep the current custom login UI while moving user lookup, session initialization, and permission evaluation to shared Supabase-backed data.
- **Expected Outcomes** — Login resolves against Supabase-backed user data, the app no longer depends on `app_users` and `app_session` as the source of truth, and tab visibility reflects shared permissions.
- **Todo List**
  1. Update the user context to fetch users and current-user data from Supabase.
  2. Preserve the existing login-screen flow while replacing browser-only user lookup.
  3. Update permission evaluation so sellers only see Event Library, marketers see admin-assigned tabs, and admin managers see all tabs.
  4. Remove hardcoded role sets and duplicated default permissions that conflict with the required model.
  5. Keep only minimal client-side session state needed for the current custom login behavior.
- **Relevant Context** — [`src/contexts/UserContext.js`](src/contexts/UserContext.js:61), [`src/components/LoginPage.js`](src/components/LoginPage.js:27), [`src/App.js`](src/App.js:101)
- **Status** — [ ] pending

### 4. Update the user-management screen to persist through Supabase
- **Intent** — Keep the existing user-management experience but make it manage shared Supabase-backed records instead of local browser storage.
- **Expected Outcomes** — Admin managers can create, edit, activate, deactivate, and manage marketer tab access in a way that is visible to all users across browsers.
- **Todo List**
  1. Restrict user-management capabilities to the `admin-manager` role.
  2. Replace the current role list with `seller`, `marketer`, and `admin-manager`.
  3. Update create, edit, activate, deactivate, and delete operations to call Supabase.
  4. Update the permissions modal so marketer tab access is stored and refreshed from Supabase.
  5. Ensure admin-manager and seller permissions are handled consistently with the intended fixed rules.
- **Relevant Context** — [`src/components/UserAccessTab.js`](src/components/UserAccessTab.js:101), [`src/contexts/UserContext.js`](src/contexts/UserContext.js:158)
- **Status** — [ ] pending

### 5. Move event data to Supabase-backed shared persistence
- **Intent** — Replace browser-only event storage with shared event data so all users see the same event library and event management updates.
- **Expected Outcomes** — Event reads and writes use Supabase, and the Event Library and Manage Events screens operate on shared data.
- **Todo List**
  1. Inspect current event-loading and event-saving flows in the event-related components.
  2. Replace browser-only event persistence with Supabase reads and writes.
  3. Ensure event updates become visible across sessions and browsers.
  4. Preserve existing event-related UI behavior unless a schema change requires a minimal adjustment.
- **Relevant Context** — [`src/components/EventsTab.js`](src/components/EventsTab.js), [`src/components/ManageEventsTab.js`](src/components/ManageEventsTab.js)
- **Status** — [ ] pending

### 6. Validate GitHub-hosted frontend plus Supabase deployment
- **Intent** — Confirm the final architecture works for a static frontend hosted in GitHub with Supabase providing shared storage and API access.
- **Expected Outcomes** — The app has a clear deployment configuration for local and production environments, and the migration includes validation for role-based tab access and shared data behavior.
- **Todo List**
  1. Define how the GitHub-hosted frontend receives the Supabase URL and publishable key.
  2. Define local-development and production configuration handling.
  3. Validate login behavior, shared user updates, shared event updates, and tab visibility rules.
  4. Confirm no frontend path uses the secret key.
- **Relevant Context** — [`index.html`](index.html), [`package.json`](package.json:6), [`webpack.config.js`](webpack.config.js:37)
- **Status** — [ ] pending
