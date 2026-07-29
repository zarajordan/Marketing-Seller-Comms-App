# Import Events from Event Library into Marketing Spotlight

## Overview

Currently, the Marketing Spotlight tab has its own standalone "Add Event" form. Users must re-enter event details that already exist in the Event Library. This plan:

1. Adds a `category` field (IBM Event / 3rd Party Event / On-Demand/Webinar) to the Event Library's Manage Events form and Supabase `events` table
2. Adds an **"Import from Event Library"** button to Marketing Spotlight that opens a searchable list of active, upcoming events
3. On selection, pre-fills the existing add-event form with all mapped fields — only `featured` is left for the user to set manually

---

## Updated Field Mapping

| Marketing Spotlight field | Event Library field |
|---------------------------|---------------------|
| `title`                   | `title` |
| `date`                    | Formatted from `startDate` + `endDate` |
| `location`                | `locationDetails` |
| `registrationLink`        | `registrationLink` |
| `seismicLink`             | `seismicLink` |
| `category`                | `category` (new field — IBM Event / 3rd Party Event / On-Demand/Webinar) |
| `audience`                | `targetAudience` |
| `contactEmail`            | First entry in `contacts` array → `contacts[0].email` |
| `featured`                | _(defaults to false — user sets manually)_ |

---

## Sub-Tasks

---

### Sub-Task 1 — Add `category` field to the Event Library

**Intent**
Add an IBM Event / 3rd Party Event / On-Demand/Webinar category dropdown to the Manage Events create/edit form and persist it to Supabase, so it can be pulled through to Marketing Spotlight on import.

**Expected Outcomes**
- A "Category" dropdown appears in the Manage Events form with options: IBM Event, 3rd Party Event, On-Demand/Webinar
- The value is saved to and loaded from Supabase via the `events` table (new `category` column)
- Existing events without a category default to `'ibm'` (IBM Event)
- The field is included in `mapEventRowToAppEvent` and `mapEventFormToRow` in `supabaseData.js`

**Todo List**
1. Add a `category` column to the Supabase `events` table via the Supabase dashboard (type: `text`, default: `'ibm'`) — this is a database change, not a code change; note it as a prerequisite
2. Add `category: 'ibm'` to the `EMPTY_FORM` default state in `ManageEventsTab.js`
3. Add a Carbon `Select` dropdown for category to the Manage Events form UI, with options: `ibm` → "IBM Event", `thirdParty` → "3rd Party Event", `onDemand` → "On-Demand/Webinar"
4. Add `category` to `mapEventFormToRow` in `supabaseData.js` so it is written on create/update
5. Add `category` to `mapEventRowToAppEvent` in `supabaseData.js` so it is read on fetch (default `'ibm'` if null)
6. Confirm the field loads correctly when editing an existing event

**Relevant Context**
- File: `src/components/ManageEventsTab.js` — `EMPTY_FORM` at line 42, form UI around line 198+
- File: `src/lib/supabaseData.js` — `mapEventRowToAppEvent` at line 190, `mapEventFormToRow` at line 219
- The category values `'ibm'`, `'thirdParty'`, `'onDemand'` must match exactly what Marketing Spotlight's `eventForm` already uses

**Status:** [ ] pending

---

### Sub-Task 2 — Add "Import from Event Library" button to the Marketing Spotlight toolbar

**Intent**
Place a secondary button next to the existing "Add Event" button so users can trigger the import flow.

**Expected Outcomes**
- A clearly labelled "Import from Event Library" button appears in the Marketing Spotlight event section toolbar
- Clicking it sets a new boolean state flag `importModalOpen` to `true`
- The existing "Add Event" button and all other functionality is unchanged

**Todo List**
1. Add `importModalOpen` state variable (boolean, default `false`) to `MarketingSpotlightTab`
2. Add the "Import from Event Library" button next to the existing "Add Event" button — use Carbon `Button` with `kind="secondary"` and an appropriate icon (e.g. `Download` from `@carbon/icons-react`)
3. Wire the button's `onClick` to set `importModalOpen = true`

**Relevant Context**
- File: `src/components/MarketingSpotlightTab.js`
- Find the existing "Add Event" button to place the new button alongside it
- Follow the Carbon `Button` pattern already used throughout the file

