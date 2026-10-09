# UKI Strategic Partnerships Tab — Technical Design Plan

## Top-Level Overview

Build a new "UKI Strategic Partnerships" tab in the existing React + Carbon Design System app. The tab surfaces per-partner content (Adobe, AWS, Microsoft, SAP, Salesforce, Google, Palo Alto Networks, Oracle) including partner overviews, contacts, activities, stories, assets, and social kits. A top-of-page achievements carousel and a persistent page-owner callout (hardcoded, Yasmin Hardaker's details) anchor the page.

Phase 1 delivers a complete, shippable feature: full admin CRUD on all major sections, all content readable by all roles, seller achievement submission, and a working carousel. Phase 2 captures engagement (reactions, comments, view counts), org charts, governance versioning, and the dynamic section builder.

All patterns follow existing conventions: `isAdmin` checks, modal CRUD forms, `getOrFetch` cache, `uploadEventDocument`-style Supabase storage uploads, and the `TAB_COMPONENTS` / `SIDEBAR_SECTIONS` registration in `App.js`.

---

## Confirmed Design Decisions

| # | Question | Decision |
|---|----------|----------|
| 1 | Logo Lock-Up | Badge (approved/not-approved) + admin-editable HTML guidance field. Full doc viewer → Phase 2. |
| 1 | Business Resources toolkit | Separate section from per-partner assets. Business Resources = cross-partner guide for all SP teams (one shared table, `partner_slug = null`). Per-partner assets (case studies, blogs, IBVs) = `sp_assets` table scoped to that partner. |
| 1 | Team Org Chart | Phase 2 full tree component. Phase 1: a simple admin-managed **Team Members list** per partner (name, role, contact link) stored in `sp_team_members` — displayed as a flat list/grid, easy to update. |
| 2 | Assets split | `sp_assets` = per-partner assets only. `sp_business_resources` = separate table for cross-partner business toolkit content (not partner-scoped). |
| 3 | Achievement approval flow | Pending achievements route through the **existing For Review tab**, with a clearly labelled "Strategic Partnerships" section — not a separate panel inside the SP tab. Follows exact ForReviewTab pattern. |
| 4 | Data loading | **Lazy load** per-partner sub-data. The root tab loads only `sp_partners` and `sp_achievements` on mount. Each partner's contacts, activities, stories, assets, social kits, and team members load when that partner's accordion item is first opened (on-demand, then cached). |
| 5 | Page owner callout | **Hardcoded** — no DB table. Yasmin's name, title, email, phone, and photo are static constants in the component. No `sp_page_config` table needed. |
| 6 | Sidebar placement | New **"Partners"** section in `SIDEBAR_SECTIONS` (between Client Stories and Social). Starts with `strategic-partnerships`; positioned to accommodate Select and Service tabs in future. |

---

## Scope Decision: Phase 1 vs. Phase 2

### Phase 1 — Build Now (fully shippable)

| Section | Scope Decision |
|---------|---------------|
| Page owner callout (Yasmin) | Hardcoded static component — no DB |
| Achievements Carousel | Full — 4–5 cards, auto-rotate, admin CRUD, seller submission → For Review tab |
| Per-partner sections (8 partners) | Lazy-loading accordion — data fetched on first open |
| Partner overview + logo | Admin-managed via DB, seeded with placeholder copy |
| Partner contacts | Admin CRUD — name, title, photo, email |
| Team Members list | Admin CRUD — name, role, contact link (flat list; replaces org chart for Phase 1) |
| Activities (events/webinars) | Admin CRUD, upcoming/recent tabs, links out to registration |
| Success Stories & Blogs | Admin CRUD, content-type filter, thumbnail, description |
| Per-partner Assets & Resources | Admin CRUD — file/link upload, type, date, download button (case studies, blogs, IBVs, etc.) |
| Business Resources | Shared cross-partner toolkit section — admin CRUD, asset type filter, download. Shown once at top of page (not repeated per partner) |
| Social Kits | Admin CRUD per partner — post copy, graphics, downloadable assets |
| Logo Lock-Up Agreements | Badge + admin-editable HTML guidance field per partner |
| Tab-level search | Filters activities, stories, and assets across all partners |
| Tab registration | New "Partners" sidebar section, all roles, TAB_COMPONENTS |
| Admin CMS | Modal forms, isAdmin guard, supabaseData functions — all matching existing patterns |
| Achievement review | Pending submissions visible in For Review tab under "Strategic Partnerships" section |

### Phase 2 — Future

| Section | Reason Deferred |
|---------|----------------|
| Reactions / Comments / View counts | Requires new tables + realtime + UI; significant scope |
| Featured Partner Dashboard (metrics) | Requires aggregation queries + separate dashboard component |
| Team Org Chart | Bespoke org tree component; no existing pattern to extend |
| Dynamic section builder | "Add new sections without dev" requires a meta-schema layer; complex admin UX |
| Governance fields | Audit trail / versioning infra; deferred until content matures |
| Global cross-tab search | Phase 1 covers tab-scoped search; cross-tab indexing is a separate feature |
| Drag-and-drop reordering | Phase 1 uses up/down arrow buttons |
| Pending badge in sidebar nav | Achievement submission count badge on For Review tab entry |

**Tradeoffs explicitly noted:**
- Team Org Chart → replaced by a simple flat Team Members list for Phase 1. Same DB pattern as contacts; admin can update names/roles without a dev.
- Business Resources is a single shared section (shown once, not per partner) because it is guidance for all SP teams, not partner-specific content.
- Achievement submissions follow the exact ForReviewTab approval workflow — no new review infrastructure needed.
- Page owner callout is hardcoded, removing one DB table and an admin form from scope.

---

## Data Model

### Guiding Principles
- All tables follow snake_case column names, mapped to camelCase in app code.
- `partner_slug` (e.g., `'aws'`, `'microsoft'`) is the FK across per-partner tables.
- All image/file columns store public Supabase Storage URLs (not base64).
- `display_order` integer column on all tables enables admin reordering (Phase 1: up/down arrows).
- `status` column (`'active'` | `'pending'` | `'archived'`) used on achievements only (approval flow).
- Business Resources table has no `partner_slug` — it is global/shared.

---

### Table: `sp_achievements`
Achievements carousel items.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text | Required |
| partner_slug | text | e.g. 'aws' — display name derived from sp_partners |
| hero_image_url | text | Storage URL |
| achievement_date | date | |
| short_overview | text | Card preview text |
| full_summary | text | HTML (RichTextEditor output) |
| links | jsonb | Array of {label, url} |
| extra_images | jsonb | Array of {url, caption} |
| is_featured | boolean | Admin pin — featured achievements shown first |
| status | text | 'active' \| 'pending' \| 'archived' |
| submitted_by_email | text | Seller who submitted |
| display_order | integer | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> **Seeded** with 3–4 placeholder active achievements. Sellers submit (→ pending); admin approves via For Review tab (→ active) or deletes.

---

### Table: `sp_partners`
Partner-level metadata. One row per partner (8 rows total).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| slug | text UNIQUE | 'adobe' \| 'aws' \| 'microsoft' \| 'sap' \| 'salesforce' \| 'google' \| 'palo-alto' \| 'oracle' |
| display_name | text | e.g. 'Amazon Web Services (AWS)' |
| logo_url | text | Storage URL |
| overview_html | text | HTML — strategic focus, UKI priorities, value prop, key solutions |
| logo_lockup_status | text | 'approved' \| 'not-approved' |
| logo_lockup_guidance | text | HTML guidance text (RichTextEditor) |
| display_order | integer | Partners sort order in accordion |
| is_active | boolean | Show/hide partner section |
| updated_at | timestamptz | |

> **Seeded** with all 8 partners and placeholder copy. Admin edits via modal.

---

### Table: `sp_contacts`
Named partner contacts per partner.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| partner_slug | text | |
| name | text | |
| job_title | text | |
| photo_url | text | Storage URL |
| email | text | |
| display_order | integer | |
| created_at | timestamptz | |

> **Admin managed.** Seeded with 1–2 placeholders per partner.

---

### Table: `sp_team_members`
IBM-side team members per partner (Phase 1 replacement for Org Chart).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| partner_slug | text | |
| name | text | |
| role | text | e.g. 'Partner Lead', 'Technical Architect' |
| contact_link | text | Email or LinkedIn URL |
| display_order | integer | |
| created_at | timestamptz | |

> **Admin managed.** Seeded with 1–2 placeholders per partner. Displayed as a flat list/grid — not a tree.

---

### Table: `sp_activities`
Events, webinars, workshops per partner.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| partner_slug | text | |
| title | text | |
| activity_type | text | 'Event' \| 'Webinar' \| 'Workshop' \| 'Other' |
| description | text | |
| activity_date | date | |
| registration_url | text | |
| recording_url | text | Optional — populated after event |
| display_order | integer | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> Upcoming vs. Recent is computed in-app: `activity_date >= today` → Upcoming, else Recent.
> **Admin managed.** Seeded with 1–2 per partner.

---

### Table: `sp_stories`
Success stories and blogs per partner.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| partner_slug | text | |
| title | text | |
| content_type | text | 'Case Study' \| 'Blog' \| 'Video' \| 'Podcast' \| 'Infographic' \| 'Webinar' |
| thumbnail_url | text | Storage URL |
| description | text | |
| story_date | date | |
| external_url | text | |
| display_order | integer | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> **Admin managed.** Seeded with 1–2 per partner.

---

### Table: `sp_assets`
Per-partner files and links (case studies, IBVs, decks, blogs, specific partner materials).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| partner_slug | text | Required — always partner-scoped |
| title | text | |
| asset_type | text | 'PDF' \| 'Deck' \| 'Link' \| 'IBV' \| 'Case Study' \| 'Template' \| 'Other' |
| file_url | text | Storage URL or external link |
| description | text | |
| asset_date | date | |
| display_order | integer | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> **Admin managed.** Seeded with 1–2 per partner.

---

### Table: `sp_business_resources`
Cross-partner shared business toolkit (event planning, comms, branding, measurement, approval guidance). **No partner_slug** — this is global content shown once at the top of the tab.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text | |
| resource_type | text | 'Event Planning' \| 'Comms' \| 'Branding' \| 'Measurement' \| 'Approval' \| 'Other' |
| file_url | text | Storage URL or external link |
| description | text | |
| resource_date | date | |
| display_order | integer | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> **Admin managed.** Seeded with 2–3 placeholder items across categories.

---

### Table: `sp_social_kits`
Social kit items per partner.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| partner_slug | text | |
| title | text | |
| post_copy | text | Ready-to-use social post copy |
| graphic_url | text | Storage URL |
| downloadable_assets | jsonb | Array of {label, url} |
| display_order | integer | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

> **Admin managed.** Seeded with 1 per partner.

---

### Storage Paths (in existing `event-documents` bucket)

| Content | Path Prefix |
|---------|------------|
| Achievement hero images | `sp-achievements/` |
| Partner logos | `sp-partner-logos/` |
| Contact photos | `sp-contacts/` |
| Story thumbnails | `sp-stories/` |
| Social kit graphics | `sp-social-kits/` |
| Per-partner assets | `sp-assets/` |
| Business resource files | `sp-business-resources/` |

---

## Component Breakdown

### New Components

| Component | File | Purpose |
|-----------|------|---------|
| `StrategicPartnershipsTab` | `src/components/StrategicPartnershipsTab.js` | Root tab component — loads achievements + partners on mount; passes lazy-load trigger to accordion; owns search state |
| `SpPageOwnerCallout` | Inline in `StrategicPartnershipsTab` | Hardcoded Yasmin Hardaker contact card |
| `SpBusinessResourcesSection` | Inline in `StrategicPartnershipsTab` | Global business toolkit section — shown once at top of tab, above partner accordion |
| `SpAchievementsCarousel` | `src/components/sp/SpAchievementsCarousel.js` | Auto-rotate carousel (20s), prev/next arrows, admin CRUD, seller submit button |
| `SpAchievementCard` | Inline in `SpAchievementsCarousel` | Single card: hero image, title, partner, date, short overview, View More |
| `SpPartnerAccordion` | `src/components/sp/SpPartnerAccordion.js` | Carbon Accordion wrapping all 8 `SpPartnerSection` items; triggers lazy-load on first open |
| `SpPartnerSection` | `src/components/sp/SpPartnerSection.js` | Single partner — renders all sub-sections once data is loaded; shows loading skeleton until ready |
| `SpContactsSection` | Inline in `SpPartnerSection` | Contact card grid, admin CRUD |
| `SpTeamMembersSection` | Inline in `SpPartnerSection` | Team member flat list/grid, admin CRUD |
| `SpActivitiesSection` | Inline in `SpPartnerSection` | Upcoming/Recent Carbon Tabs, activity cards, admin CRUD |
| `SpStoriesSection` | Inline in `SpPartnerSection` | Story cards, content-type filter, admin CRUD |
| `SpAssetsSection` | Inline in `SpPartnerSection` | Per-partner asset list, type filter, download buttons, admin CRUD |
| `SpSocialKitsSection` | Inline in `SpPartnerSection` | Social kit cards, copy-to-clipboard, graphic, downloadable links, admin CRUD |
| `SpLogoLockupSection` | Inline in `SpPartnerSection` | Approved/Not-Approved badge + HTML guidance (RichTextEditor for admin edit) |
| `SubmitAchievementModal` | Inline in `StrategicPartnershipsTab` | Seller submission form (title, partner, date, overview, hero image); submits with status:'pending' |

### Reused from Existing Codebase

| Component / Pattern | Where Reused |
|---------------------|-------------|
| `RichTextEditor` | Partner overview HTML, achievement full summary, logo lockup guidance |
| Carbon `Modal` | All admin CRUD modals, expanded achievement view, seller submission, delete confirms |
| Carbon `Accordion`, `AccordionItem` | Per-partner sections |
| Carbon `Tabs`, `TabList`, `Tab`, `TabPanels` | Upcoming/Recent in Activities; content-type filter in Stories |
| Carbon `Button`, `TextInput`, `Select`, `DatePicker`, `TextArea` | All form fields |
| Carbon `Tag` | Content type badges, activity type badges, logo lockup badge |
| Carbon `InlineLoading` / `SkeletonText` | Lazy-load placeholder while partner data fetches |
| Carbon `ToastNotification` | Save/upload/delete feedback |
| `isAdmin` check pattern (`OnDemandTab`) | All admin guards |
| `uploadEventDocument`-style upload | All image/file uploads → Supabase storage |
| `getOrFetch` + `invalidate` cache | All data functions |
| ForReviewTab approval pattern | Achievement pending → active flow (handled in ForReviewTab, not in SP tab) |

---

## Admin CMS Approach

All admin management follows the **OnDemandTab** pattern exactly:

1. **Guard:** `const isAdmin = currentUser?.role === 'admin-manager'`
2. **Add:** "Add [Thing]" button shown only to admins; opens modal with empty form state
3. **Edit:** Edit button on each card/row — `openEdit(item)` copies item into form state; `editingId` set
4. **Delete:** Danger `Modal` confirmation → calls delete function → reloads list → toast
5. **Save:** async handler calls create/update supabaseData function → closes modal → reloads list → toast
6. **Reorder:** `display_order` integer — admin sees ↑/↓ arrow buttons; swaps order values of adjacent items
7. **Image/File Upload:** File stored in local state, `URL.createObjectURL` for preview, uploaded to Supabase storage on save, public URL persisted to DB

### Achievement Approval Flow (via For Review Tab)
- Seller clicks "Submit Achievement" → `SubmitAchievementModal` → inserted with `status: 'pending'`
- `ForReviewTab` gains a new "Strategic Partnerships" collapsible section listing pending achievements
- Admin approves (→ `status: 'active'`, appears in carousel) or returns/deletes
- No new approval infrastructure — reuses existing `updateSpAchievement({ status: 'active' })` call pattern from ForReviewTab

### Partner Overview Edit
- Admin edit button on each partner accordion header → full modal with: logo upload, `RichTextEditor` for overview HTML, logo lockup status Select, `RichTextEditor` for lockup guidance

---

## State Management

### Local Component State
- Form data and file objects during modal editing (transient)
- UI state: which accordion is open, which tab is active (activities upcoming/recent), filter selections, search query, carousel index
- `isModalOpen`, `editingId`, `deleteConfirm`, `saving`, `expandedAchievementId` booleans/values
- File preview URLs (`URL.createObjectURL` — revoked on unmount)

### Supabase (persisted)
- All content: achievements, partners, contacts, team members, activities, stories, assets, business resources, social kits

### Data Loading Strategy
- **On tab mount:** `Promise.all([listSpAchievements(), listSpPartners(), listSpBusinessResources()])` — lightweight, only 3 calls
- **On accordion open (first time per partner):** `Promise.all([listSpContacts(slug), listSpTeamMembers(slug), listSpActivities(slug), listSpStories(slug), listSpAssets(slug), listSpSocialKits(slug)])` — 6 calls, triggered once, result cached
- `SpPartnerSection` tracks `loaded` boolean in local state; shows Carbon `SkeletonText` until data arrives
- **After any write:** `invalidate(cacheKey)` → reload only the affected list for that partner/section
- Search state lives in root `StrategicPartnershipsTab` and is passed as prop to all sections; each section filters its own data against the search string

### Cache Keys
```
'sp-achievements'
'sp-achievements:pending'       ← used by ForReviewTab
'sp-partners'
'sp-business-resources'
'sp-contacts:{slug}'
'sp-team-members:{slug}'
'sp-activities:{slug}'
'sp-stories:{slug}'
'sp-assets:{slug}'
'sp-social-kits:{slug}'
```

---

## Tab Registration

### `src/App.js` changes

**Import:**
```js
import StrategicPartnershipsTab from './components/StrategicPartnershipsTab';
```
(Eager import — follows existing non-lazy pattern for all current tabs.)

**TAB_COMPONENTS** — add:
```js
'strategic-partnerships': StrategicPartnershipsTab,
```

**SIDEBAR_SECTIONS** — add new section after Client Stories:
```js
{
  label: 'Partners',
  items: [
    { id: 'strategic-partnerships', label: 'UKI Strategic Partnerships' }
  ]
}
```
Designed to accommodate future 'select' and 'service' tab items in the same section.

### `src/lib/supabaseData.js` changes

**TAB_PERMISSIONS** array — add `'strategic-partnerships'`

**`getDefaultPermissions(role)`** — add `'strategic-partnerships'` to:
- `'marketing'` defaults
- `'seller'` defaults

`'admin-manager'` already receives all tabs — no change needed.

---

## Phasing

### Phase 1 — Complete & Shippable (13 sub-tasks)

**Sub-Task 1: Supabase Tables + Seed Data**
- Create all 8 tables: `sp_achievements`, `sp_partners`, `sp_contacts`, `sp_team_members`, `sp_activities`, `sp_stories`, `sp_assets`, `sp_business_resources`, `sp_social_kits`
- Seed: 4 active placeholder achievements, 8 partner rows with real names/slugs, 1–2 rows in each per-partner table for each partner, 2–3 business resources

**Sub-Task 2: supabaseData.js — SP Data Functions**
- list/create/update/delete functions for all 8 tables
- Upload functions: `uploadSpImage(file, folder)` — reuses `uploadEventDocument` pattern with `sp-*` path prefixes
- Cache integration: `getOrFetch` with keys above, `invalidate` on all writes
- Pending achievements query: `listSpAchievements({ status: 'pending' })` for ForReviewTab

**Sub-Task 3: Tab Registration + Permissions**
- `TAB_COMPONENTS`, `SIDEBAR_SECTIONS` ("Partners" section), `TAB_PERMISSIONS`, `getDefaultPermissions`

**Sub-Task 4: Root Tab Component + Page Owner Callout + Business Resources Section**
- `StrategicPartnershipsTab.js`: mounts achievements + partners + business resources data
- Hardcoded `SpPageOwnerCallout` (name, title, email, phone, photo as static import or URL constant)
- `SpBusinessResourcesSection`: global resource list with type filter, download buttons, admin CRUD

**Sub-Task 5: Achievements Carousel**
- `SpAchievementsCarousel.js`: auto-rotate interval (clearInterval on unmount), prev/next controls, card dots indicator
- `SpAchievementCard`: hero image, partner tag, date, short overview, "View More" button
- Expanded view: full Carbon `Modal` with RichTextEditor-rendered HTML, extra images, links
- Admin CRUD modal: title, partner select, hero image upload, date, short overview, full summary (RichTextEditor), links array, is_featured toggle
- Seller submit button → `SubmitAchievementModal` (title, partner select, date, overview, hero image) → status:'pending'
- `is_featured` items always appear first in carousel order

**Sub-Task 6: Per-Partner Accordion + Partner Overview + Logo Lock-Up**
- `SpPartnerAccordion.js`: Carbon Accordion with 8 AccordionItems; `onHeadingClick` triggers lazy-load
- `SpPartnerSection.js`: skeleton → loaded state; partner logo, `overview_html` rendered as HTML, logo lockup badge + guidance
- Admin edit modal: logo upload, RichTextEditor for overview, lockup status Select, RichTextEditor for lockup guidance, is_active toggle

**Sub-Task 7: Partner Contacts Section**
- Contact card grid (photo circle, name, title, email link)
- Admin add/edit modal: name, title, email, photo upload (Supabase storage)
- Admin delete confirm modal

**Sub-Task 8: Team Members Section**
- Flat list/grid: name, role badge, contact link (email or LinkedIn)
- Admin add/edit modal: name, role TextInput, contact_link TextInput
- Admin delete confirm modal

**Sub-Task 9: Activities Section**
- Carbon Tabs: Upcoming / Recent (computed from `activity_date` vs. today)
- Activity card: type Tag badge, title, date, description, "Register" or "Watch Recording" button (conditional on URLs)
- Admin add/edit modal: title, activity_type Select, description, date, registration_url, recording_url
- Admin delete confirm modal

**Sub-Task 10: Stories Section**
- Story cards grid: thumbnail, content_type Tag, title, date, description, "Read More" button
- Content type filter bar (All + 6 types)
- Admin add/edit modal: title, content_type Select, thumbnail upload, description, date, external_url
- Admin delete confirm modal

**Sub-Task 11: Per-Partner Assets Section**
- Asset list rows: type icon, title, description, date, download/open button
- Asset type filter (All + 7 types)
- Admin add/edit modal: title, asset_type Select, file upload OR external URL TextInput, description, date
- Admin delete confirm modal

**Sub-Task 12: Social Kits Section**
- Social kit cards: title, post copy block with copy-to-clipboard button, graphic image thumbnail, downloadable asset link list
- Admin add/edit modal: title, post_copy TextArea, graphic upload, downloadable_assets array (label + URL pairs, add/remove rows)
- Admin delete confirm modal

**Sub-Task 13: For Review Tab — SP Achievements Section**
- Add "Strategic Partnerships Achievements" collapsible section to existing `ForReviewTab.js`
- Loads pending achievements via `listSpAchievements({ status: 'pending' })`
- Each row: title, partner, submitted by, date, Approve / Delete buttons
- Approve: `updateSpAchievement({ id, status: 'active' })` → invalidate cache → reload list
- Delete: danger modal → `deleteSpAchievement(id)` → reload list

**Sub-Task 14: Tab-Level Search**
- Search TextInput in root tab header
- Search string passed as prop to `SpBusinessResourcesSection` and each `SpPartnerSection`
- Each section filters its own rendered items against title/description fields
- When search is active, all accordion items auto-expand; when cleared, return to user's previous state

### Phase 2 — Future

- Reactions, comments, view counts (new tables + realtime subscription)
- Featured Partner Dashboard with aggregated metrics widget
- Full Team Org Chart (bespoke tree component per partner — replaces Team Members list)
- Dynamic section builder (meta-schema for admin-defined sections without dev involvement)
- Governance fields (content owner, last updated, review frequency displayed on each section)
- Global cross-tab search integration
- Drag-and-drop reordering (replaces up/down arrows)
- Pending achievement badge/count on For Review tab sidebar item
- `sp_page_config` DB table if Yasmin's details need to be admin-editable in future

---

## Relevant Files & Patterns

| File | Relevance |
|------|-----------|
| `src/App.js` lines 53–124 | TAB_COMPONENTS, SIDEBAR_SECTIONS, tab registration pattern |
| `src/lib/supabaseData.js` | getOrFetch, uploadEventDocument, CRUD patterns, TAB_PERMISSIONS, getDefaultPermissions |
| `src/components/OnDemandTab.js` | Primary admin CRUD modal pattern — replicate for every SP section |
| `src/components/ForReviewTab.js` | Approval flow pattern + section structure to extend for Sub-Task 13 |
| `src/components/SubmitEventTab.js` | Seller submission form pattern for SubmitAchievementModal |
| `src/components/RichTextEditor.js` | Props: value, onChange, placeholder, minHeight, label |
| `src/components/MarketingSpotlightTab.js` | Card layout and pinning pattern reference |

---

## Sub-Task Status Tracker

- [x] Sub-Task 1: Supabase Tables + Seed Data — done
- [x] Sub-Task 2: supabaseData.js — SP Data Functions — done
- [x] Sub-Task 3: Tab Registration + Permissions — done
- [x] Sub-Task 4: Root Tab Component + Page Owner Callout + Business Resources — done
- [x] Sub-Task 5: Achievements Carousel — done
- [x] Sub-Task 6: Per-Partner Accordion + Partner Overview + Logo Lock-Up — done
- [x] Sub-Task 7: Partner Contacts Section — done
- [x] Sub-Task 8: Team Members Section — done
- [x] Sub-Task 9: Activities Section — done
- [x] Sub-Task 10: Stories Section — done
- [x] Sub-Task 11: Per-Partner Assets Section — done
- [x] Sub-Task 12: Social Kits Section — done
- [x] Sub-Task 13: For Review Tab — SP Achievements Section — done
- [x] Sub-Task 14: Tab-Level Search — done
