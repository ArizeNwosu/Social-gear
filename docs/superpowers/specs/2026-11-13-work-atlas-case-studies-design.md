# Work Atlas Case Studies Design Specification

## Overview

Replace the current three-row case studies page with an evidence-led, filterable portfolio of miniature product stories. The page should take structural inspiration from Craft Digital's work index without copying its layout or styling: every project is represented by a small animated system, a compact business narrative, and a carefully qualified outcome.

The finished page should feel like a working product museum rather than a gallery of screenshots. Motion explains what each tool does. Copy explains who it serves, what friction it removes, and what changed or is intended to change.

Reference reviewed: https://www.craftdigital.ai/work

## Goals

1. Show the breadth and professional depth of Social Gear's product work.
2. Turn technical projects into legible business stories for prospective clients.
3. Give every featured tool a distinct motion vignette that demonstrates its core workflow.
4. Let visitors filter the portfolio by business category and system type.
5. Preserve the site's warm, editorial visual identity while making the work page more dynamic and product-forward.
6. Keep every outcome truthful by separating verified results, product capabilities, and intended outcomes.
7. Deliver a responsive, accessible, performant page with no framework or animation dependency.

## Non-goals

- Do not clone Craft Digital's visual design, wording, or card compositions.
- Do not publish confidential client information, credentials, internal URLs, or implementation secrets.
- Do not invent revenue, conversion, time-saved, user-count, or performance figures.
- Do not create a separate detail page for every tool in the first release.
- Do not embed full application builds, autoplay video, canvas loops, or heavy animation libraries.

## Evidence and Claim Policy

Each card's copy must be traceable to local product documentation, source structure, or an existing public Social Gear case study.

Four outcome labels are allowed:

- **Verified result** — used only when a measured result and supporting evidence are available.
- **Reported outcome** — used for a qualitative result supplied by the user but not yet supported by analytics in the workspace.
- **Working capability** — describes what the implemented system does without implying measured commercial impact.
- **Designed outcome** — describes the business result the product is intended to enable, using language such as “designed to,” “helps,” or “replaces.”

The Stop At 2.00 card may say that the experience increased signups because the user supplied that fact, but this is labeled a **reported outcome**, not a verified result. It must not show a numeric percentage until the exact figure and supporting analytics are supplied and confirmed. Other undocumented projects use capability or designed-outcome language.

Public copy should describe target company types rather than presenting speculative brands as actual clients. For example: “private aviation operators and charter teams,” not a fabricated company name.

## Information Architecture

### 1. Introductory Hero

Eyebrow: `SELECTED SYSTEMS · 2026`

Headline direction: `Working software for work that should work better.`

Supporting copy should explain that each story shows a system in motion and that metrics are only used when verified.

The hero includes a compact audited index: `20 systems · 6 categories · built across operations, growth, commerce, privacy, and AI`. The number is visible in the static HTML and validated by JavaScript against the number of unique project elements; it is not hidden until JavaScript loads.

### 2. Featured Systems

A full-width editorial grid introduces four anchor stories:

1. AutoFBO
2. RedTeam AI
3. Stop At 2.00
4. PromoSignal

Desktop layout uses an asymmetric 7/5 or 8/4 composition so one card can lead while the others create rhythm. Mobile stacks all cards in a single column. Featured systems are not duplicated later: they are the first four elements in the single project collection and participate in the same filters as every other card.

### 3. Filter Bar

Two filter groups match the way buyers think about the work:

**By business need**

- All
- Growth & Sales
- Operations
- Creator & Social
- Privacy & Trust
- Decision Intelligence
- Ecommerce

**By system type**

- AI Agents
- Workflow Automation
- Voice & Messaging
- Data & Research
- Interactive Commerce
- Websites & Conversion

Filters are progressive enhancement. All work is visible without JavaScript. With JavaScript:

- Each group permits one active value.
- The active business need and system type are combined with AND logic.
- URL state uses `?need=operations&system=ai-agents` with stable lowercase slugs.
- Changing a filter updates the result count without forcibly moving keyboard focus.
- A clear-filter control appears after the first selection.
- If no projects match, an inline empty state explains the combination and provides a reset button.

