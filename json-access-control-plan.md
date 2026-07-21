# JSON-backed access control and shared data plan

## Top-Level Overview

Add a small backend API so the app can read and write shared JSON files for user management, event management, and other persisted app data. This keeps the frontend usable when published from GitHub while moving shared writes out of the browser. The access model will be simplified to three roles only: `seller`, `marketer`, and `admin-manager`. Sellers can access only the Event Library tab, marketers can access a configurable subset of tabs, and admin managers can access all tabs and manage marketer tab access. The plan keeps the existing tab-based UI pattern in [`src/App.js`](src/App.js:33) and the existing user context pattern in [`src/contexts/UserContext.js`](src/contexts/UserContext.js:61), while replacing hardcoded local-only storage with JSON-backed API calls.

## Sub-Tasks

### 1. Define the shared JSON data contract
- **Intent** — Establish a single source of truth for users, permissions, events, and future persisted app data so both frontend and backend use the same structure.
- **Expected Outcomes** — Separate JSON files exist for users and events, role names are reduced to the required three roles, and marketer permissions are represented explicitly by tab id.
- **Todo List**
  1. Define the JSON file layout for user records, role metadata, tab permissions, and event records.
  2. Decide which existing tabs remain in the app and map them to stable permission ids.
  3. Define how admin-managed marketer permissions are stored in the users JSON.
  4. Define a reusable pattern for future JSON-backed datasets so additional data can follow the same structure.
- **Relevant Context** — [`src/App.js`](src/App.js:33), [`src/contexts/UserContext.js`](src/contexts/UserContext.js:13), [`src/components/UserAccessTab.js`](src/components/UserAccessTab.js:35)
- **Status** — [ ] pending

### 2. Design the backend JSON read and write layer
- **Intent** — Introduce a minimal backend or API layer that owns all file writes, so multiple users can see shared updates and the browser does not attempt to write directly to repo files.
- **Expected Outcomes** — The app has a backend-facing persistence boundary for reading and writing JSON files, with a documented write strategy that reduces file write conflicts.
- **Todo List**
  1. Choose the backend runtime and hosting approach compatible with the published frontend.
  2. Define read endpoints for users, events, and other JSON-backed resources.
  3. Define write endpoints for user management and event management actions.
  4. Define the file-write pattern to avoid overlapping writes, such as server-side serialized writes, write-to-temp then atomic rename, and version checks on updates.
  5. Define validation rules so malformed client payloads do not corrupt shared JSON files.
- **Relevant Context** — [`index.html`](index.html), [`src/contexts/UserContext.js`](src/contexts/UserContext.js:67), [`src/components/UserAccessTab.js`](src/components/UserAccessTab.js:158)
- **Status** — [ ] pending

### 3. Refactor frontend access control to use backend-backed JSON data
- **Intent** — Replace duplicated hardcoded roles and permissions with data loaded from the shared JSON source through the backend.
- **Expected Outcomes** — The app reads shared user data, honors the new three-role model, and filters tabs from backend-backed permissions instead of local hardcoded defaults.
- **Todo List**
  1. Remove hardcoded role and permission definitions that do not match the required model.
  2. Update user initialization and session handling to load users from the backend API.
  3. Update tab access checks so sellers only see Event Library, marketers see admin-assigned tabs, and admin managers see all tabs.
  4. Centralize tab metadata so the same permission ids are used consistently in the app and admin UI.
- **Relevant Context** — [`src/App.js`](src/App.js:101), [`src/contexts/UserContext.js`](src/contexts/UserContext.js:158), [`src/components/LoginPage.js`](src/components/LoginPage.js:21), [`src/components/UserAccessTab.js`](src/components/UserAccessTab.js:53)
- **Status** — [ ] pending

### 4. Update the admin user-management experience
- **Intent** — Preserve the existing User Access screen while changing it to manage shared JSON-backed users and marketer tab permissions through the backend.
- **Expected Outcomes** — Admin managers can create, edit, activate, deactivate, and permission-manage users, and those updates are visible to other users because they are persisted server-side.
- **Todo List**
  1. Restrict user-management capabilities to the `admin-manager` role.
  2. Simplify the role list in the UI to `seller`, `marketer`, and `admin-manager`.
  3. Update the permissions editor so marketer access can be toggled tab by tab.
  4. Define how seller and admin-manager permissions are fixed so they cannot be misconfigured.
  5. Refresh frontend state after writes so shared changes appear immediately.
- **Relevant Context** — [`src/components/UserAccessTab.js`](src/components/UserAccessTab.js:101), [`src/App.js`](src/App.js:242)
- **Status** — [ ] pending

### 5. Move event management and future persisted features to the same JSON pattern
- **Intent** — Ensure event data and other shared datasets follow the same backend-managed JSON storage pattern instead of mixing persistence models.
- **Expected Outcomes** — Event reads and writes use a dedicated events JSON file through the backend, and the project has a repeatable pattern for additional shared JSON-backed data.
- **Todo List**
  1. Inventory current event read and write points in the frontend.
  2. Replace browser-only event persistence with backend API calls backed by an events JSON file.
  3. Document the shared pattern for any new JSON-managed resource.
  4. Verify that users in separate browsers can see the same saved event updates.
- **Relevant Context** — [`src/components/EventsTab.js`](src/components/EventsTab.js), [`src/components/ManageEventsTab.js`](src/components/ManageEventsTab.js)
- **Status** — [ ] pending

### 6. Validate deployment and operational fit
- **Intent** — Confirm the chosen hosting model works for a GitHub-published frontend plus a writable backend/API and shared JSON files.
- **Expected Outcomes** — There is a clear deployment path for the static frontend and backend, and the plan covers how both pieces connect in production.
- **Todo List**
  1. Define where the backend and writable JSON files will be hosted.
  2. Define how the frontend will discover the backend base URL in local and production environments.
  3. Confirm any authentication expectations for admin-only write operations.
  4. Define validation checks for shared reads, writes, and role-based tab access.
- **Relevant Context** — [`package.json`](package.json:6), [`webpack.config.js`](webpack.config.js:37)
- **Status** — [ ] pending
