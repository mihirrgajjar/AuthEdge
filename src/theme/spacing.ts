/**
 * AuthEdge — Spacing & Layout Tokens
 *
 * Consistent spatial scale based on a 4px/8px grid system,
 * border radius scales, and glow/shadow elevation presets.
 */

export const spacing = {
  // Spacing units
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Border Radius
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  // Premium glow/shadow presets
  glows: {
    cyan: {
      shadowColor: '#00E5A0',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 6,
    },
    blue: {
      shadowColor: '#1565C0',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    card: {
      shadowColor: '#000000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 4,
    },
  },
};
