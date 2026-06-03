/**
 * AuthEdge — Onboarding Screen
 *
 * First-time user experience with 3 slides explaining app capabilities.
 * Full SVG illustrations and pager implementation in Phase 4.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import type {ScreenProps} from '../navigation/types';
import {ROUTES} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, Button} from '../components/common';
import {ShieldOfflineIcon, FaceScanIcon, SecureSyncIcon} from '../assets/icons';

const SLIDES = [
  {
    title: 'Offline Authentication',
    subtitle: 'Authenticate field personnel anywhere, even in zero-network zones',
    Icon: ShieldOfflineIcon,
  },
  {
    title: 'Liveness Detection',
    subtitle: 'Anti-spoofing protection with real-time blink, smile, and head-turn validation',
    Icon: FaceScanIcon,
  },
  {
    title: 'Secure & Synced',
    subtitle: 'Military-grade AES-256 local encryption with background cloud synchronization',
    Icon: SecureSyncIcon,
  },
];

const OnboardingScreen: React.FC<ScreenProps<'Onboarding'>> = ({
  navigation,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      navigation.replace(ROUTES.LOGIN);
    }
  };

  const handleSkip = () => {
    navigation.replace(ROUTES.LOGIN);
  };

  const ActiveIcon = SLIDES[currentIndex].Icon;

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.content}>
        <View style={styles.iconPlaceholder}>
          <ActiveIcon size={96} color={theme.colors.accentCyan} />
        </View>

        <Text style={styles.title}>{SLIDES[currentIndex].title}</Text>
        <Text style={styles.subtitle}>{SLIDES[currentIndex].subtitle}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          variant="primary"
          onPress={handleNext}
          style={styles.button}
        />

        <Button
          title="Skip"
          variant="ghost"
          onPress={handleSkip}
        />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl,
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.regular as any,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.bodyLarge,
    paddingHorizontal: theme.spacing.lg,
  },
  footer: {
    paddingBottom: 50,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceBorder,
  },
  dotActive: {
    backgroundColor: theme.colors.accentCyan,
    width: 24,
    borderRadius: 4,
  },
  button: {
    width: '100%',
  },
});

export default OnboardingScreen;
