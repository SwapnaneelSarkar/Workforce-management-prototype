const colors = {
  primaryDark: "#2D3748",
  secondaryGray: "#4A5568",
  accentBlue: "#3182CE",
  bgLight: "#F7F7F9",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  success: "#48BB78",
  warning: "#ED8936",
  danger: "#F56565",
  mutedText: "#718096",
  ink: "#1A202C",
}

const spacing = {
  base: 8,
  s: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  cardPadding: 20,
  pageMargin: 32,
}

const typographyScale = {
  h1: { size: "28px", weight: 700, lineHeight: "36px", color: colors.primaryDark },
  h2: { size: "18px", weight: 600, lineHeight: "26px", color: colors.primaryDark },
  h3: { size: "14px", weight: 600, lineHeight: "20px", color: colors.secondaryGray },
  body: { size: "14px", weight: 400, lineHeight: "22px", color: colors.secondaryGray },
  label: { size: "12px", weight: 600, lineHeight: "16px", letterSpacing: "0.08em", color: colors.mutedText },
}

const typography = {
  fontFamily: '"Geist", "Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  scale: typographyScale,
}

const radii = {
  card: 8,
  button: 6,
  input: 6,
  pill: 9999,
}

const shadows = {
  subtle: "0 1px 4px rgba(16, 24, 40, 0.06)",
  elevated: "0 6px 18px rgba(16, 24, 40, 0.08)",
}

const layout = {
  sidebarWidth: 260,
  containerMaxWidth: 1200,
  pageMargin: spacing.pageMargin,
  cardPadding: spacing.cardPadding,
  gutter: spacing.md,
}

export const tokens = {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  layout,
}

export { colors, spacing, typography, radii, shadows, layout }

