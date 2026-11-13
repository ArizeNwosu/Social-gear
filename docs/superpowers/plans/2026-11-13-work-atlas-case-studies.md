# Work Atlas Case Studies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current three-row case-studies page with a responsive, filterable portfolio of 20 evidence-led product stories, each illustrated by an explanatory motion vignette, then push and verify the connected Vercel deployment.

**Architecture:** Keep the complete portfolio as indexable static HTML, style it through one page-scoped CSS file, and add progressive enhancement through one dependency-free JavaScript file. Filtering uses pure exported helpers plus a small DOM controller; motion uses six shared visual primitives and an observer-managed activation queue capped at three concurrent animations.

**Tech Stack:** Static HTML5, CSS custom properties/keyframes, vanilla JavaScript, inline SVG, `node:test`, Python site checker, Git, Vercel-connected Git deployment

**Spec:** `docs/superpowers/specs/2026-11-13-work-atlas-case-studies-design.md`

## Global Constraints

- Render exactly 20 unique project elements with the slugs and category/system mappings from the spec.
- Keep AutoFBO, RedTeam AI, Stop At 2.00, and PromoSignal as the first four featured elements in the same filterable collection; do not duplicate them.
- Use only evidence supported by the local sources in the spec's Internal Evidence Map.
- Label Stop At 2.00's signup lift as a reported outcome; do not publish a numeric lift without supporting analytics.
- Describe SiteStander through the documented Google Maps import → hero-image ranking → generated preview workflow.
- Preserve the existing detail links for Manufacturing Demand Radar, Zoning Radar, and Inbox Pulse.
- Use no new runtime dependency, autoplay video, canvas loop, or animation library.
- Keep all 20 cards present and readable when JavaScript is disabled.
- Use `data-category` and `data-system` space-separated slug lists; filtering is single-select per group and AND across groups.
- Persist filters as `?need=<slug>&system=<slug>`; invalid query values fall back to `all`.
- Respect `prefers-reduced-motion: reduce`, coarse pointers, keyboard navigation, 44px minimum interactive targets, and 320px-wide screens.
- Use one IntersectionObserver activation queue with a maximum of three automatically animating cards.
- Page-specific JavaScript should remain below roughly 12 KB uncompressed and CSS below roughly 35 KB uncompressed.
- Preserve the existing global navigation, footer, assessment invitation, shared typography, and warm Social Gear visual identity.

## File Structure

- Create `case-studies.css`: page-scoped layout, filter controls, cards, six shared vignette primitives, responsive rules, focus states, and reduced-motion fallbacks.
- Create `case-studies.js`: pure filter/query/queue helpers plus browser controllers for filter state, URL sync, live count, observer activation, and replay behavior.
- Create `tests/case-studies.test.js`: source assertions and unit tests for filtering, query normalization, mappings, card count, and animation queue selection.
- Modify `case-studies.html`: metadata, Work Atlas hero, filter controls, exact 20-card project collection, motion markup, no-results state, and closing CTA.
- Modify `tests/mobile-native.test.js`: page-specific responsive, target-size, coarse-pointer, and reduced-motion assertions.
- Modify `scripts/check-site.py` only if the new `ItemList` JSON-LD or filter structures expose a general site-checking gap; otherwise leave it unchanged.

## Review Focus

- Invalid or partially valid filter query strings must show a usable page, normalize unknown values to `all`, and preserve the valid group.
- A valid need/system combination with no matching project must show the inline no-results state and a working reset without moving focus unexpectedly.
- With JavaScript disabled, all 20 cards and their narratives must remain visible and existing detail links must work.
- With reduced motion or a coarse pointer, cards must render informative settled states and must not auto-sequence or hover-replay.
- Multi-category cards must match token membership exactly; substrings such as `sales` must not match `growth-sales`, and no project may be counted twice.

---

### Task 1: Evidence-Grounded Portfolio Markup and Metadata

**Files:**
- Create: `tests/case-studies.test.js`
- Modify: `case-studies.html`

