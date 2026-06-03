/**
 * AuthEdge — Challenge Prompt
 *
 * Displays the current liveness challenge instruction, corresponding SVG icon,
 * and a pulsing guidance message. Uses premium styling and subtle animations.
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {theme} from '../../theme';
import {BlinkIcon, SmileIcon, HeadTurnIcon} from '../../assets/icons';

export type ChallengeType = 'blink' | 'smile' | 'turn_left' | 'turn_right';

interface ChallengePromptProps {
  challenge: ChallengeType;
  timeLeft: number;
}

export const ChallengePrompt: React.FC<ChallengePromptProps> = ({
  challenge,
  timeLeft,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the instruction text
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    // Slide/Fade-in animation when challenge changes
    slideAnim.setValue(0);
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [challenge, slideAnim]);

  const getChallengeConfig = () => {
    switch (challenge) {
      case 'blink':
        return {
          title: 'Please Blink',
          description: 'Blink naturally while looking at the screen',
          Icon: BlinkIcon,
          color: theme.colors.accentCyan,
        };
      case 'smile':
        return {
          title: 'Smile Wide',
          description: 'Show a friendly smile to verify identity',
          Icon: SmileIcon,
          color: theme.colors.primaryCyan,
        };
      case 'turn_left':
        return {
          title: 'Turn Head Left',
          description: 'Slowly turn your face towards the left side',
          Icon: HeadTurnIcon,
          color: theme.colors.primaryBlue,
        };
      case 'turn_right':
        return {
          title: 'Turn Head Right',
          description: 'Slowly turn your face towards the right side',
          Icon: HeadTurnIcon,
          color: theme.colors.primaryBlue,
        };
    }
  };

  const config = getChallengeConfig();
  const IconComponent = config.Icon;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const opacity = slideAnim;

  return (
    <Animated.View style={[styles.container, {opacity, transform: [{translateY}]}]}>
      <View style={[styles.iconContainer, {borderColor: config.color}]}>
        <IconComponent size={64} color={config.color} />
        {timeLeft <= 2 && (
          <View style={[styles.warningPulse, {backgroundColor: theme.colors.warning}]} />
        )}
      </View>

      <Animated.Text style={[styles.title, {transform: [{scale: pulseAnim}]}]}>
        {config.title}
      </Animated.Text>
      
      <Text style={styles.description}>{config.description}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    position: 'relative',
    shadowColor: theme.colors.primaryCyan,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  warningPulse: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: theme.colors.surfaceDark,
  },
  title: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
});