### 4. Selected Work Grid

The work grid uses editorial modules rather than identical SaaS cards. Card sizes alternate across a 12-column desktop grid, while visual anatomy remains consistent:

1. Category and product name
2. Animated product vignette
3. Target company or operator
4. Problem statement
5. System intervention
6. Qualified outcome line

Cards do not open dead-end modal windows. Manufacturing Demand Radar, Zoning Radar, and Inbox Pulse link to their existing detailed case-study pages. The remaining cards are complete, self-contained narratives in the index.

### 5. Closing CTA

Close with a direct prompt based on the page's proof: `Have a workflow that still runs by hand?` followed by the existing contact action.

## Project Lineup and Story Direction

### Featured

| Project | Category | Target company | Problem / intervention | Outcome treatment | Motion vignette |
|---|---|---|---|---|---|
| AutoFBO | Operations | Private aviation FBOs and charter teams | Availability, pricing, and booking coordination is trapped in repeated calls. An AI voice dispatch assistant structures the conversation and booking state. | Working capability | Incoming call waveform resolves into availability, price, and confirmed status. |
| RedTeam AI | Decision Intelligence | Founders, investors, operators, engineers, and legal teams | Important decisions receive one agreeable answer instead of structured opposition. Four models clarify, advocate, prosecute, and refine the decision. | Working capability | Four model nodes pass a thesis through an adversarial loop into a survivability score. |
| Stop At 2.00 | Ecommerce / Playable Commerce | Consumer brands and event marketers | Static signup forms provide no reason to participate or share. A camera-based timing game turns lead capture into a challenge and shareable clip. | Reported outcome, qualitative until exact metric and evidence are supplied | Countdown races toward 2.00, stops, reveals a result, then transforms into a captured lead. |
| PromoSignal | Growth & Sales | Promotional-product distributors | Company news is useless without a reachable buyer and a timely reason to contact them. The system joins trigger detection, persona selection, verified email, and source attribution. | Designed outcome | Trigger card flows through contact verification into a ready-to-send outreach draft. |

### Operations & Workflow

| Project | Target company | Narrative | Motion vignette |
|---|---|---|---|
| TripSheet AI | Charter brokers | Extracts trip details and turns scattered booking information into a branded trip-sheet PDF. | Raw itinerary fragments snap into a clean flight timeline and PDF. |
| SMS2Post | Field teams, owner-operators, and social teams | Converts an SMS or MMS into queued, trackable social content so publishing does not require opening a dashboard. | Text bubble becomes media, enters a processing queue, then lands on connected channels. |
| FormWhisperer | Document-heavy service teams | Converts slow, repetitive form completion into guided structured input and generated documents. | Cursor moves through a dense form while fields populate and completion rises. |
| SiteStander | Website operators and local-business agencies | Imports a business, ranks visual assets, and generates a review-driven website preview that an operator can revise and sell. The requested “visualizer” is represented by this documented Maps-to-preview workflow. | Maps listing becomes ranked photo candidates, then a live website preview. |

### Creator, Social, and Growth Systems

| Project | Target company | Narrative | Motion vignette |
|---|---|---|---|
| Snark Engine | Creators and social teams | Classifies comments by intent and drafts replies in the creator's learned voice, keeping skeptical comments in review. | Comment cards sort into intent lanes; a voice dial changes the draft before approval. |
| Mindprint | Professionals building reusable AI context | Observes work artifacts and organizes useful patterns into a portable personal knowledge layer. | Document fragments connect into a growing memory map. |
| Instagram Followers Tracker | Brands, creators, and agencies | Captures daily public follower snapshots and turns missing historical data into a chart that becomes more useful over time. | Snapshot counter advances from 1/7 while a line chart grows point by point. |
| Manufacturing Demand Radar | Commercial real-estate teams | Preserves the existing case study about turning public expansion signals into ranked tenant opportunities. | Company signals converge into ranked tenant cards with provenance. |
| Zoning Radar | Commercial real-estate teams | Preserves the existing case study about monitoring public planning records for land-use changes that can create deals. | Public agendas and notices converge into a weekly opportunity brief. |
| Inbox Pulse | Small-business operators | Preserves the existing case study about mapping inbox load, response gaps, and waiting threads without sending or deleting messages. | Message volume resolves into response and waiting-state indicators. |

