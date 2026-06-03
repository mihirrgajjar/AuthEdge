/**
 * AuthEdge Theme System
 *
 * Exposes colors, typography, spacing, and dynamic theme hooks/providers.
 */

import React, {createContext, useContext} from 'react';
import {colors} from './colors';
import {typography} from './typography';
import {spacing} from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
};

export type ThemeType = typeof theme;

const ThemeContext = createContext<ThemeType>(theme);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  return React.createElement(ThemeContext.Provider, {value: theme}, children);
};

export const useTheme = () => useContext(ThemeContext);

export {colors} from './colors';
export {typography} from './typography';
export {spacing} from './spacing';
