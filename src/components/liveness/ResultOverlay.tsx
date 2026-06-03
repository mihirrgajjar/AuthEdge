/**
 * AuthEdge — Result Overlay
 *
 * Full-screen glassmorphic overlay displayed when verification completes.
 * Renders an animated success checkmark or failed shield, matching details, and action buttons.
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../../theme';
import {Button} from '../common';

const {width, height} = Dimensions.get('window');

interface ResultOverlayProps {
  status: 'success' | 'failed';
  score: number;
  userName?: string;
  onRetry: () => void;
  onDone: () => void;
}

const SuccessIcon: React.FC<{scaleAnim: Animated.Value}> = ({scaleAnim}) => (
  <Animated.View style={[styles.iconWrapper, {transform: [{scale: scaleAnim}], borderColor: theme.colors.success}]}>
    <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={theme.colors.success}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </Animated.View>
);

const FailureIcon: React.FC<{scaleAnim: Animated.Value}> = ({scaleAnim}) => (
  <Animated.View style={[styles.iconWrapper, {transform: [{scale: scaleAnim}], borderColor: theme.colors.error}]}>
    <Svg width={60} height={60} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={theme.colors.error}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 8v5M12 16h.01"
        stroke={theme.colors.error}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </Animated.View>
);

export const ResultOverlay: React.FC<ResultOverlayProps> = ({
  status,
  score,
  userName = 'Jane Doe',
  onRetry,
  onDone,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  const isSuccess = status === 'success';

  return (
    <Animated.View style={[styles.overlay, {opacity: fadeAnim}]}>
      <View style={styles.blurBackground} />

      <View style={styles.content}>
        {isSuccess ? (
          <SuccessIcon scaleAnim={scaleAnim} />
        ) : (
          <FailureIcon scaleAnim={scaleAnim} />
        )}

        <Text style={[styles.statusText, isSuccess ? styles.successText : styles.errorText]}>
          {isSuccess ? 'Verification Passed' : 'Verification Failed'}
        </Text>

        <Text style={styles.scoreLabel}>Confidence Score</Text>
        <Text style={[styles.scoreValue, isSuccess ? styles.successText : styles.errorText]}>
          {(score * 100).toFixed(1)}%
        </Text>

        {isSuccess ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsLabel}>Identified User</Text>
            <Text style={styles.detailsValue}>{userName}</Text>
          </View>
        ) : (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsLabel}>Reason</Text>
            <Text style={styles.detailsValue}>Liveness detection failed (potential spoof detected)</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {isSuccess ? (
            <Button
              title="Return to Dashboard"
              variant="primary"
              onPress={onDone}
              style={styles.button}
            />
          ) : (
            <>
              <Button
                title="Try Again"
                variant="primary"
                onPress={onRetry}
                style={styles.button}
              />
              <Button
                title="Cancel"
                variant="ghost"
                onPress={onDone}
                style={styles.cancelButton}
              />
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  content: {
    width: width * 0.85,
    borderRadius: theme.spacing.radius.lg,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    shadowColor: theme.colors.primaryCyan,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceDark,
  },
  statusText: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold as any,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  successText: {
    color: theme.colors.success,
  },
  errorText: {
    color: theme.colors.error,
  },
  scoreLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: theme.spacing.xs,
  },
  scoreValue: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold as any,
    marginBottom: theme.spacing.lg,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.spacing.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  detailsLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  detailsValue: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  button: {
    width: '100%',
  },
  cancelButton: {
    width: '100%',
    marginTop: theme.spacing.xs,
  },
});