### Privacy & Trust

| Project | Target company | Narrative | Motion vignette |
|---|---|---|---|
| Privatas | Teams sharing sensitive material with AI tools | Creates a privacy-first layer between source content and external processing. | Sensitive fields blur or tokenize before a clean payload crosses a boundary. |
| PII Stripper | Regulated and privacy-conscious teams | Finds personal data before text is copied into a model or shared externally. | Names, emails, and IDs are detected and replaced before the payload crosses a boundary. |
| RedactChat | Teams using AI with confidential source material | Creates a redact-before-send workflow for safer AI-assisted work. | Sensitive tokens collapse into placeholders before the prompt is released. |

RedTeam AI also matches Privacy & Trust when its legal or code-review filter metadata applies, but remains one card and one DOM element.

### Ecommerce & Playable Commerce

| Project | Target company | Narrative | Motion vignette |
|---|---|---|---|
| Stop At 2.00 | Consumer brands and events | Replaces passive lead capture with a branded playable challenge and social sharing loop. | Timer-to-lead sequence described above. |
| PostLock | Creators and focus-oriented mobile users | Uses a validated recording ritual to unlock distracting apps, turning access control into content creation. | Locked app, 15-second recording ring, validation checks, unlock. |
| PostWallet / playable rewards | Shopify merchants | Connects customer social participation, verification, and merchant-funded rewards. | Purchase becomes a challenge, verified post, then unlocked reward. |
| Splitflask bag-lock combinations | Product brands with configurable bundles | Makes complex color and lock combinations understandable through an interactive product builder instead of static variant menus. | Bag components rotate through color/lock choices and consolidate into one cart line. |

## Exact Project Collection and Filter Mapping

The page contains exactly 20 unique project elements. A project may belong to more than one filter value without being duplicated.

| # | Project slug | Business need values | System type values | Detail link |
|---|---|---|---|---|
| 1 | `autofbo` | operations | ai-agents, voice-messaging, workflow-automation | none |
| 2 | `redteam-ai` | decision-intelligence, privacy-trust | ai-agents, data-research | none |
| 3 | `stop-at-two` | ecommerce, growth-sales | interactive-commerce, websites-conversion | none |
| 4 | `promosignal` | growth-sales | ai-agents, data-research | none |
| 5 | `tripsheet-ai` | operations | workflow-automation | none |
| 6 | `sms2post` | creator-social, operations | voice-messaging, workflow-automation | none |
| 7 | `formwhisperer` | operations | workflow-automation | none |
| 8 | `sitestander` | growth-sales | ai-agents, websites-conversion | none |
| 9 | `snark-engine` | creator-social | ai-agents, voice-messaging | none |
| 10 | `mindprint` | decision-intelligence | ai-agents, data-research | none |
| 11 | `instagram-tracker` | creator-social, growth-sales | data-research | none |
| 12 | `manufacturing-radar` | growth-sales | data-research | `case-studies/manufacturing-radar.html` |
| 13 | `zoning-radar` | growth-sales | data-research | `case-studies/zoning-radar.html` |
| 14 | `inbox-pulse` | operations | data-research, workflow-automation | `case-studies/inbox-pulse.html` |
| 15 | `privatas` | privacy-trust | workflow-automation | none |
| 16 | `pii-stripper` | privacy-trust | workflow-automation | none |
| 17 | `redactchat` | privacy-trust | workflow-automation | none |
| 18 | `postlock` | ecommerce, creator-social | interactive-commerce, workflow-automation | none |
| 19 | `postwallet` | ecommerce, growth-sales | interactive-commerce, workflow-automation | none |
| 20 | `splitflask-configurator` | ecommerce | interactive-commerce, websites-conversion | none |

