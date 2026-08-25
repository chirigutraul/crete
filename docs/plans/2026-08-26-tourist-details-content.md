# Tourist Details Content Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace generic detail-page filler with specific, sourced planning guidance for every place, restaurant, and bar in the catalog.

**Architecture:** Add one `touristDetails.json` record per catalog ID and merge it through the existing `buildPlaceDetails` helper. Keep stable editorial facts in the content file, keep provenance URLs in `sources.json`, and avoid undated prices, opening hours, or copied review excerpts.

**Tech Stack:** React 19, Vite 8, JSON data modules, Node test runner.

---

### Task 1: Define complete tourist-detail coverage

**Files:**
- Create: `src/data/touristDetails.json`

1. Add a researched record for every place and restaurant ID.
2. Give every record concise `whyVisit`, `bestTime`, `access`, and `tips` fields.

### Task 2: Merge specific content into the detail model

**Files:**
- Modify: `src/placeDetails.js`

1. Pass the matching tourist-detail record into `buildPlaceDetails`.
2. Return best-time, access, and tips values without fabricating missing data.

### Task 3: Render tourist planning sections

**Files:**
- Modify: `src/App.jsx`

1. Render the structured details as scannable sections on every detail page.
2. Give source links descriptive host labels instead of numbered placeholders.

### Task 4: Verify the full catalog

**Files:**
- Verify all changed files.

1. Validate all 93 catalog IDs have details and source links.
2. Review the data and UI integration without running tests, lint, or build checks, as requested.
