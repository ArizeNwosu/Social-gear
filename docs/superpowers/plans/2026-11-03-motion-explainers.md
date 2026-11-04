# Motion Explainers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Lemonbrand-style scroll-triggered animations and animated UI mockup illustrations to the Social Gear AI homepage.

**Architecture:** Single IntersectionObserver in `motion.js` adds a `revealed` class to `[data-reveal]` elements on scroll. All animation is CSS transitions on `opacity` and `transform`. Three hand-coded HTML/CSS mockup illustrations replace the text-only promise sections.

**Tech Stack:** Vanilla HTML, CSS (`@keyframes`, transitions), JavaScript (IntersectionObserver API). Zero dependencies.

**Spec:** `docs/superpowers/specs/2026-11-03-motion-explainers-design.md`

---

## File Map

| File | Role | Change type |
|------|------|-------------|
| `motion.js` | Scroll-reveal controller (IntersectionObserver) | Rewrite |
| `site.css` | Reveal base classes + mockup illustration styles | Append |
| `sections.css` | Stagger delays for function-grid children | Append |
| `index.html` | `data-reveal` attrs on sections, mockup HTML, `<script src="motion.js">` | Modify |

---

### Task 1: Scroll-Reveal Controller (`motion.js`)

**Files:**
- Rewrite: `motion.js`

- [ ] **Step 1: Write the IntersectionObserver controller**

Replace the entire contents of `motion.js` with:

```javascript
// Scroll-reveal: adds 'revealed' class to [data-reveal] elements on viewport entry.
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var els = document.querySelectorAll('[data-reveal]');

  if (reduced) {
    els.forEach(function (el) { el.classList.add('revealed'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(function (el) { observer.observe(el); });
})();
```

- [ ] **Step 2: Verify in browser**

