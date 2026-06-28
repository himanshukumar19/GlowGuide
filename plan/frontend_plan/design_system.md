# GlowGuide Design System

GlowGuide is a professional, calming visual language designed for clinical skincare platforms. It is built on eucalyptus sage and terracotta tones, combined with editorial serif typography and a clean, high-contrast structural grid.

---

## 1. Visual Direction & Principles

* **Clinical Trust & Authority**: Warm, organic tones that feel dermatologist-backed, clean, and professional—moving away from generic hospital blues or overly cute pastel pinks.
* **Editorial Aesthetics**: Clean layouts paired with strong typography that feels premium, balanced, and state-of-the-art.
* **Accessible & Legible**: Colors are calibrated to meet or exceed WCAG 2.1 AA/AAA contrast ratios, ensuring maximum usability.

---

## 2. Color System

Every color is derived from natural, botanical, and mineral skin treatments.

### Brand Colors
| Token | Hex Code | Purpose | Contrast (on white) |
| :--- | :--- | :--- | :--- |
| **Primary** | `#355245` | Refined Eucalyptus Sage (main buttons, active text, headers) | **8.2:1** (WCAG AAA) |
| **Primary Hover** | `#294036` | Darker eucalyptus sage for interactive hover states | **10.5:1** (WCAG AAA) |
| **Secondary** | `#854438` | Deep Terracotta Clay (highlights, Pro subscriptions, badge borders) | **6.1:1** (WCAG AA) |
| **Secondary Hover** | `#69352B` | Darker terracotta hover | **8.0:1** (WCAG AAA) |
| **Accent** | `#F3EFEA` | Alabaster / Chamomile Sand (light badges, promo alerts, light tags) | **1.2:1** (Use dark text) |

### Neutrals & Surfaces
| Token | Hex Code | Name | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `#F7F9F8` | Sage Linen (Refined) | Default page background |
| **Card** | `#FFFFFF` | Pure White | Grid card surfaces and main panels |
| **Muted** | `#EDF0EE` | Sage Mist (Refined) | Scrollbar tracks, circular SVG backgrounds, and secondary wells |
| **Border** | `#DFE3E1` | Sage Border (Refined) | Standard dividers, borders, and input strokes |
| **Foreground** | `#262626` | Charcoal Black | Primary text copy and solid icons |
| **Muted FG** | `#737373` | Slate Grey | Subtitles, meta-text, captions, and secondary labels |

### Semantic Colors
| Token | Hex Code | Role | Purpose |
| :--- | :--- | :--- | :--- |
| **Success** | `#7EC8A0` | Sage Green | Positive score, active items, check marks |
| **Warning** | `#F5B041` | Warm Amber | Pending actions, mild warnings, score alerts |
| **Destructive** | `#E57373` | Rose Red | Errors, deletion warnings, out-of-stock indicators |
| **Info** | `#6BB6FF` | Sky Blue | Informational badges and tooltip icons |

---

## 3. Gradients

Used for hero banners, active card states, and luxurious accents:

* **Primary Gradient**: `linear-gradient(135deg, #355245 0%, #75BFA2 100%)` (Deep Eucalyptus to Sage Green)
* **Accent Gradient**: `linear-gradient(135deg, #F3EFEA 0%, #854438 100%)` (Chamomile Gold to Terracotta Clay)
* **Subtle Gradient**: `linear-gradient(135deg, #F7F9F8 0%, #EDF0EE 100%)` (Sage Linen to Sage Mist)
* **Success Gradient**: `linear-gradient(135deg, #75BFA2 0%, #9BD9BF 100%)` (Sage Green to Pale Mint)

---

## 4. Typography

Typography balances editorial elegance with UI scanability.

* **Headings / Display**: `Playfair Display` (Serif)
  * Applied to: `h1`, `h2`, `h3`, `h4`, `.font-heading`
  * Vibe: High-end luxury, editorial authority.
* **Body / UI Copy**: `Inter` (Sans-Serif)
  * Applied to: paragraphs, buttons, forms, labels, tables, navigation.
  * Vibe: Highly legible, clean, modern.
* **Code / Utility**: `JetBrains Mono` / `Fira Code` (Monospace)
  * Applied to: `code`, pre-formatted code snippets.

---

## 5. Spacing Scale

Based on a consistent **4px grid** to enforce visual rhythm:

