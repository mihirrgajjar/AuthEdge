/**
 * AuthEdge — Color Palette
 *
 * All colors are dynamically synchronized with the colors extracted from the
 * AuthEdge logo (dark blue-cyan gradients, rich contrast, electric greens).
 */

export const colors = {
  // Main backgrounds
  background: '#000000', // App background — matches logo backdrop
  surfaceDark: '#060B18', // Card/panel backgrounds — matches shield interior
  surfaceElevated: '#0C1326', // Elevated cards, modals, bottom sheets
  surfaceBorder: '#1A2340', // Subtle borders on glass cards

  // Primary palette & gradients
  primaryBlue: '#1565C0', // Left shield edge — buttons, active states
  primaryCyan: '#0D8FD6', // Mid-gradient — links, secondary actions
  primaryTeal: '#00BFA5', // Scanner brackets — focused states, badges
  accentCyan: '#00E5A0', // Right shield / checkmark — success, CTAs, highlights
  meshBlue: '#4FC3F7', // Face wireframe — subtle accents, decorative lines

  // Text hierarchy
  textPrimary: '#FFFFFF', // "Auth" text — headings, primary content
  textSecondary: '#8F9BB3', // Muted labels, timestamps, placeholders
  textAccent: '#00D4AA', // Tagline text — emphasized labels, active tabs

  // Gradients (for linear gradient components)
  gradientStart: '#1565C0',
  gradientEnd: '#00E5A0',
  gradientMiddle: '#0D8FD6',

  // Status indicators
  success: '#00E5A0', // Verification passed — same as accent cyan
  error: '#FF5252', // Verification failed, destructive actions
  warning: '#FFB74D', // Low confidence, poor lighting alerts
  offline: '#FF8A65', // No connectivity indicator
};
