/**
 * AuthEdge — Typography System
 *
 * Employs native system font families to keep bundle size small
 * while utilizing a highly legible, premium type-scale for a technical, secure feel.
 */

import {Platform} from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export const typography = {
  fontFamily,

  sizes: {
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    h5: 16,
    h6: 14,
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    caption: 11,
    label: 12,
  },

  lineHeights: {
    h1: 40,
    h2: 32,
    h3: 26,
    h4: 24,
    h5: 22,
    h6: 20,
    bodyLarge: 24,
    bodyMedium: 20,
    bodySmall: 18,
    caption: 14,
    label: 16,
  },

  weights: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '900',
  } as const,

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    extraWide: 1.5,
  },
};