**Interfaces:**
- Consumes: exact project collection, evidence map, story directions, metadata requirements, and claim policy from the approved spec.
- Produces: 20 `.work-card[data-project][data-category][data-system]` elements; filter buttons using `data-filter-group` and `data-filter-value`; `#work-results-count`; `#work-empty`; `.work-collection`; stable vignette hooks using `data-vignette`.

- [ ] **Step 1: Inspect every evidence source before writing final card copy**

Read the exact local sources named in the spec. For projects with sparse README files, inspect the primary application components or metadata until the target user, input, transformation, and output are supported. Record no confidential URLs, credentials, customer records, or implementation secrets in public copy.

- [ ] **Step 2: Write the failing portfolio source tests**

Create `tests/case-studies.test.js` using `node:test`, `node:assert/strict`, and `fs`. Add tests named:

- `case studies renders the exact audited project collection`
  - extract all `data-project` values;
  - assert length `20`;
  - assert `new Set(slugs).size === 20`;
  - assert exact ordered slugs match the spec table.
- `featured work is one filterable collection rather than duplicated cards`
  - assert the first four slugs are `autofbo`, `redteam-ai`, `stop-at-two`, `promosignal`;
  - assert each appears once.
- `every project has evidence-safe narrative anatomy`
  - for each `.work-card`, assert one heading, one target label, one problem block, one intervention block, one outcome block, and one `data-outcome-kind` in `reported`, `capability`, `designed`, `verified`;
  - assert `stop-at-two` uses `reported` and contains no `%` character.
- `existing case studies retain their detail links`
  - assert the three exact relative href values from the spec.
- `work atlas metadata describes the complete portfolio`
  - assert title, description, Open Graph, Twitter, and JSON-LD no longer describe only the original three examples;
  - assert the page has exactly one H1.
- `all filter tokens come from the approved vocabularies`
  - split category/system values on whitespace and assert every token belongs to the spec's two filter lists.

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test tests/case-studies.test.js`

Expected: FAIL because the current page contains three editorial rows and none of the new Work Atlas interfaces.

- [ ] **Step 4: Replace `case-studies.html` with the static Work Atlas structure**

Keep the current head ordering, navigation, footer, `assessment.js`, and global scripts. Add `case-studies.css` after the shared CSS files and `case-studies.js` before `</body>`.

Use these exact structural hooks:

```html
<section class="work-hero">...</section>
<section class="work-browser" aria-labelledby="work-heading">
  <div class="work-filters" aria-label="Filter selected work">...</div>
  <p id="work-results-count" role="status" aria-live="polite">20 systems</p>
  <div class="work-collection">...</div>
  <div id="work-empty" hidden>...</div>
</section>
```

Each project is an `article.work-card` with `data-project`, `data-category`, `data-system`, `data-featured`, and `data-vignette`. Each contains static target/problem/intervention/outcome copy and a meaningful settled-state vignette. Use the exact 20-project order and mappings from the spec.

Update title, meta description, OG/Twitter descriptions, and JSON-LD. Use a concise `ItemList` only if the markup remains easy to keep synchronized; otherwise use a `CollectionPage` with the exact count in its description.

- [ ] **Step 5: Run the source tests and site checker**

Run: `node --test tests/case-studies.test.js && python3 scripts/check-site.py`

Expected: all case-study tests PASS; site checker reports `All checks passed.`

- [ ] **Step 6: Commit the content foundation**

```bash
git add case-studies.html tests/case-studies.test.js docs/superpowers/specs/2026-11-13-work-atlas-case-studies-design.md docs/superpowers/plans/2026-11-13-work-atlas-case-studies.md
git commit -m "feat(case-studies): add evidence-led work atlas content"
```

### Task 2: Editorial Grid and Motion Graphic Visual System

**Files:**
- Create: `case-studies.css`
- Modify: `tests/case-studies.test.js`
- Modify: `tests/mobile-native.test.js`

**Interfaces:**
- Consumes: Task 1's `.work-*` elements and `data-vignette` values.
- Produces: responsive 12/2/1-column layouts, page-scoped tokens, six shared motion primitives, 20 distinct compositions, `.is-motion-active`, `.is-motion-complete`, and reduced-motion settled states.

- [ ] **Step 1: Add failing CSS-contract and mobile tests**

Extend `tests/case-studies.test.js` with `case study visuals define the six shared motion primitives`. Assert `case-studies.css` contains selectors for:

- `.v-queue`, `.v-signal`, `.v-classify`, `.v-redact`, `.v-configure`, `.v-graph`;
- `.is-motion-active` and `.is-motion-complete`;
- all 20 `[data-vignette="<slug>"]` selectors or project-scoped style hooks;
- `@media (prefers-reduced-motion: reduce)`.

Extend `tests/mobile-native.test.js` with `work atlas keeps filters cards and motion native on small screens`. Assert:

- a breakpoint at or below `768px` produces one-column `.work-collection` behavior;
- filter controls have `min-height: 44px`;
- small-screen rules prevent horizontal page overflow while allowing `.filter-row` controlled horizontal scrolling;
- coarse-pointer rules disable vignette replay transitions;
- reduced-motion rules disable animation and render final states.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/case-studies.test.js tests/mobile-native.test.js`