In HTML, multi-value attributes are space-separated slug lists. Filter code treats membership within an attribute as OR and the two filter groups as AND.

## Internal Evidence Map

This map guides copy validation and is not rendered publicly. Final implementation must inspect the named source before publishing each card. If a narrative detail is not supported after inspection, the copy is narrowed rather than inferred.

| Project | Primary local evidence |
|---|---|
| AutoFBO | `Documents/Claude/autoFBO/metadata.json`, application components, `BACKEND_SETUP.md` |
| RedTeam AI | `Documents/Claude/Redteam/claude.md` |
| Stop At 2.00 | `Documents/Claude/PostLock/postlock-entitlement-edit/Downloads/stopat2/src/App.tsx`; signup lift is user-reported |
| PromoSignal | `Documents/Claude/promosignal/promo_prospecting_prd.md` |
| TripSheet AI | `Documents/Claude/tripsheet-ai/metadata.json` and application source |
| SMS2Post | `Documents/Claude/sms2post/README.md` |
| FormWhisperer | `Documents/Claude/formwhisper/metadata.json`, `index.tsx`, and application components |
| SiteStander | `Documents/Claude/sitestander/README.md` and application source |
| Snark Engine | `Documents/Claude/snark-engine/DESIGN.md` |
| Mindprint | `Documents/Claude/Mindprint/index.html`, observer source, and `DESIGN_SYSTEM.md` |
| Instagram Followers Tracker | `Documents/Claude/instagramfollowerstracker/PRD.md` |
| Manufacturing Demand Radar | existing `case-studies/manufacturing-radar.html` |
| Zoning Radar | existing `case-studies/zoning-radar.html` |
| Inbox Pulse | existing `case-studies/inbox-pulse.html` |
| Privatas | `Documents/Claude/privatas/metadata.json` and application source |
| PII Stripper | `Documents/Claude/pii-stripper/README.md` and extension source |
| RedactChat | `Documents/Claude/RedactChat-Extension/README.md` and landing-page copy |
| PostLock | `Documents/Claude/PostLock/postlock-prd.md` |
| PostWallet | `Documents/Claude/post-wallet/ARCHITECTURE.md` and Shopify integration docs |
| Splitflask configurator | `Documents/Claude/splitflask-redesign` and `Documents/Claude/Splitflask-Shopify` product/bundle source |

## Visual Direction

### Overall Character

The page extends Social Gear's warm editorial system rather than adopting a dark enterprise template. The base remains parchment and forest green, with a restrained set of category accents: mineral blue, signal red, ochre, lilac, and electric chartreuse.

The composition should feel like a field notebook filled with working instruments:

- Fine rules and small technical labels
- Large, confident Manrope headlines
- Compact DM Sans narrative copy
- Cards with flat color fields and crisp boundaries rather than excessive shadows
- Occasional oversized numeric or status typography inside motion modules

### Card System

Cards use one of three layout families:

- **Landscape system card** — wide workflow motion with copy beneath
- **Instrument card** — tall vignette focused on one interaction or metric
- **Narrative card** — split copy and motion for more complex stories

This creates variety while retaining consistent spacing, border, radius, and narrative order.

### Responsive Behavior

- Desktop: 12-column editorial grid with mixed spans.
- Tablet: two columns with featured cards spanning both columns where appropriate.
- Mobile: one column, motion viewport above copy, no horizontal page overflow.
- Filter chips scroll horizontally on small screens with visible affordance and keyboard access.
- Typography uses `clamp()` and avoids headings that require manual line breaks at narrow widths.
- Interactive targets meet a 44px minimum.

## Motion System

### Principles

Motion must explain the system, not decorate the card. Every animation follows a short causal sequence: input → transformation → useful state.

### Implementation

