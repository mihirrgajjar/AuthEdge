/**
 * AuthEdge — Premium Glassmorphic Card
 *
 * Provides a sleek frosted glass container with a subtle dark indigo border.
 * Optionally supports a cyan neon glow accent (perfect for focused items or successful events).
 */

import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import {theme} from '../../theme';

interface CardProps {
  children: React.ReactNode;
  glow?: 'none' | 'cyan' | 'blue';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  glow = 'none',
  style,
}) => {
  const getGlowStyle = () => {
    switch (glow) {
      case 'cyan':
        return theme.spacing.glows.cyan;
      case 'blue':
        return theme.spacing.glows.blue;
      default:
        return theme.spacing.glows.card;
    }
  };

  return (
    <View style={[styles.card, getGlowStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(6, 11, 24, 0.85)',
    borderRadius: theme.spacing.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: theme.spacing.md,
  },
});