Expected: FAIL because `case-studies.css` does not exist.

- [ ] **Step 3: Create the editorial page and card system in `case-studies.css`**

Scope every selector beneath `.work-hero`, `.work-browser`, `.work-card`, or `.work-vignette`. Define page tokens for parchment, forest, ink, rule, and the restrained category accents. Build:

- two-column hero with audited system count;
- sticky-or-static filter block that does not cover content;
- 12-column desktop collection with explicit span patterns for featured, landscape, instrument, and narrative cards;
- two-column tablet and one-column mobile layouts;
- visible focus states and 44px filter/reset controls;
- horizontal filter scrolling only inside `.filter-row` on narrow screens;
- card typography and outcome-label treatments.

- [ ] **Step 4: Implement the six shared vignette primitives and 20 compositions**

Use transforms and opacity for animated properties. Give every project a distinct explanatory sequence while reusing the primitives:

- queue/progress: TripSheet, SMS2Post, FormWhisperer, Inbox Pulse;
- signal-to-record: AutoFBO, PromoSignal, opportunity radars;
- classify/sort: Snark Engine, RedTeam AI;
- redact/transform: Privatas, PII Stripper, RedactChat;
- configure/compose: SiteStander, Stop At 2.00, PostLock, PostWallet, Splitflask;
- graph/grow: Mindprint, Instagram Tracker.

Use `.is-motion-active` to play and `.is-motion-complete` to hold the final informative frame. Under reduced motion, force the same final frame without transitions or animations.

- [ ] **Step 5: Run the visual-contract tests**

Run: `node --test tests/case-studies.test.js tests/mobile-native.test.js`

Expected: PASS.

- [ ] **Step 6: Check size budgets**

Run: `wc -c case-studies.css`

Expected: at or below approximately `35840` bytes. If over, consolidate repeated declarations through shared primitives before continuing.

- [ ] **Step 7: Commit the visual system**

```bash
git add case-studies.css tests/case-studies.test.js tests/mobile-native.test.js
git commit -m "style(case-studies): add responsive motion portfolio system"
```

### Task 3: Progressive Filter Controller and URL State

**Files:**
- Create: `case-studies.js`
- Modify: `tests/case-studies.test.js`

**Interfaces:**
- Consumes: Task 1 filter buttons, card attributes, `#work-results-count`, and `#work-empty`.
- Produces: `tokenize(value) -> string[]`, `normalizeFilter(value, allowedValues) -> string`, `matchesProject(project, state) -> boolean`, `readFilterState(search) -> {need:string, system:string}`, `writeFilterSearch(state) -> string`, and browser-side `initFilters(root=document)`.

- [ ] **Step 1: Add failing unit tests for pure filter helpers**

