# Place Details and Directions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add mobile-first detail pages for every place and venue, plus reliable Google Maps directions from catalog and itinerary cards.

**Architecture:** Extend the pathname parser to recognize `/places/:id` and `/restaurants/:id`, render one shared detail-page component against the existing JSON catalogs, and generate universal Google Maps URLs through a tested helper. Keep cards as semantic articles with one stretched detail link and one independent directions link.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 4, Node test runner.

---

### Task 1: Route parsing

**Files:**
- Modify: `src/appRoute.js`
- Modify: `test/appRoute.test.js`

1. Add failing tests for place, restaurant, itinerary, and unknown paths.
2. Run `npm test -- test/appRoute.test.js` and confirm the detail-route assertions fail.
3. Parse decoded catalog IDs into a small route object.
4. Re-run the route tests and confirm they pass.

### Task 2: Universal Google Maps links

**Files:**
- Create: `src/maps.js`
- Create: `test/maps.test.js`

1. Add failing tests for catalog items, itinerary-only stops, and missing locations.
2. Run the focused test and confirm the missing module fails.
3. Implement encoded `https://www.google.com/maps/dir/?api=1&destination=...` URLs.
4. Re-run the focused test and confirm it passes.

### Task 3: Detail-page content model

**Files:**
- Create: `src/placeDetails.js`
- Create: `test/placeDetails.test.js`

1. Add failing tests for practical notes, visit reasons, venue rating metadata, and safe fallbacks.
2. Run the focused test and confirm the module is missing.
3. Implement concise, non-fabricated editorial content derived from catalog fields.
4. Re-run the focused test and confirm it passes.

### Task 4: Mobile-first UI and accessible interactions

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/index.css`
- Modify: `test/mobileExperience.test.js`

1. Add failing source-level regression checks for detail links, directions links, and detail-page landmarks.
2. Run the focused test and confirm the new checks fail.
3. Add stretched card links, independent directions actions, itinerary directions, and the shared detail page.
4. Add mobile-first styling, safe-area spacing, strong focus states, and reduced-motion support.
5. Re-run the focused test and confirm it passes.

### Task 5: Verification

**Files:**
- Verify all changed files.

1. Run `npm test`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Inspect the home, itinerary, place-detail, restaurant-detail, and not-found detail states at a narrow viewport.

