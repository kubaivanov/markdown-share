# Design System Specification

## 1. Overview & Creative North Star

### The Creative North Star: "The Digital Curator"
This design system moves away from the utilitarian "file explorer" aesthetic and toward a high-end editorial experience. It treats document management not as a chore, but as a curated exhibition of information. By prioritizing intentional asymmetry, expansive whitespace, and sophisticated tonal shifts, we create a vibe that is simultaneously authoritative and effortless.

The "Digital Curator" breaks the rigid, boxed-in templates of traditional SaaS. We utilize overlapping layers and varied typographic scales to guide the user’s eye, making the interface feel like a premium digital magazine rather than a spreadsheet.

---

## 2. Colors & Surface Architecture

The palette is anchored in deep, sophisticated blues and greys, punctuated by a crisp emerald green (`tertiary` tokens) that signals security and "active" status.

### The "No-Line" Rule
**Borders are prohibited for structural sectioning.** We do not use 1px solid lines to separate the sidebar from the main content or headers from lists. Instead, boundaries must be defined solely through background color shifts.
- Use `surface` (#f8f9fa) for the primary canvas.
- Use `surface-container-low` (#f3f4f5) or `surface-container` (#edeeef) to define distinct functional zones.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, physical layers. 
- **Base:** `background` (#f8f9fa)
- **Primary Sectioning:** `surface-container-low`
- **Component Containers (Cards):** `surface-container-lowest` (#ffffff) sitting on top of `surface-container`. This creates a soft, natural lift through tonal contrast rather than a heavy shadow.

### The "Glass & Gradient" Rule
To elevate the experience, floating elements (like modals or hovering toolbars) should utilize Glassmorphism. Use semi-transparent `surface` colors with a `backdrop-blur` of 12px–20px. 
- **Signature CTAs:** Apply a subtle linear gradient from `primary` (#000000) to `primary_container` (#101b30) to provide depth and "soul" to main action buttons.

---

## 3. Typography: Editorial Authority

We use a dual-font strategy to balance character with readability.

*   **Display & Headlines (Manrope):** Used for large-scale impact. The wide apertures and modern geometric shapes of Manrope provide a "tech-forward" yet professional feel.
    *   *Headline-LG:* 2rem — Reserved for page titles.
*   **Body & Labels (Inter):** The workhorse for data. Inter’s high x-height ensures document names and metadata remain legible at small sizes.
    *   *Body-MD:* 0.875rem — The standard for document lists and descriptions.
*   **Monospace Accents:** For file paths or terminal commands (as seen in the reference UI), use a monospace font in `on_surface_variant` (#44474c) to imply technical precision.

---

## 4. Elevation & Depth

We convey hierarchy through **Tonal Layering** rather than traditional shadows or lines.

- **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` card on a `surface-container-high` background. The shift in hex code provides enough "pop" to signify interactivity.
- **Ambient Shadows:** For high-floating elements (e.g., a "Share" modal), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 29, 0.05)`. The color is a low-opacity version of `on_surface`.
- **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline_variant` (#c4c6cc) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Buttons & Chips
- **Primary Button:** High-contrast `primary` (#000000) background with `on_primary` (#ffffff) text. Use `xl` (0.75rem) roundedness for a modern, approachable feel.
- **Status Chips:** Use `tertiary_fixed` (#78fbb6) background with `on_tertiary_fixed_variant` (#005232) for "Active" or "Secure" states. Avoid heavy borders; keep the background soft and the text bold.

### Input Fields
- **Text Inputs:** Use `surface_container_highest` (#e1e3e4) for the input trough. On focus, shift to a `surface_container_lowest` (#ffffff) background with a "Ghost Border" of `surface_tint`.
- **Labels:** Use `label-md` in `on_surface_variant`.

### Cards & Document Lists
- **The Divider Ban:** Strictly forbid 1px horizontal lines between list items. 
- **Spacing as Separator:** Use the Spacing Scale `5` (1.7rem) or `6` (2rem) to create clear vertical breathing room between rows. 
- **Hover States:** On hover, a list item should transition its background to `surface_container_low` (#f3f4f5) with a transition speed of 200ms.

### Custom Component: The "Metadata Cluster"
For a document-heavy app, group "File Type" (using `secondary_container`), "Owner," and "Last Modified" into a horizontal cluster using `label-sm` typography. This mimics editorial credits in a magazine.

---

## 6. Do's and Don'ts

### Do
- **DO** use asymmetry. Place the page title (`display-md`) off-center or aligned with a specific column to break the "standard template" look.
- **DO** use `tertiary` emerald tones to highlight security features (e.g., "Encrypted" or "Verified").
- **DO** maximize whitespace. If you think there is enough space, add 20% more. Use the `24` (8.5rem) spacing token for top-level section margins.

### Don't
- **DON'T** use pure black for text on a white background. Use `on_surface` (#191c1d) for a softer, premium reading experience.
- **DON'T** use traditional "Drop Shadows" with high opacity. They feel dated and "heavy."
- **DON'T** use 1px borders to separate content blocks. Re-read the "No-Line" rule.
- **DON'T** use standard blue for links. Use `secondary` (#47607e) for a more sophisticated, muted professional tone.