Require `../case-studies.js` from `tests/case-studies.test.js`. Add:

- `tokenize matches exact data tokens rather than substrings`;
- `matchesProject uses OR membership within a card and AND across filter groups`;
- `readFilterState preserves a valid group and normalizes an invalid group to all`;
- `writeFilterSearch omits all-valued groups and uses stable need then system ordering`;
- `an impossible valid combination returns zero matches for the empty state`.

Use the exact allowed value arrays from the spec.

- [ ] **Step 2: Run helper tests to verify they fail**

Run: `node --test tests/case-studies.test.js`

Expected: FAIL because `case-studies.js` and its exports do not exist.

- [ ] **Step 3: Implement pure helpers in `case-studies.js`**

Expose helpers through `module.exports` when running under Node without breaking the browser. Exact interfaces:

```js
tokenize(value = '') => string[]
normalizeFilter(value, allowedValues) => string
matchesProject({ categories, systems }, { need, system }) => boolean
readFilterState(search = '') => { need, system }
writeFilterSearch({ need, system }) => string
```

Allowed need values: `all`, `growth-sales`, `operations`, `creator-social`, `privacy-trust`, `decision-intelligence`, `ecommerce`.

Allowed system values: `all`, `ai-agents`, `workflow-automation`, `voice-messaging`, `data-research`, `interactive-commerce`, `websites-conversion`.

- [ ] **Step 4: Implement `initFilters(root=document)`**

On `DOMContentLoaded`, read query state, set `aria-pressed`, toggle each card's `hidden` attribute, update the live count, and show `#work-empty` only when zero cards match. On filter click, update only that group, call `history.replaceState`, and leave focus on the pressed control. Reset sets both groups to `all`. If required DOM hooks are absent, return without error.

- [ ] **Step 5: Run filter tests**

Run: `node --test tests/case-studies.test.js`

Expected: PASS.

- [ ] **Step 6: Check the JavaScript budget**

Run: `wc -c case-studies.js`

Expected: comfortably below approximately `12288` bytes with the motion controller still to be added.

- [ ] **Step 7: Commit filtering**

```bash
git add case-studies.js tests/case-studies.test.js
git commit -m "feat(case-studies): add accessible portfolio filtering"
```

### Task 4: Observer-Managed Motion Activation and Replay

**Files:**
- Modify: `case-studies.js`
- Modify: `tests/case-studies.test.js`

**Interfaces:**
- Consumes: `.work-card`, `.work-vignette`, `.is-motion-active`, `.is-motion-complete` from Tasks 1–2.
- Produces: `selectActivationBatch(records, limit=3) -> string[]` and browser-side `initMotion(root=document)`.

- [ ] **Step 1: Add failing queue-selection and motion-contract tests**

Add tests:

- `selectActivationBatch activates at most three intersecting unplayed cards`;
- `selectActivationBatch ignores active completed and non-intersecting cards`;
- `motion controller exposes reduced-motion and coarse-pointer safeguards`;
- `completed cards do not automatically replay`.

