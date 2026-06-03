/**
 * AuthEdge — Home Screen
 *
 * Landing screen shown after splash.
 * Two actions: Register Yourself (enroll) or Login (PIN).
 */

import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, {Path, Defs, LinearGradient, Stop, Rect} from 'react-native-svg';
import type {ScreenProps} from '../navigation/types';
import {ROUTES} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, Button} from '../components/common';

const {width} = Dimensions.get('window');
const AuthEdgeLogo = require('../assets/images/AuthEdge_logo.png');

// ─── Icon: User Plus (Register) ───────────────────────────────────────────────
const RegisterIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = '#fff',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 11a4 4 0 100-8 4 4 0 000 8zM20 8v6M23 11h-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Icon: Lock (Login) ───────────────────────────────────────────────────────
const LockIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = theme.colors.accentCyan,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7a5 5 0 0110 0v4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const HomeScreen: React.FC<ScreenProps<'Home'>> = ({navigation}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Animated.View
        style={[
          styles.content,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        {/* Logo & Branding */}
        <View style={styles.brandSection}>
          <View style={styles.logoRing}>
            <Image
              source={AuthEdgeLogo}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>AuthEdge</Text>
          <Text style={styles.tagline}>SECURE · OFFLINE · TRUSTED</Text>
          <Text style={styles.description}>
            Biometric identity verification for field personnel — no internet
            required.
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>GET STARTED</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title="Register Yourself"
            variant="primary"
            icon={<RegisterIcon />}
            onPress={() => navigation.navigate(ROUTES.ENROLLMENT)}
            style={styles.button}
          />

          <View style={styles.loginButtonWrapper}>
            <Button
              title="Login"
              variant="secondary"
              icon={<LockIcon />}
              onPress={() => navigation.navigate(ROUTES.LOGIN)}
              style={styles.button}
            />
          </View>
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          All data is stored locally on this device
        </Text>
      </Animated.View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,160,0.25)',
    backgroundColor: 'rgba(6,11,24,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: 110,
    height: 110,
  },
  appName: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.textPrimary,
    letterSpacing: 3,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textAccent,
    letterSpacing: 4,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeights.bodyMedium,
    paddingHorizontal: theme.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
  },
  dividerText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    fontWeight: theme.typography.weights.semibold as any,
  },
  actionsSection: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  button: {
    width: '100%',
  },
  loginButtonWrapper: {
    // secondary style already has border
  },
  footerNote: {
    textAlign: 'center',
    fontSize: theme.typography.sizes.caption,
    color: '#3A4A60',
    letterSpacing: 0.3,
  },
});

export default HomeScreen;
