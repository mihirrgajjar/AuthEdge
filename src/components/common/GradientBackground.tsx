/**
 * AuthEdge — Gradient Background
 *
 * Full-screen glassmorphic background combining a dark vertical gradient
 * and a subtle radial neon-cyan glow at the top center.
 * Implemented using react-native-svg to avoid native compilation issues.
 */

import React from 'react';
import {StyleSheet, View, ViewStyle, Dimensions} from 'react-native';
import Svg, {Defs, LinearGradient, RadialGradient, Rect, Stop} from 'react-native-svg';
import {theme} from '../../theme';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

const {width, height} = Dimensions.get('window');

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Background SVG Canvas */}
      <Svg style={StyleSheet.absoluteFillObject} width={width} height={height}>
        <Defs>
          {/* Vertical base gradient */}
          <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.background} />
            <Stop offset="40%" stopColor={theme.colors.surfaceDark} />
            <Stop offset="100%" stopColor={theme.colors.surfaceElevated} />
          </LinearGradient>

          {/* Radial Top Glow (Accent Neon Cyan) */}
          <RadialGradient
            id="radialGlow"
            cx="50%"
            cy="0%"
            rx="60%"
            ry="40%"
            fx="50%"
            fy="0%"
          >
            <Stop offset="0%" stopColor={theme.colors.accentCyan} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={theme.colors.background} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Base Layer */}
        <Rect width="100%" height="100%" fill="url(#bgGrad)" />

        {/* Glow Layer */}
        <Rect width="100%" height="100%" fill="url(#radialGlow)" />
      </Svg>

      {/* Content Container */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
});
