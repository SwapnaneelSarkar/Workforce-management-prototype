# Design Guidelines

## Spacing & Layout
- Base unit `8px`; stack spacing on 8/12/16/24/32/48 grid.
- Page container max-width `1200px` with `32px` margin (`20px` on mobile).
- Cards use `20px` padding, `8px` radius, subtle shadow `0 1px 4px rgba(16,24,40,0.06)`.
- Sidebar fixed `260px` on desktop, collapses to icon column on tablet and drawer on mobile.

## Tokens (see `lib/tokens.js`)
- Colors: `primaryDark #2D3748`, `secondaryGray #4A5568`, `accentBlue #3182CE`, `bgLight #F7F7F9`, `border #E2E8F0`, `success #48BB78`, `warning #ED8936`, `danger #F56565`, `mutedText #718096`.
- Typography (from `lib/typography.js`): `h1 28/36/700`, `h2 18/26/600`, `h3 14/20/600`, `body 14/22/400`, `label 12/16/600` uppercase.
- Radii: cards `8px`, inputs/buttons `6px`, pills full.
- Shadows: subtle `0 1px 4px rgba(16,24,40,0.06)`; elevated `0 6px 18px rgba(16,24,40,0.08)`.

## Button Variants
- Primary: dark slate background, white text, 12px vertical padding, hover lighten `#3B4963`.
- Secondary: light background `#F7F7F9`, slate text, border `#E2E8F0`.
- Outline: white background, slate text, 1px border `#E2E8F0`.
- Ghost: transparent background, slate text, hover fill `#EEF0F4`.
- Danger: `#F56565` background, white text.
- Disabled: 50% opacity with muted text regardless of variant.

## Table Rules
- Header background `#F7F7F9`, uppercase labels 12px with `0.08em` tracking.
- Cell padding `16px`; hover rows `#FDFDFD`.
- Status chips use pill treatment with white text on semantic backgrounds.
- Action column aligned right with icon buttons; progress bars aligned to baseline inside cells.