Open `index.html` in Chrome (you'll wire the script tag in Task 4). For now, confirm the file saves without syntax errors by running:

```bash
node -c motion.js
```

Expected: no output (syntax OK).

- [ ] **Step 3: Commit**

```bash
git add motion.js
git commit -m "feat: rewrite motion.js as scroll-reveal controller"
```

---

### Task 2: Reveal CSS Classes (`site.css`)

**Files:**
- Append to: `site.css`

- [ ] **Step 1: Add reveal base + direction variants**

Append the following block to the end of `site.css`, **before** the existing `@media(prefers-reduced-motion:reduce)` rule (so the reduced-motion override catches it). The reduced-motion rule is near the bottom of the file — insert just above it.

Find this line in `site.css`:
```css
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
```

Insert **above** it:

```css
/* --- Scroll reveal --- */
[data-reveal]{opacity:0;transition:opacity .6s ease,transform .6s ease}
[data-reveal].revealed{opacity:1;transform:none}
[data-reveal][data-reveal-delay="1"]{transition-delay:120ms}
[data-reveal][data-reveal-delay="2"]{transition-delay:240ms}
[data-reveal][data-reveal-delay="3"]{transition-delay:360ms}
[data-reveal][data-reveal-delay="4"]{transition-delay:480ms}
[data-reveal][data-reveal-delay="5"]{transition-delay:600ms}
[data-reveal].reveal-up{transform:translateY(30px)}
[data-reveal].reveal-scale{transform:scale(.92)}
[data-reveal].reveal-left{transform:translateX(-40px)}
[data-reveal].reveal-right{transform:translateX(40px)}
```

- [ ] **Step 2: Verify the reduced-motion rule still catches reveals**

The existing `@media(prefers-reduced-motion:reduce)` rule sets `transition:none!important` on `*`, which will override the reveal transitions. Confirm this rule still exists at the end of `site.css` after your edit.

- [ ] **Step 3: Commit**

```bash
git add site.css
git commit -m "feat: add scroll-reveal CSS classes"
```

---

### Task 3: Mockup Illustration Styles (`site.css`)

**Files:**
- Append to: `site.css`

- [ ] **Step 1: Add mockup base + Illustration A styles**

Insert the following **above** the `@media(prefers-reduced-motion:reduce)` rule in `site.css`, after the scroll-reveal block from Task 2:

```css
/* --- Mockup illustrations --- */
.mockup{background:#fffefa;border-radius:16px;box-shadow:0 12px 40px #244d3d0d;padding:24px;position:relative;overflow:hidden;min-height:280px}
.mockup-chrome{display:flex;gap:6px;margin-bottom:18px}
.mockup-chrome span{width:10px;height:10px;border-radius:50%}
.mockup-chrome span:nth-child(1){background:#e74c3c}
.mockup-chrome span:nth-child(2){background:#f39c12}
.mockup-chrome span:nth-child(3){background:#2ecc71}
.mockup-inner{display:flex;gap:16px;height:100%}

/* Illustration A: Find Clarity — workspace */
.mockup-sidebar{display:flex;flex-direction:column;gap:8px;width:80px;flex-shrink:0}
.mockup-sidebar span{display:block;height:10px;border-radius:4px;background:#d9ded1}
.mockup-main{flex:1;display:flex;flex-direction:column;gap:10px}
.mockup-row{display:flex;align-items:center;gap:10px;padding:12px;background:#f7f5ee;border-radius:8px;border:1px solid #e7eadf}
.mockup-row .bar{flex:1;height:10px;border-radius:4px;background:#d9ded1}
.mockup-row .dot{width:10px;height:10px;border-radius:50%;background:#b1bea1}
.mockup-badge{display:inline-block;background:#d9fa62;color:#244d3d;font-size:10px;font-weight:700;padding:6px 12px;border-radius:20px;margin-top:6px;letter-spacing:.5px}

/* Illustration B: Trust — shield rings */
.mockup-shield{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:240px;position:relative}
.mockup-lock{font-size:42px;z-index:2}
.mockup-ring{position:absolute;border:2px solid #d9ded1;border-radius:50%}
.mockup-ring:nth-child(2){width:120px;height:120px}
.mockup-ring:nth-child(3){width:190px;height:190px;border-color:#e7eadf}
.mockup-ring:nth-child(4){width:260px;height:260px;border-color:#f0f2e8}
.mockup-labels{display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap}
.mockup-labels span{font-size:11px;padding:7px 14px;background:#e8efda;border-radius:20px;color:#244d3d;font-weight:600}

/* Illustration C: CTA — conversation + timeline */
.mockup-convo{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
.mockup-bubble{padding:10px 16px;border-radius:12px;font-size:11px;color:#25392e;max-width:70%}
.mockup-bubble.left{background:#e8efda;align-self:flex-start;border-bottom-left-radius:4px}
.mockup-bubble.right{background:#f0f2e8;align-self:flex-end;border-bottom-right-radius:4px}
.mockup-timeline{position:relative;height:6px;background:#e7eadf;border-radius:3px;margin-top:10px}
.mockup-timeline-fill{position:absolute;left:0;top:0;height:100%;background:#244d3d;border-radius:3px;width:0}
.mockup-dots{display:flex;justify-content:space-between;margin-top:8px}
.mockup-dots span{width:14px;height:14px;border-radius:50%;background:#d9ded1;border:2px solid #fffefa;position:relative}
.mockup-dot-label{position:absolute;top:20px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9px;color:#687163}

/* Mockup internal animations — play when parent has .revealed */
.mockup [data-anim]{opacity:0;transform:translateY(12px);transition:opacity .5s ease,transform .5s ease}
.revealed .mockup [data-anim]{opacity:1;transform:none}
.revealed .mockup [data-anim="1"]{transition-delay:.2s}
.revealed .mockup [data-anim="2"]{transition-delay:.4s}
.revealed .mockup [data-anim="3"]{transition-delay:.6s}
.revealed .mockup [data-anim="4"]{transition-delay:.8s}
.revealed .mockup [data-anim="5"]{transition-delay:1s}
.revealed .mockup-timeline-fill{animation:timeline-fill 1.2s .6s ease both}
.revealed .mockup-ring:nth-child(2){animation:ring-grow .6s .2s ease both}
.revealed .mockup-ring:nth-child(3){animation:ring-grow .6s .4s ease both}
.revealed .mockup-ring:nth-child(4){animation:ring-grow .6s .6s ease both}
@keyframes timeline-fill{from{width:0}to{width:75%}}
@keyframes ring-grow{from{opacity:0;transform:scale(.5)}to{opacity:1;transform:scale(1)}}
```

- [ ] **Step 2: Add promise section layout override for mockup grid**

The `.promise` class currently uses `grid-template-columns: .65fr 1.2fr 1fr`. The two promise sections that get mockups need a two-column layout instead. Add this after the mockup styles, still above the reduced-motion rule:

```css
/* Promise sections with mockups get 2-col layout */
.promise-illustrated{grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.promise-illustrated>div{display:flex;flex-direction:column;gap:12px}
.promise-illustrated>div>span{font-size:11px;letter-spacing:1px}
.promise-illustrated>div>h2{font:500 34px/1.2 Manrope;letter-spacing:-1px;margin:0}
.promise-illustrated>div>p{margin:0;line-height:1.8;color:#687163}
.promise-illustrated>div>a{font-size:13px;font-weight:700}
@media(max-width:800px){.promise-illustrated{grid-template-columns:1fr}}
```

- [ ] **Step 3: Commit**

```bash
git add site.css
git commit -m "feat: add mockup illustration and layout styles"
```

---

### Task 4: Add `data-reveal` Attributes + Mockup HTML to `index.html`

**Files:**
- Modify: `index.html`

This is the largest task. The HTML is minified on a few long lines. Each step targets a specific section.

- [ ] **Step 1: Add `<script src="motion.js"></script>` before closing `</body>`**

Find:
```html
<script src="site.js"></script><script src="sections.js"></script><script src="assessment.js"></script></body></html>
```

Replace with:
```html
<script src="site.js"></script><script src="sections.js"></script><script src="assessment.js"></script><script src="motion.js"></script></body></html>
```

`motion.js` loads last so all `[data-reveal]` elements exist in the DOM when it runs.

- [ ] **Step 2: Add reveals to Hero section**

Find:
```html
<section class="shell page-heading"><p class="eyebrow">YOUR FRACTIONAL CHIEF AI OFFICER</p><h1>A human guide.<br>A smarter way<br>to <em>work.</em></h1><p class="intro">AI is moving fast. We help your business find its footing—with a clear plan, useful tools, and a real person in your corner.</p><div class="hero-actions"><a class="button" href="contact.html">Meet your AI Sherpa ↗</a><a href="pricing.html">Explore pricing →</a></div><p class="quiet">Strategy · Implementation · Ongoing support</p></section>
```

Replace with:
```html
<section class="shell page-heading"><p class="eyebrow" data-reveal data-reveal-delay="0">YOUR FRACTIONAL CHIEF AI OFFICER</p><h1 data-reveal class="reveal-up" data-reveal-delay="1">A human guide.<br>A smarter way<br>to <em>work.</em></h1><p class="intro" data-reveal class="reveal-up" data-reveal-delay="2">AI is moving fast. We help your business find its footing—with a clear plan, useful tools, and a real person in your corner.</p><div class="hero-actions" data-reveal class="reveal-up" data-reveal-delay="3"><a class="button" href="contact.html">Meet your AI Sherpa ↗</a><a href="pricing.html">Explore pricing →</a></div><p class="quiet" data-reveal class="reveal-up" data-reveal-delay="4">Strategy · Implementation · Ongoing support</p></section>
```

- [ ] **Step 3: Replace Promise 1 (Find Clarity) with illustrated version**

Find:
```html
<section class="shell promise"><span>01 / FIND CLARITY</span><h2>Big-picture thinking.<br>Hands-on help.</h2><p>Think fractional Chief AI Officer, with the practical support of an AI help desk. We help you choose where to begin, get the work moving, and bring your people along.</p><a href="services.html">Explore our services ↗</a></section>
```

Replace with:
```html
<section class="shell promise promise-illustrated"><div data-reveal class="reveal-left"><span>01 / FIND CLARITY</span><h2>Big-picture thinking.<br>Hands-on help.</h2><p>Think fractional Chief AI Officer, with the practical support of an AI help desk. We help you choose where to begin, get the work moving, and bring your people along.</p><a href="services.html">Explore our services ↗</a></div><div data-reveal class="reveal-right mockup"><div class="mockup-chrome" data-anim="0"><span></span><span></span><span></span></div><div class="mockup-inner"><div class="mockup-sidebar" data-anim="1"><span></span><span style="width:60%"></span><span style="width:75%"></span><span style="width:50%"></span></div><div class="mockup-main"><div class="mockup-row" data-anim="2"><span class="dot"></span><span class="bar"></span></div><div class="mockup-row" data-anim="3"><span class="dot" style="background:#d9fa62"></span><span class="bar" style="width:70%"></span></div><div class="mockup-row" data-anim="4"><span class="dot"></span><span class="bar" style="width:55%"></span></div><span class="mockup-badge" data-anim="5">AI Draft Ready</span></div></div></div></section>
```

- [ ] **Step 4: Add reveals to Dark Band (Stories) section**

Find:
```html
<section class="dark-band"><div class="shell"><p class="eyebrow">PRACTICAL AI, IN MOTION</p><h2>See what a little<br>help can change.</h2><p class="intro">Three everyday workflows. A useful first draft. A person in control.</p><div id="stories"></div></div></section>
```

Replace with:
```html
<section class="dark-band"><div class="shell"><p class="eyebrow" data-reveal class="reveal-up">PRACTICAL AI, IN MOTION</p><h2 data-reveal class="reveal-up" data-reveal-delay="1">See what a little<br>help can change.</h2><p class="intro" data-reveal class="reveal-up" data-reveal-delay="2">Three everyday workflows. A useful first draft. A person in control.</p><div id="stories" data-reveal class="reveal-up" data-reveal-delay="3"></div></div></section>
```

- [ ] **Step 5: Add reveals to Work Map section**

Find:
```html
<section class="reference-sections shell" id="work-map"><p class="section-label">Know what to do</p><h2>See where your team's time goes.</h2><p class="section-intro">Understand the work that repeats, who carries it, and where an AI assistant could help.</p><div class="report-tabs" role="tablist" aria-label="Work map views"></div><div id="report-view" role="tabpanel" tabindex="0"></div><p class="sample-note">Illustrative business and sample data. This demo is not connected to an inbox.</p><div class="report-questions"><span>Do we need another hire?</span><span>Why does work wait on one person?</span><span>Where could we respond faster?</span></div></section>
```

Replace with:
```html
<section class="reference-sections shell" id="work-map"><p class="section-label" data-reveal class="reveal-up">Know what to do</p><h2 data-reveal class="reveal-up" data-reveal-delay="1">See where your team's time goes.</h2><p class="section-intro" data-reveal class="reveal-up" data-reveal-delay="2">Understand the work that repeats, who carries it, and where an AI assistant could help.</p><div class="report-tabs" role="tablist" aria-label="Work map views" data-reveal class="reveal-up" data-reveal-delay="3"></div><div id="report-view" role="tabpanel" tabindex="0" data-reveal class="reveal-up" data-reveal-delay="4"></div><p class="sample-note">Illustrative business and sample data. This demo is not connected to an inbox.</p><div class="report-questions" data-reveal class="reveal-up" data-reveal-delay="5"><span>Do we need another hire?</span><span>Why does work wait on one person?</span><span>Where could we respond faster?</span></div></section>
```

- [ ] **Step 6: Add reveals to Automations section**

Find:
```html
<section class="reference-sections shell" id="automations"><p class="section-label">Automate</p><h2>What can you automate?</h2><p class="section-intro">Explore a part of your business. See what AI can prepare and where your approval comes in.</p><div class="function-grid"></div><div class="automation-preview" aria-live="polite"><span class="section-label">Example workflow</span><h3 id="automation-name"></h3><div class="automation-steps" id="automation-steps"></div><button class="btn" id="run-automation">Run example →</button><p id="automation-status">Select a business function to explore its workflow.</p></div></section>
```

Replace with:
```html
<section class="reference-sections shell" id="automations"><p class="section-label" data-reveal class="reveal-up">Automate</p><h2 data-reveal class="reveal-up" data-reveal-delay="1">What can you automate?</h2><p class="section-intro" data-reveal class="reveal-up" data-reveal-delay="2">Explore a part of your business. See what AI can prepare and where your approval comes in.</p><div class="function-grid" data-reveal class="reveal-up" data-reveal-delay="3"></div><div class="automation-preview" data-reveal class="reveal-up" data-reveal-delay="4" aria-live="polite"><span class="section-label">Example workflow</span><h3 id="automation-name"></h3><div class="automation-steps" id="automation-steps"></div><button class="btn" id="run-automation">Run example →</button><p id="automation-status">Select a business function to explore its workflow.</p></div></section>
```

- [ ] **Step 7: Add reveals to Pricing section**

Find:
```html
<section class="reference-sections shell" id="plans" aria-label="Pricing"><p class="eyebrow">A CLEAR INVESTMENT</p><h2>Start small. Build what matters.</h2><ol class="map-pricing">
```

Replace with:
```html
<section class="reference-sections shell" id="plans" aria-label="Pricing"><p class="eyebrow" data-reveal class="reveal-up">A CLEAR INVESTMENT</p><h2 data-reveal class="reveal-up" data-reveal-delay="1">Start small. Build what matters.</h2><ol class="map-pricing" data-reveal class="reveal-up" data-reveal-delay="2">
```

- [ ] **Step 8: Replace Promise 2 (Trust) with illustrated version**

Find:
```html
<section class="shell promise"><span>BUILT AROUND TRUST</span><h2>Your data deserves<br>clear boundaries.</h2><p>Before connecting tools, we agree on access, handling, and the decisions that stay with your people.</p><a href="trust.html">Information for your IT team →</a></section>
```

Replace with:
```html
<section class="shell promise promise-illustrated"><div data-reveal class="reveal-left mockup"><div class="mockup-shield"><span class="mockup-lock">🛡</span><span class="mockup-ring"></span><span class="mockup-ring"></span><span class="mockup-ring"></span></div><div class="mockup-labels"><span data-anim="3">Read only</span><span data-anim="4">Your approval</span><span data-anim="5">No training</span></div></div><div data-reveal class="reveal-right"><span>BUILT AROUND TRUST</span><h2>Your data deserves<br>clear boundaries.</h2><p>Before connecting tools, we agree on access, handling, and the decisions that stay with your people.</p><a href="trust.html">Information for your IT team →</a></div></section>
```

- [ ] **Step 9: Add reveals to Final CTA section**

Find:
```html
<section class="shell final-cta"><p class="eyebrow">YOUR NEXT STEP</p><h2>A clearer path starts<br>with a conversation.</h2><a class="button" href="contact.html">Find your starting point ↗</a></section>
```

Replace with:
```html
<section class="shell final-cta" data-reveal class="reveal-scale"><p class="eyebrow">YOUR NEXT STEP</p><h2>A clearer path starts<br>with a conversation.</h2><div class="mockup" style="margin:25px 0"><div class="mockup-convo"><div class="mockup-bubble left" data-anim="1">What would help my team most?</div><div class="mockup-bubble right" data-anim="2">Let's map where your time goes first.</div><div class="mockup-bubble left" data-anim="3">That sounds like a good start.</div></div><div class="mockup-timeline"><div class="mockup-timeline-fill"></div></div><div class="mockup-dots"><span><span class="mockup-dot-label">Map</span></span><span><span class="mockup-dot-label">Plan</span></span><span><span class="mockup-dot-label">Build</span></span><span><span class="mockup-dot-label">Run</span></span></div></div><a class="button" href="contact.html">Find your starting point ↗</a></section>
```

- [ ] **Step 10: Commit**

```bash
git add index.html
git commit -m "feat: add data-reveal attributes and mockup illustrations to homepage"
```

---

### Task 5: Stagger Delays for Grid Children (`sections.css`)

**Files:**
- Append to: `sections.css`

- [ ] **Step 1: Add stagger CSS for function-grid and pricing cards**

Append to `sections.css`, before the `@media(prefers-reduced-motion:reduce)` rule at the end:

```css
/* Stagger children when parent is revealed */
.revealed .function-grid button,.revealed .map-pricing li{opacity:0;animation:arrive .45s ease both}
.revealed .function-grid button:nth-child(1),.revealed .map-pricing li:nth-child(1){animation-delay:.1s}
.revealed .function-grid button:nth-child(2),.revealed .map-pricing li:nth-child(2){animation-delay:.2s}
.revealed .function-grid button:nth-child(3),.revealed .map-pricing li:nth-child(3){animation-delay:.3s}
.revealed .function-grid button:nth-child(4){animation-delay:.4s}
.revealed .function-grid button:nth-child(5){animation-delay:.5s}
.revealed .function-grid button:nth-child(6){animation-delay:.6s}
```

The `@keyframes arrive` animation is already defined in `site.css`.

- [ ] **Step 2: Commit**

```bash
git add sections.css
git commit -m "feat: add stagger animation delays for grid children"
```

---

### Task 6: Visual QA in Browser

**Files:** None (read-only verification)

- [ ] **Step 1: Serve the site locally and open in Chrome**

```bash
cd /Users/riz/Social-gear && python3 -m http.server 8765 &
```

Open `http://localhost:8765` in Chrome.

- [ ] **Step 2: Scroll through the entire page and verify:**

1. Hero elements stagger in on page load (eyebrow first, then h1, intro, buttons)
2. Promise 1 (Find Clarity): text slides from left, mockup slides from right with internal stagger (sidebar, rows, badge)
3. Dark band stories section fades in on scroll
4. Work Map: heading, tabs, report panel, questions fade in sequentially
5. Automations: heading, grid buttons stagger, preview panel fades in
6. Pricing: heading, then three cards stagger in
7. Promise 2 (Trust): shield mockup slides from left with animating rings, text slides from right
8. Final CTA: scales in, conversation bubbles stagger, timeline fills, milestone dots appear

- [ ] **Step 3: Test reduced motion**

Open Chrome DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion: reduce". Reload page. Verify all elements are immediately visible with no animation.

- [ ] **Step 4: Test mobile layout**

In DevTools, toggle device toolbar (responsive mode). At 800px and below, verify:
- Promise sections stack to single column
- Mockups display full-width below text
- Function grid goes to single column
- No horizontal overflow

- [ ] **Step 5: Stop the server**

```bash
kill %1
```
