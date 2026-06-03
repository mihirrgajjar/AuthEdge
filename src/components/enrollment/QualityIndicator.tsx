/**
 * AuthEdge — Quality Indicator
 *
 * Displays a set of quality metric bars (lighting, sharpness, angle)
 * with animated fill and pass/fail status for the face capture quality check step.
 */

import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {theme} from '../../theme';

interface QualityMetric {
  label: string;
  value: number; // 0-100
  passed: boolean;
}

interface QualityIndicatorProps {
  metrics: QualityMetric[];
}

/** Small SVG checkmark icon */
const CheckIcon: React.FC<{size?: number; color?: string}> = ({
  size = 16,
  color = theme.colors.success,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Small SVG warning icon */
const WarningIcon: React.FC<{size?: number; color?: string}> = ({
  size = 16,
  color = theme.colors.warning,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 9v4M12 17h.01"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
  </Svg>
);

const MetricRow: React.FC<{metric: QualityMetric; delay: number}> = ({
  metric,
  delay,
}) => {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: metric.value,
      duration: 800,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [fillAnim, metric.value, delay]);

  const barWidth = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const barColor = metric.passed
    ? theme.colors.success
    : theme.colors.warning;

  return (
    <View style={styles.metricRow}>
      <View style={styles.metricLabelRow}>
        <View style={styles.metricLabelLeft}>
          {metric.passed ? <CheckIcon /> : <WarningIcon />}
          <Text style={styles.metricLabel}>{metric.label}</Text>
        </View>
        <Text
          style={[
            styles.metricValue,
            {color: metric.passed ? theme.colors.success : theme.colors.warning},
          ]}>
          {metric.value}%
        </Text>
      </View>
      <View style={styles.metricBarTrack}>
        <Animated.View
          style={[
            styles.metricBarFill,
            {
              width: barWidth,
              backgroundColor: barColor,
              shadowColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

export const QualityIndicator: React.FC<QualityIndicatorProps> = ({
  metrics,
}) => {
  const allPassed = metrics.every(m => m.passed);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Quality Check</Text>
        <View
          style={[
            styles.overallBadge,
            {
              backgroundColor: allPassed
                ? 'rgba(0, 229, 160, 0.12)'
                : 'rgba(255, 183, 77, 0.12)',
              borderColor: allPassed
                ? theme.colors.success
                : theme.colors.warning,
            },
          ]}>
          <Text
            style={[
              styles.overallText,
              {
                color: allPassed
                  ? theme.colors.success
                  : theme.colors.warning,
              },
            ]}>
            {allPassed ? 'PASSED' : 'REVIEW'}
          </Text>
        </View>
      </View>

      {metrics.map((metric, index) => (
        <MetricRow key={metric.label} metric={metric} delay={index * 200} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  overallBadge: {
    borderRadius: theme.spacing.radius.full,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs,
  },
  overallText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.bold as any,
    letterSpacing: 1,
  },
  metricRow: {
    gap: theme.spacing.xs + 2,
  },
  metricLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  metricLabel: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium as any,
  },
  metricValue: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
  },
  metricBarTrack: {
    height: 6,
    backgroundColor: theme.colors.surfaceBorder,
    borderRadius: 3,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
});
