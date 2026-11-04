# Motion Explainers Design Spec

## Overview

Add Lemonbrand-style scroll-triggered animations and animated UI mockup illustrations to the Social Gear AI homepage. Pure CSS animations triggered by IntersectionObserver — no external dependencies.

Reference: https://www.lemonbrand.io/

## Goals

1. Make text-heavy sections more engaging with animated UI mockup illustrations
2. Add polished scroll-triggered entrance animations across all homepage sections
3. Maintain zero-dependency vanilla HTML/CSS/JS architecture
4. Respect `prefers-reduced-motion` throughout

## Architecture

### 1. Scroll-Reveal System (`motion.js`)

Replace the current unused `motion.js` with a generic scroll-reveal controller.

**How it works:**
- Elements marked with `data-reveal` get a CSS class `revealed` when they enter the viewport
- Single IntersectionObserver instance with `threshold: 0.15` watches all `[data-reveal]` elements
- Stagger support: `data-reveal-delay="1"` / `"2"` / `"3"` adds incremental transition-delay (each unit = 120ms)
- Once revealed, the element stays revealed (no re-triggering on scroll back up)
- If `prefers-reduced-motion: reduce`, all elements start in `revealed` state immediately

**CSS animation classes:**
- `.reveal-up` — fade in + translate up 30px (default, most common)
- `.reveal-scale` — fade in + scale from 0.92
- `.reveal-left` / `.reveal-right` — fade in + translate from side (for split layouts)

**Base CSS pattern:**
```css
[data-reveal] { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
[data-reveal].revealed { opacity: 1; transform: none; }
[data-reveal][data-reveal-delay="1"] { transition-delay: 120ms; }
[data-reveal][data-reveal-delay="2"] { transition-delay: 240ms; }
[data-reveal][data-reveal-delay="3"] { transition-delay: 360ms; }
```

### 2. Animated UI Mockup Illustrations

Three new HTML/CSS illustrations for the currently text-only sections. Each is a stylized mini "app screen" built with divs, not images. Elements within each mockup animate in sequence when the section is revealed.

#### Illustration A: "Find Clarity" promise section
- Mini app window chrome (three dots, title bar)
- Left sidebar with nav items fading in
- Main content: three task rows sliding in with stagger
- A green "AI Draft Ready" badge animating in last
- Communicates: organized workspace with AI preparing work

#### Illustration B: "Trust" promise section  
- Shield/lock icon at center
- Three concentric rings animating outward (data boundary visualization)
- Permission labels fading in around the perimeter: "Read only", "Your approval", "No training"
- Communicates: clear data boundaries

#### Illustration C: "Final CTA" section
- Simplified conversation bubbles animating in
- A timeline/progress bar filling from left to right
- Milestone dots appearing along the bar
- Communicates: journey from conversation to progress

**Mockup styling:**
- Background: `#fffefa` (matches existing `--white`)
- Border-radius: 16px with subtle box-shadow
- Accent color: `#244d3d` (existing `--green`) and `#d9fa62` (existing brand highlight)
- Abstract shapes: rounded rectangles in muted greens/tans matching the site palette
- Window chrome dots: `#e74c3c`, `#f39c12`, `#2ecc71` (standard red/yellow/green)

### 3. Section-by-Section Animation Plan

| Section | Animation | Details |
|---------|-----------|---------|
| **Hero** (page-heading) | `reveal-up` | h1, intro, actions staggered (delay 0, 1, 2) |
| **Promise 1** (Find Clarity) | `reveal-left` text, `reveal-right` mockup | Text slides from left, Illustration A from right |
| **Stories** (dark band) | `reveal-up` | Heading reveals, then story cards stagger in |
| **Work Map** | `reveal-up` | Heading, then tabs, then report panel |
| **Automations** | `reveal-up` | Heading, then function grid buttons stagger (6 buttons, delays 0-2 cycling) |
| **Promise 2** (Trust) | `reveal-right` text, `reveal-left` mockup | Illustration B from left, text from right |
| **Pricing** | `reveal-up` | Heading, then three pricing cards stagger |
| **Final CTA** | `reveal-scale` | Entire section scales in, Illustration C animates internally |

### 4. Mockup Internal Animations

Once a mockup's parent section is `revealed`, the mockup plays its internal sequence using CSS `animation-delay` chains:

```
Parent revealed → 
  0.0s: window chrome fades in
  0.2s: sidebar/structure appears
  0.4s: first content row slides in
  0.6s: second content row slides in
  0.8s: third content row slides in
  1.0s: badge/accent element appears
```

These use `@keyframes` with `animation-fill-mode: both` and `animation-play-state` controlled by the `revealed` class on the parent.

## Files Changed

| File | Change |
|------|--------|
| `motion.js` | Rewrite: IntersectionObserver scroll-reveal controller |
| `site.css` | Add reveal animation base classes, mockup illustration styles |
| `index.html` | Add `data-reveal` attributes to sections, add mockup illustration HTML to promise sections, add `<script src="motion.js">` |
| `sections.css` | Add stagger delays for grid children |

## Files NOT Changed

- `sections.js` — existing interactive logic untouched
- `site.js` — existing nav/menu logic untouched
- `assessment.js` — assessment dialog untouched
- Other pages (`services.html`, `pricing.html`, etc.) — homepage only for now

## Reduced Motion

All animations gated behind `prefers-reduced-motion`:
- JS: if reduced motion preferred, add `revealed` class to everything immediately
- CSS: existing `@media(prefers-reduced-motion:reduce)` rule already disables transitions/animations

## Performance

- Single IntersectionObserver for all elements (not one per element)
- CSS transitions (GPU-composited `opacity` and `transform` only)
- No JavaScript animation loops or requestAnimationFrame
- Mockup illustrations are pure HTML/CSS — no images to load