**Status:** [ ] pending

---

### Sub-Task 3 — Build the Event Library picker modal

**Intent**
When `importModalOpen` is true, show a modal containing a searchable list of active, upcoming events fetched from the Event Library. The user picks one event and the modal closes.

**Expected Outcomes**
- A Carbon modal opens when `importModalOpen` is true
- On open, it fetches events via `listEvents()` and filters to only those where `status === 'Active'` and `startDate` is today or in the future
- A Carbon `Search` input filters the displayed list by event title in real time
- Each event is shown as a clickable row displaying: title, formatted date, location
- Clicking a row triggers the field mapping (Sub-Task 4) and closes the modal
- A loading state is shown while events are being fetched
- If no matching events exist, a friendly empty state message is shown

**Todo List**
1. Add state variables: `importEvents` (array), `importLoading` (boolean), `importSearch` (string)
2. Add a `useEffect` that triggers when `importModalOpen` becomes `true`: call `listEvents()`, filter to `status === 'Active'` and `startDate >= today`, store in `importEvents`, set `importLoading = false`
3. Render a Carbon `ComposedModal` (or `Modal`) controlled by `importModalOpen` with a `Search` bar and scrollable list
4. Filter `importEvents` by `importSearch` against `title` (case-insensitive) for real-time search
5. Render each filtered event as a clickable row showing title, formatted date range, and location
6. On row click: call the mapping function (Sub-Task 4), set `importModalOpen = false`

**Relevant Context**
- `listEvents` is exported from `src/lib/supabaseData.js`
- Event object shape includes: `{ title, startDate, endDate, locationDetails, registrationLink, seismicLink, targetAudience, contacts, category, status }`
- Date formatting: if `endDate` exists and differs from `startDate`, format as `"10–12 June"`; otherwise `"30 June"`
- Reuse the same Carbon modal pattern already used in `MarketingSpotlightTab.js`

**Status:** [ ] pending

---

### Sub-Task 4 — Map the selected event into the existing eventForm state

**Intent**
When a user selects an event from the picker, pre-fill the existing `eventForm` state with all mapped fields, then open the existing add-event modal so the user can review, set `featured`, and save.

**Expected Outcomes**
- After selecting an event, the add-event modal opens pre-filled with: title, date (formatted), location, registrationLink, seismicLink, category, audience (from `targetAudience`), contactEmail (from `contacts[0].email` if present)
- `featured` defaults to `false` — the user sets it manually
- The user can edit any pre-filled field before saving
- Saving works exactly the same as the existing `handleAddEvent()` flow — no changes needed there

**Todo List**
1. Write a helper function `mapLibraryEventToForm(libraryEvent)` that returns an `eventForm`-shaped object:
   - `title` → `libraryEvent.title`
   - `date` → formatted date string from `startDate` / `endDate`
   - `location` → `libraryEvent.locationDetails`
   - `registrationLink` → `libraryEvent.registrationLink`
   - `seismicLink` → `libraryEvent.seismicLink`
   - `category` → `libraryEvent.category` (defaults to `'ibm'` if missing)
   - `audience` → `libraryEvent.targetAudience` (defaults to `''` if `'All'`)
   - `contactEmail` → `libraryEvent.contacts?.[0]?.email ?? ''`
   - `featured` → `false`
2. On event row click in the picker modal: call `setEventForm(mapLibraryEventToForm(selectedEvent))`, close the import modal, open the existing add-event modal
3. Ensure `editingEvent` state is `null` so the form is treated as a new addition (not an edit of an existing spotlight event)

**Relevant Context**
- `eventForm` state, `setEventForm`, and `resetEventForm()` are already in `MarketingSpotlightTab.js`
- `contacts` array shape: `[{ name, email, imageUrl }]` — use `contacts[0].email` for the first contact's email
- The existing add-event modal open flag — check `MarketingSpotlightTab.js` near the modal render for the correct state variable name
- `handleAddEvent()` at line 546 handles validation and saving — no changes needed

**Status:** [ ] pending

---

## Prerequisites

Before Sub-Task 1 can be implemented, the following database change must be made manually in the Supabase dashboard:

- **Table:** `events`
- **New column:** `category` — type `text`, nullable, default value `'ibm'`
