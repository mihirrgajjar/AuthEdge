/**
 * AuthEdge — Premium Button Component
 *
 * Supports Primary (Gradient), Secondary (Outline), and Ghost styles.
 * Employs SVG gradients for the primary button background to stay zero-dependency.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {theme} from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isGhost = variant === 'ghost';

  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (!isDisabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={isDisabled}
      style={[
        styles.baseButton,
        isSecondary && styles.secondaryButton,
        isGhost && styles.ghostButton,
        isDisabled && styles.disabledButton,
        style,
      ]}
    >
      {/* Primary variant uses SVG gradient background */}
      {isPrimary && !isDisabled && (
        <View style={StyleSheet.absoluteFillObject}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={theme.colors.gradientStart} />
                <Stop offset="50%" stopColor={theme.colors.primaryCyan} />
                <Stop offset="100%" stopColor={theme.colors.gradientEnd} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" rx={theme.spacing.radius.md} fill="url(#btnGrad)" />
          </Svg>
        </View>
      )}

      {/* Button content */}
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={isPrimary ? '#FFFFFF' : theme.colors.accentCyan}
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.baseText,
                isPrimary && styles.primaryText,
                isSecondary && styles.secondaryText,
                isGhost && styles.ghostText,
                isDisabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    height: 52,
    borderRadius: theme.spacing.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 1, // Ensure content sits above primary SVG gradient background
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.surfaceBorder,
  },
  ghostButton: {
    backgroundColor: 'transparent',
    height: 40,
  },
  disabledButton: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: 'transparent',
  },
  baseText: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.bold as any,
    letterSpacing: theme.typography.letterSpacing.wide,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: theme.colors.textAccent,
  },
  ghostText: {
    color: theme.colors.textSecondary,
  },
  disabledText: {
    color: '#4A5568',
  },
});
