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
| **Primary** | `#3B5D4E` | Eucalyptus Sage (main buttons, active text, headers) | **7.5:1** (WCAG AAA) |
| **Primary Hover** | `#2E493D` | Darker eucalyptus sage for interactive hover states | **9.2:1** (WCAG AAA) |
| **Primary Active** | `#23382E` | Deepest sage for pressed buttons / focus states | **11.4:1** (WCAG AAA) |
| **Secondary** | `#C58A7F` | Terracotta Clay (accents, secondary actions, indicators) | **2.6:1** (Large text/bg only) |
| **Secondary Hover** | `#B3766B` | Terracotta hover | **3.0:1** (Large text/bg only) |
| **Secondary Active** | `#9F6156` | Terracotta active | **3.7:1** (Large text/bg only) |
| **Accent** | `#E8D4C0` | Chamomile Gold (badges, promo alerts, light tags) | **1.3:1** (Use dark text) |

### Neutrals & Surfaces
| Token | Hex Code | Name | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `#F2F5F3` | Sage Linen | Default page background |
| **Card** | `#FFFFFF` | Pure White | Grid card surfaces and main panels |
| **Muted** | `#E6EBE7` | Sage Mist | Scrollbar tracks, circular SVG backgrounds, and secondary wells |
| **Border** | `#DCE3DE` | Sage Border | Standard dividers, borders, and input strokes |
| **Border Strong** | `#C4CFC8` | Strong Sage Border | High-contrast borders for hover or focus states |
| **Foreground** | `#2D2D2D` | Soft Black | Primary text copy and solid icons |
| **Muted FG** | `#7A7A7A` | Slate Grey | Subtitles, meta-text, captions, and secondary labels |

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

* **Primary Gradient**: `linear-gradient(135deg, #3B5D4E 0%, #7EC8A0 100%)` (Deep Eucalyptus to Sage Green)
* **Accent Gradient**: `linear-gradient(135deg, #E8D4C0 0%, #C58A7F 100%)` (Chamomile Gold to Terracotta Clay)
* **Subtle Gradient**: `linear-gradient(135deg, #F2F5F3 0%, #E6EBE7 100%)` (Sage Linen to Sage Mist)
* **Success Gradient**: `linear-gradient(135deg, #7EC8A0 0%, #A8D5BA 100%)` (Sage Green to Pale Mint)

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
* **shadow-primary**: `0 4px 16px rgba(59, 93, 78, 0.3)` (Sage glow button shadow)
* **shadow-secondary**: `0 4px 16px rgba(197, 138, 127, 0.3)` (Terracotta glow button shadow)

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
* **Primary**: Eucalyptus Sage background (`bg-primary`), white text, shadow-primary, scaling feedback (`active:scale-95`).
* **Secondary**: Terracotta Clay background (`bg-secondary`), white text, shadow-secondary.
* **Accent**: Chamomile Gold background (`bg-accent`), soft black text.
* **Outline**: Transparent background with Sage Border (`border-border`), transitions to light background on hover.
* **Ghost**: Borderless, transitions to `bg-muted` on hover.

### Form Inputs
* Default outline uses `border-border` (`#DCE3DE`). Focus states shift outline to `border-primary` (`#3B5D4E`) with a glow ring `ring-2 ring-primary/20`.

### Cards
* Cards utilize `bg-card` (`#FFFFFF`), `border-border` (`#DCE3DE`), `shadow-soft`, and `hover-lift` transition utilities to elevate on cursor hover.

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
