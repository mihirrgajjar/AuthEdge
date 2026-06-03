/**
 * AuthEdge — Status Badge Component
 *
 * Displays a clean indicator for Online, Offline, and Syncing states.
 * Uses colors from the logo-synced theme (e.g. success cyan for Online, offline orange for Offline).
 */

import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import {theme} from '../../theme';

export type BadgeStatus = 'online' | 'offline' | 'syncing';

interface StatusBadgeProps {
  status: BadgeStatus;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (status === 'syncing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const getStatusDetails = () => {
    switch (status) {
      case 'online':
        return {
          color: theme.colors.success,
          text: 'Online',
        };
      case 'offline':
        return {
          color: theme.colors.offline,
          text: 'Offline',
        };
      case 'syncing':
        return {
          color: theme.colors.primaryCyan,
          text: 'Syncing...',
        };
    }
  };

  const details = getStatusDetails();

  return (
    <View style={[styles.badge, style]}>
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: details.color,
            opacity: pulseAnim,
            shadowColor: details.color,
          },
        ]}
      />
      <Text style={styles.text}>{details.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.spacing.radius.full,
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs + 2,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    gap: theme.spacing.xs + 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    // Add subtle glow effect for premium feel
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  text: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium as any,
  },
});