| Tailwind Class | Rem Value | Pixels | Application |
| :--- | :--- | :--- | :--- |
| `space-1` | `0.25rem` | 4px | Inner element padding, tight lists |
| `space-2` | `0.5rem` | 8px | Button/Input inner padding, icons gaps |
| `space-3` | `0.75rem` | 12px | Small card inner padding |
| `space-4` | `1rem` | 16px | Grid layout gap, standard text paragraph margins |
| `space-6` | `1.5rem` | 24px | Main card padding, section gaps |
| `space-8` | `2rem` | 32px | Grid layout margin, banner spacing |
| `space-12` | `3rem` | 48px | Heavy block elements spacing |
| `space-16` | `4rem` | 64px | Hero banner top/bottom margins |
| `space-24` | `6rem` | 96px | Section breaks and transitions |

---

## 6. Shadows & Elevations

Soft, diffused depth inspired by modern boutique sites:

* **shadow-soft**: `0 2px 8px rgba(45, 45, 45, 0.08)` (Subtle surface isolation)
* **shadow-card**: `0 4px 12px rgba(45, 45, 45, 0.1)` (Standard card styling)
* **shadow-hover**: `0 8px 24px rgba(45, 45, 45, 0.15)` (Active item hover states)
* **shadow-elevated**: `0 12px 32px rgba(45, 45, 45, 0.2)` (Flyouts, drop-down menus, toasts)
* **shadow-primary**: `0 4px 16px rgba(53, 82, 69, 0.3)` (Sage glow button shadow)
* **shadow-secondary**: `0 4px 16px rgba(133, 68, 56, 0.3)` (Terracotta glow button shadow)

---

## 7. Borders & Radii Scale

Consistent corner curvature prevents visual clashes:

| Utility Class | Value (rem) | Value (pixels) | Application |
| :--- | :--- | :--- | :--- |
| `rounded-gg-sm` | `0.5rem` | 8px | Form inputs, buttons, badges, scrollbar thumbs |
| `rounded-gg` | `1.0rem` | 16px | Color swatches, product cards, floating chat windows |
| `rounded-gg-lg` | `1.5rem` | 24px | Standard dashboard content cards, health score widgets |
| `rounded-gg-xl` | `2.0rem` | 32px | Top hero container panels |

---

## 8. UI Primitives & Components

### Buttons
* **Primary**: Eucalyptus Sage background (`bg-primary`), white text, shadow-primary, scaling feedback (`active:scale-95`). Used for primary actions (e.g., *"Take the Skin Quiz"*, *"Start the Quiz Now"*).
* **Secondary**: Terracotta Clay background (`bg-secondary`), white text, shadow-secondary. Used for premium upgrade links, subscription panels, and accent actions.
* **Accent**: Chamomile Gold background (`bg-accent`), soft black text.
* **Outline**: Transparent background with Sage Border (`border-border`), transitions to `--accent` cream background and forest text on hover.
* **Ghost**: Borderless, transitions to `bg-muted` on hover.

### Form Inputs
* Default outline uses `border-border` (`#DFE3E1`). Focus states shift outline to `border-primary` (`#355245`) with a glow ring `ring-2 ring-primary/20`.

### Cards
* Cards utilize `bg-card` (`#FFFFFF`), `border-border` (`#DFE3E1`), `shadow-soft`, and `hover-lift` transition utilities to elevate on cursor hover.

### Badges
* Rounded tags (`rounded-full`) with a small font sizes (`text-[10px]` or `text-xs`) used to show catalog metadata, stock status, or score indicators.

### Icons
* Powered by Lucide Icons, standardized with a `stroke-width` of `2` (except in delicate titles where `1.5` is preferred) and colored according to parent text flow.

---

## 9. Interactive Patterns

### Product Card
* Reusable commerce block displaying catalog details, user ratings, discounts, out-of-stock covers, and quick-add actions, paired with actual product photography.

### Health Score Widget
* Ring charts displaying an active skincare status score (0-100) mapped onto semantic color ranges:
  * **90-100**: Success Green (`#7EC8A0`) - Excellent
  * **60-89**: Pale Mint (`#A8D5BA`) - Good
  * **40-59**: Warning Amber (`#F5B041`) - Fair
  * **0-39**: Destructive Red (`#E57373`) - Needs Care

### Chatbot Console
* Floating glassmorphic panel (`bg-white/80 backdrop-blur-md`) representing the skincare AI helper, equipped with chat histories and prompt shortcuts.

### Vocabulary (Naming Conventions)
* Use end-user-centered naming:
  * **Skincare Routine** (not RoutineBuilderModel)
  * **Evaluation / Score** (not DiagnosticTelemetry)
  * **Ingredients List** (not SubstanceCompositionMap)