- Vignettes use semantic HTML, inline SVG, and CSS transforms/opacity.
- A single `IntersectionObserver` manages an activation queue. At most three intersecting, unplayed cards are active at once.
- When a sequence finishes, the card receives a permanent completed state and the next visible card in the queue starts.
- Each vignette runs automatically once and settles into a meaningful final state.
- Hover or keyboard-focus replay is allowed for only the currently interacted card. Replay is disabled for coarse pointers and reduced-motion users.
- No continuous JavaScript animation loop.
- Animation duration targets 2.8–4.5 seconds per story.
- At most three vignettes animate simultaneously to control CPU use.
- Below the fold modules are initialized lazily.

### Reduced Motion

With `prefers-reduced-motion: reduce`:

- No sequencing or looping runs.
- Every vignette renders its informative final state immediately.
- Filter transitions become instant.
- Meaning is never dependent on movement alone.

## Accessibility

- Filters are real buttons with `aria-pressed` state and a live result count.
- Cards use headings in a logical hierarchy.
- Decorative SVGs are hidden from assistive technology; meaningful motion modules have concise text equivalents.
- Color is not the sole carrier of status or category.
- Focus states remain clearly visible in every card palette.
- Existing case-study links retain descriptive labels.
- The page works with keyboard navigation and without JavaScript.

## Technical Architecture

### New Files

| File | Purpose |
|---|---|
| `case-studies.css` | Page-specific layout, card system, responsive rules, and motion art direction |
| `case-studies.js` | Filtering, query-state sync, intersection activation, and replay controls |

### Modified Files

| File | Change |
|---|---|
| `case-studies.html` | Replace editorial rows with the Work Atlas hero, filters, project modules, and CTA; update title, meta description, canonical-adjacent metadata, Open Graph, Twitter, and JSON-LD copy to describe the complete portfolio |
| `sitemap.xml` | Update only if detailed case-study links or page metadata require it |
| `scripts/check-site.py` | Add structural checks for filter targets and local links if useful |
| `tests/mobile-native.test.js` | Extend responsive assertions for the new grid, chips, and motion fallbacks |

Existing global CSS remains the source of brand tokens, navigation, footer, buttons, and shared typography. Page-specific work should not add broad global selectors.

### Content Representation

Project metadata lives in the HTML through `data-category` and `data-system` attributes. This keeps content indexable and ensures the complete portfolio exists before JavaScript runs. JavaScript enhances filtering; it does not generate the case-study copy. The JSON-LD may use an `ItemList` of the 20 systems, but only if it can remain concise and consistent with the visible page.

The 20 illustrations are assembled from six shared motion primitives—queue/progress, signal-to-record, classify/sort, redact/transform, configure/compose, and graph/grow. Every card gets distinct content, labels, palette, and composition, but does not require a wholly separate animation engine.

## Performance Budget

- No additional runtime dependency.
- No autoplay video assets.
- Prefer transforms and opacity for animation.
- Avoid layout-triggering animation properties.
- Keep page-specific JavaScript below roughly 12 KB uncompressed.
- Keep page-specific CSS below roughly 35 KB uncompressed.
- Use inline SVG symbols or compact DOM compositions; do not load one large image per card.

## Verification

1. Run the repository's existing test suite.
2. Extend the existing `node:test` and static-source checks for card count, unique slugs, valid filter values, detail links, minimum tap-target declarations, reduced-motion fallbacks, and expected responsive rules.
3. Validate filters with keyboard and pointer input.
4. Confirm every category and system filter returns at least one result.
5. Confirm the complete portfolio remains readable with JavaScript disabled.
6. Confirm no project copy exposes secrets or asserts undocumented numerical outcomes.
7. Manually inspect at 320, 375, 768, 1024, and 1440px widths because the repository does not currently include browser automation.
8. Manually check Chrome/Chromium and Safari-compatible CSS behavior.
9. Run the site checker and review all changed local links.
10. Inspect the final page visually before commit and deployment.

## Release and Deployment

After implementation and verification:

1. Review the final diff for unrelated changes.
2. Commit the case-study redesign with a focused message.
3. Push the current production branch to its configured origin.
4. Confirm the connected Vercel project receives the commit and reaches a successful production deployment.
5. Smoke-test the public case-studies URL, filters, mobile layout, and motion behavior.

