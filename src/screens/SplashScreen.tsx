/**
 * AuthEdge — Splash Screen
 *
 * Launch screen displaying the AuthEdge logo with fade-in animation.
 * Checks onboarding status and navigates accordingly.
 * Full implementation comes in Phase 3.
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
  Text,
} from 'react-native';
import type {ScreenProps} from '../navigation/types';
import {ROUTES} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground} from '../components/common';

const AuthEdgeLogo = require('../assets/images/AuthEdge_logo.png');

const SplashScreen: React.FC<ScreenProps<'Splash'>> = ({navigation}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade-in + scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Tagline fade-in after logo
    setTimeout(() => {
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    // Navigate after 2.5s
    const timer = setTimeout(() => {
      navigation.replace(ROUTES.ONBOARDING);
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, taglineFade, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          <Image source={AuthEdgeLogo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[styles.taglineContainer, {opacity: taglineFade}]}>
          <View style={styles.taglineLine} />
          <Text style={styles.taglineText}>VERIFY. SECURE. EMPOWER.</Text>
          <View style={styles.taglineLine} />
        </Animated.View>
      </View>

      {/* Animated progress indicator */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, {width: progressWidth}]} />
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  taglineLine: {
    width: 40,
    height: 1,
    backgroundColor: theme.colors.primaryBlue,
  },
  taglineText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold as any,
    letterSpacing: 3,
    color: theme.colors.textAccent,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    width: 120,
    height: 2,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.spacing.radius.xs,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: theme.spacing.radius.xs,
    backgroundColor: theme.colors.accentCyan,
  },
});

export default SplashScreen;
