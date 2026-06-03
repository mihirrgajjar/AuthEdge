/**
 * AuthEdge — Capture Button
 *
 * A premium, themed circular capture button with an outer pulsing ring animation
 * and a solid inner trigger circle. Designed to be tactile and visually striking.
 */

import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import {theme} from '../../theme';

interface CaptureButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const CaptureButton: React.FC<CaptureButtonProps> = ({
  onPress,
  disabled = false,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!disabled) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.2,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 1200,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.15);
    }
  }, [disabled, pulseAnim, opacityAnim]);

  return (
    <View style={[styles.container, style]}>
      {/* Outer Pulse Ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{scale: pulseAnim}],
            opacity: opacityAnim,
          },
        ]}
      />

      {/* Button Ring */}
      <TouchableOpacity
        style={[
          styles.buttonRing,
          disabled && styles.buttonRingDisabled,
        ]}
        activeOpacity={0.7}
        onPress={onPress}
        disabled={disabled}>
        <View
          style={[
            styles.innerCircle,
            disabled && styles.innerCircleDisabled,
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: theme.colors.accentCyan,
  },
  buttonRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: theme.colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonRingDisabled: {
    borderColor: theme.colors.surfaceBorder,
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accentCyan,
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  innerCircleDisabled: {
    backgroundColor: theme.colors.surfaceBorder,
    shadowOpacity: 0,
  },
});
