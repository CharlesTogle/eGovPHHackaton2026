---
version: 1.0
name: eGovPH-Professional-Blue-Design-System
description: A clean, highly accessible, enterprise-grade design system tailored for eGovPH official platforms and disaster response dashboards. Built on a rich royal blue identity (#0646f4), slate neutral hierarchy (Slate 900 ink on Slate 50 canvas), crisp hairline borders, Inter typography, and dense, structured data panels.

colors:
  blue-primary: "#0646f4"
  blue-hover: "#053bce"
  blue-deep: "#0f3cb5"
  blue-soft: "#eff4ff"
  ink: "#0f172a"
  ink-secondary: "#334155"
  muted-text: "#64748b"
  line: "#e2e8f0"
  soft-bg: "#f8fafc"
  card-bg: "#ffffff"
  good: "#059669"
  good-bg: "#ecfdf5"
  warn: "#d97706"
  warn-bg: "#fffbeb"
  danger: "#dc2626"
  danger-bg: "#fef2f2"

typography:
  display-lg:
    fontFamily: "'Inter', sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.03em
  display-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.025em
  heading-lg:
    fontFamily: "'Inter', sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  heading-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: "'Inter', sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "'Inter', sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.45

rounded:
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px

components:
  section-card:
    backgroundColor: "{colors.card-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.line}"
    boxShadow: "0 1px 3px 0 rgb(15 23 42 / 0.06)"
  pill-btn-primary:
    backgroundColor: "{colors.blue-primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: 6px 14px
  big-btn-primary:
    backgroundColor: "{colors.blue-primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: 10px 20px
  status-chip:
    rounded: 9999px
    padding: 3px 10px
---

## Overview

The **eGovPH Professional Blue Design System** combines the official blue identity of eGovPH with the high-density, structured UX standards of modern enterprise control walls.

### Design Principles
1. **eGovPH Blue Brand Core**: Vibrant eGov Royal Blue (`#0646f4`) acts as the anchor color for CTAs, active navigation pills, and focus rings.
2. **Slate Neutral Hierarchy**: Text is rendered in deep Slate 900 (`#0f172a`), secondary labels in Slate 700 (`#334155`), and helper copy in Slate 500 (`#64748b`). Pages sit on a subtle Slate 50 (`#f8fafc`) canvas.
3. **Structured Card Containers**: Features and metric blocks sit inside elevated white cards with crisp 1px borders (`#e2e8f0`) and subtle multi-layered drop shadows.
4. **Inter Typography**: Clean font hierarchy with negative letter tracking (`-0.025em`) on titles for high-density legibility.

## Layout & Architecture

- **Navbar / Shell**: Glassmorphism top bar (`rgba(255, 255, 255, 0.92)`) with a clean 1px hairline border.
- **Sidebar**: Fixed 240px navigation drawer on desktop with soft blue hover states and pill indicators.
- **Data Tables**: High-density grid layouts with subtle Slate header backgrounds (`#f8fafc`) and row-hover feedback.
