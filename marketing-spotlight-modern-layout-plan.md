# Marketing Spotlight — Modern Layout Plan

## Top-Level Overview

Add a second **"Modern"** email layout option to the Marketing Spotlight tab, styled after the screenshot mockup (hero image, section header ribbons, 2-column highlight cards).

The layout will:
- Be selectable via a **Style toggle** in the settings panel (Classic / Modern)
- Use the **same underlying data** already in the component (events, intro text, custom sections, resource links, color scheme)
- Generate a **table-based HTML email** (600px fixed width, Outlook-safe) using the selected `currentColors` theme — so it works with all 12 existing colour schemes
- Use a **placeholder Unsplash hero image** in the header area

The Classic layout is untouched. Only `MarketingSpotlightTab.js` is changed.

---

## Sub-Tasks

---

### Sub-Task 1 — Add Layout Style Toggle to Settings Panel

**Intent**  
Add a `layoutStyle` state value (`'classic'` | `'modern'`) and a UI control in the settings panel so the user can switch between the two layouts before generating.

**Expected Outcomes**
- A "Layout Style" radio group or segmented control appears in the settings panel
- Selecting "Modern" changes `layoutStyle` to `'modern'`; "Classic" keeps it as `'classic'`
- The existing `generateEmailHTML()` call is gated: if `layoutStyle === 'modern'` call `generateModernEmailHTML()`, otherwise call the existing function

**Todo List**
1. Add `const [layoutStyle, setLayoutStyle] = useState('classic')` near the top of the state block
2. In the settings panel JSX, add a Carbon `RadioButtonGroup` with two options: Classic and Modern
3. In the "Generate / Download" button handler, branch on `layoutStyle` to call the correct generator function

**Relevant Context**
- State block starts around line 81 in `src/components/MarketingSpotlightTab.js`
- Settings panel JSX contains the existing colour scheme selector and font selector — add the new control near those
- The download/generate button calls `generateEmailHTML()` — this needs the branch

**Status**: [ ] pending

---

### Sub-Task 2 — Write `generateModernEmailHTML()` Function

**Intent**  
Create a new function `generateModernEmailHTML()` inside `MarketingSpotlightTab.js` that returns a complete, table-based HTML email in the Modern style. It reads the same state variables as the classic generator.

**Expected Outcomes**
- Function returns a valid `<!DOCTYPE html>` string that opens correctly in a browser and email client
- Hero section: full-width header image (Unsplash placeholder) with a semi-transparent colour overlay using `currentColors.header`, date pill badge, large title (`bannerTitle`), subtitle (`bannerSubtitle + quarter + year`)
- Intro text block: plain white background, greeting + `introText` paragraph
- For each `customSection`: a dark ribbon header row (using `currentColors.sectionHeaderBg`) with section title and a decorative icon, followed by a 2-column card grid showing the section's events or links
- Stats summary: "A little data we can feel good about" style ribbon + 3-column stat tiles (IBM / 3rd Party / On-Demand counts) using existing stats data
- Footer: coloured bar with IBM copyright, same as classic
- All layout via HTML `<table>` elements — no CSS flexbox/grid — for cross-client consistency

**Todo List**
1. Add `function generateModernEmailHTML()` after the existing `generateEmailHTML()` function (around line 1872)
2. Resolve `currentColors` and `currentFont` the same way the classic generator does (lines 1155–1165 pattern)
3. Build the hero header table: 600px wide, background colour overlay, Unsplash image as a background-image style on the `<td>`, date pill, title, subtitle
4. Build the intro text section as a white `<table>` row
5. Loop over `customSections` — for each section render a dark ribbon header + 2-column card grid using the section's `links` array (title + description per card)
6. Add stats summary ribbon + 3-column count tiles (IBM / 3rd Party / On-Demand)
7. If `newsLinks` or `podcastLinks` exist, render them as a single-column list section under a ribbon header
8. Add footer table row matching the classic footer style
9. Return the complete HTML string

**Relevant Context**
- Existing `generateEmailHTML()` is at line 1155 — study how it resolves `currentColors`, `currentFont`, and iterates sections
- `customSections` state: array of `{title, content, links[], events[]}`
- `newsLinks`, `podcastLinks`: arrays of `{id, title, url, description}`
- IBM / 3rd Party / On-Demand counts are derived from `events` filtered by `category`
- Unsplash placeholder URL to use: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80` (professional office scene, license-free for mockup)
- Hero overlay: use `currentColors.header` at ~85% opacity as a CSS `background-color` on top of the image using a layered `<table>` approach (VML fallback not needed for mockup)

**Status**: [ ] pending

---

### Sub-Task 3 — Preview the Mockup in the App

**Intent**  
Verify the Modern layout renders correctly by previewing the generated HTML in the browser (open in new tab from the app). This is a validation step, not a code change.

**Expected Outcomes**
- Selecting "Modern" style and clicking Generate/Preview opens the new layout in a new browser tab
- Hero image appears with colour overlay
- Custom sections render as ribbon + 2-column cards
- Stats section renders
- Layout holds at various zoom levels (no horizontal scroll within 600px container)
- Classic layout still works unchanged

**Todo List**
1. Run the app (`npm start` is already running on port 3000)
2. Go to the Marketing Spotlight tab → Settings → select "Modern" layout
3. Click Generate / Preview and inspect the output
4. Confirm colour schemes work by switching between navy-teal, IBM blue, and pastel-mint

**Relevant Context**
- App runs on `http://localhost:3000`
- The existing preview mechanism opens a new tab with the HTML blob URL

**Status**: [ ] pending

---

## Open Decisions (Resolved)

| Decision | Resolution |
|---|---|
| Hero image | Unsplash placeholder URL |
| Colour approach | Theme-aware — uses `currentColors` from whichever scheme is selected |
| Layout option | Second "Modern" style alongside Classic — selectable in settings panel |
| Highlight cards data source | Custom Sections — each section's links become the 2-column cards |