The pure test records use `{id, intersecting, active, complete}` and assert ordered IDs.

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/case-studies.test.js`

Expected: FAIL because queue selection and `initMotion` are absent.

- [ ] **Step 3: Implement `selectActivationBatch(records, limit=3)`**

Return the first ordered IDs whose records are intersecting and neither active nor complete, capped at the non-negative integer limit.

- [ ] **Step 4: Implement `initMotion(root=document)`**

Behavior:

- if reduced motion matches, mark every card complete immediately and create no observer;
- otherwise create one IntersectionObserver and update each card's intersecting state;
- activate at most three cards through `selectActivationBatch`;
- after the card's declared `data-motion-duration`, remove active, add complete, and fill the next queue slots;
- add hover/focus replay only for completed cards when `(hover: hover) and (pointer: fine)` matches;
- never replay automatically after completion;
- disconnect safely on `pagehide`.

- [ ] **Step 5: Run unit and static contract tests**

Run: `node --test tests/case-studies.test.js tests/mobile-native.test.js`

Expected: PASS.

- [ ] **Step 6: Re-check JavaScript size**

Run: `wc -c case-studies.js`

Expected: at or below approximately `12288` bytes. Consolidate duplicate controller code if over budget.

- [ ] **Step 7: Commit motion behavior**

```bash
git add case-studies.js tests/case-studies.test.js
git commit -m "feat(case-studies): orchestrate explanatory card motion"
```

### Task 5: Full Verification, Production Push, and Vercel Smoke Test

**Files:**
- Modify only if verification exposes a defect: `case-studies.html`, `case-studies.css`, `case-studies.js`, `tests/case-studies.test.js`, `tests/mobile-native.test.js`, `scripts/check-site.py`

**Interfaces:**
- Consumes: completed Work Atlas page and all automated checks.
- Produces: clean verified Git state, pushed `main`, successful Vercel production deployment, and smoke-tested public page.

- [ ] **Step 1: Run the complete automated suite**

Run: `node --test tests/*.test.js && python3 scripts/check-site.py && git diff --check`

Expected: all Node tests PASS, site checker says `All checks passed.`, and `git diff --check` prints nothing.

- [ ] **Step 2: Serve the site locally**

Run: `python3 -m http.server 4173`

Expected: local server listens on port `4173` without errors. Keep the process in a reusable session for visual checks.

- [ ] **Step 3: Perform manual responsive and interaction verification**

Inspect `http://localhost:4173/case-studies.html` at widths `320`, `375`, `768`, `1024`, and `1440`.

Verify:

- no horizontal page overflow;
- filters scroll only within their row on narrow screens;
- every filter and reset combination updates count and URL correctly;
- an impossible valid combination shows the empty state and reset;
- existing detail links work;
- all 20 cards settle into readable final states;
- keyboard focus is visible and does not jump on filtering;
- reduced motion displays settled states without sequencing;
- no more than three cards animate automatically at once.

- [ ] **Step 4: Review copy and secrets before release**

Run searches for accidental credentials and unsupported numeric claims:

```bash
rg -n '(api[_-]?key|secret|password|token|@[A-Za-z0-9._-]+\.(com|net|org)|[0-9]+%)' case-studies.html
```

Expected: no credentials, personal contact records, or unapproved outcome percentages. Legitimate generic words such as “token” in privacy copy must be manually confirmed safe.

- [ ] **Step 5: Review the final branch diff and commit any verification fixes**

Run: `git status --short && git diff --stat && git diff -- case-studies.html case-studies.css case-studies.js tests/case-studies.test.js tests/mobile-native.test.js`

If verification required fixes:

```bash
git add case-studies.html case-studies.css case-studies.js tests/case-studies.test.js tests/mobile-native.test.js scripts/check-site.py
git commit -m "fix(case-studies): resolve portfolio verification findings"
```

Expected: only scoped Work Atlas and documentation changes are present.

- [ ] **Step 6: Re-run the complete suite after the final commit**

Run: `node --test tests/*.test.js && python3 scripts/check-site.py && git diff --check`

Expected: all checks pass again.

- [ ] **Step 7: Push the production branch**

Run: `git push origin main`

Expected: push succeeds and the remote `main` advances to the local HEAD.

- [ ] **Step 8: Verify Git synchronization**

Run: `git fetch origin main && test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"`

Expected: exit code `0`.

- [ ] **Step 9: Verify the connected Vercel deployment**

Use the connected Vercel project or authenticated Vercel CLI to locate the deployment created from the pushed commit. Wait for its production state to become `READY`; if it fails, inspect build logs, fix the scoped failure, repeat tests, commit, and push again.

Expected: production deployment is `READY` and references the pushed Git SHA.

- [ ] **Step 10: Smoke-test production**

Open `https://www.social-gear.com/case-studies.html` and verify the page title, 20-system count, featured cards, one business-need filter, one system filter, reset, an existing detail link, mobile layout, and settled reduced-motion presentation.

Expected: public behavior matches the verified local build.

