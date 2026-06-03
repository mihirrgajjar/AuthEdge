/**
 * AuthEdge — Face Guide Overlay
 *
 * Renders an oval scanning region, logo-matching corner brackets,
 * and an animated laser line that sweeps vertically across the face area.
 */

import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import {theme} from '../../theme';

interface FaceGuideOverlayProps {
  statusMessage?: string;
  stepText?: string;
}

const {width} = Dimensions.get('window');
const OVAL_WIDTH = 200;
const OVAL_HEIGHT = 260;

export const FaceGuideOverlay: React.FC<FaceGuideOverlayProps> = ({
  statusMessage = 'Align your face in the oval',
  stepText = 'Step 1 of 3: Front Angle',
}) => {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scanAnim]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    // Animates the laser line from the top boundary to the bottom boundary of the oval
    outputRange: [10, OVAL_HEIGHT - 10],
  });

  return (
    <View style={styles.container}>
      {/* Central scanning frame */}
      <View style={styles.scannerFrame}>
        {/* Corner Brackets */}
        <View style={[styles.corner, styles.cornerTL]} />
        <View style={[styles.corner, styles.cornerTR]} />
        <View style={[styles.corner, styles.cornerBL]} />
        <View style={[styles.corner, styles.cornerBR]} />

        {/* Dashed Face Oval Guide */}
        <View style={styles.ovalGuide}>
          {/* Animated Laser Line */}
          <Animated.View
            style={[
              styles.laserLine,
              {
                transform: [{translateY}],
              },
            ]}
          />
        </View>
      </View>

      {/* Guiding Text Overlay */}
      <View style={styles.instructionContainer}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{stepText}</Text>
        </View>
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dim background outside the scanning frame
  },
  scannerFrame: {
    width: OVAL_WIDTH + 40,
    height: OVAL_HEIGHT + 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ovalGuide: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_HEIGHT / 2,
    borderWidth: 2,
    borderColor: theme.colors.primaryTeal,
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  laserLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.accentCyan,
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: theme.colors.primaryTeal,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  stepBadge: {
    backgroundColor: theme.colors.surfaceDark,
    borderColor: theme.colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: theme.spacing.radius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  stepBadgeText: {
    color: theme.colors.textAccent,
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold as any,
    letterSpacing: 0.5,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.semibold as any,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
});
