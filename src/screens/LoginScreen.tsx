/**
 * AuthEdge — Login Screen
 *
 * A premium admin secure portal featuring:
 * - A custom grid keypad for PIN entry (6-digit passcode).
 * - Animated passcode dots with error shake animation.
 * - Biometric login integration (Fingerprint Scan animation).
 * - "Offline Mode" status indicator.
 * - Synced branding theme.
 */

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import type {ScreenProps} from '../navigation/types';
import {ROUTES} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, StatusBadge} from '../components/common';

const {width} = Dimensions.get('window');
const AuthEdgeLogo = require('../assets/images/AuthEdge_logo.png');

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const FingerprintIcon: React.FC<{size?: number; color?: string}> = ({
  size = 28,
  color = theme.colors.accentCyan,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2a10 10 0 00-6.88 2.77M3.12 10.5a9 9 0 00.91 3.5M6.47 18.27A9.03 9.03 0 0012 20a9 9 0 007.8-4.5M20.88 10.5c.08-.5.12-1 .12-1.5a10 10 0 00-4.5-8.28"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M12 6a6 6 0 00-4.13 1.66M6.68 12.5a5.1 5.1 0 001.07 2.77M9.27 17.5a6.03 6.03 0 006.18-1.5M16.8 11.5c.07-.3.1-.63.1-.96A6 6 0 0012 6M12 9.5a2.5 2.5 0 00-2.5 2.5v1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <Path
      d="M9.5 15.5a2.5 2.5 0 005 0v-3.5a2.5 2.5 0 00-5 0M12 17.5a4.5 4.5 0 004.5-4.5v-1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </Svg>
);

const BackspaceIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = theme.colors.textSecondary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18 9l-6 6M12 9l6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const LoginScreen: React.FC<ScreenProps<'Login'>> = ({navigation}) => {
  const [pin, setPin] = useState('');
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Shake animation for incorrect PIN
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bioScale = useRef(new Animated.Value(1)).current;

  // Keypad numbers grid
  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['bio', '0', 'back'],
  ];

  // Detect when PIN is completed (6 digits)
  useEffect(() => {
    if (pin.length === 6) {
      if (pin === '123456') {
        // Correct Admin PIN
        setErrorMsg('');
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          navigation.replace(ROUTES.DASHBOARD);
        });
      } else {
        // Incorrect PIN - Trigger shake animation
        setErrorMsg('Invalid Admin Passcode');
        triggerShake();
        setPin('');
      }
    }
  }, [pin]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (key: string) => {
    setErrorMsg('');
    if (key === 'back') {
      setPin(prev => prev.slice(0, -1));
    } else if (key === 'bio') {
      handleBiometricUnlock();
    } else {
      if (pin.length < 6) {
        setPin(prev => prev + key);
      }
    }
  };

  const handleBiometricUnlock = () => {
    setIsBiometricLoading(true);
    setErrorMsg('');
    
    // Animate biometric icon pulse
    Animated.sequence([
      Animated.timing(bioScale, { toValue: 1.2, duration: 200, useNativeDriver: true }),
      Animated.timing(bioScale, { toValue: 1.0, duration: 200, useNativeDriver: true }),
    ]).start();

    // Mock biometric scanning delay
    setTimeout(() => {
      setIsBiometricLoading(false);
      navigation.replace(ROUTES.DASHBOARD);
    }, 1200);
  };

  const renderDots = () => {
    return (
      <Animated.View style={[styles.dotsContainer, {transform: [{translateX: shakeAnim}]}]}>
        {Array.from({length: 6}).map((_, index) => {
          const isActive = index < pin.length;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive && styles.dotActive,
                errorMsg ? styles.dotError : null,
              ]}
            />
          );
        })}
      </Animated.View>
    );
  };

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        {/* Brand/Logo Area */}
        <View style={styles.logoContainer}>
          <Image source={AuthEdgeLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>AuthEdge</Text>
          <Text style={styles.subtitle}>SECURE PORTAL</Text>
        </View>

        {/* PIN Entry feedback */}
        <View style={styles.entryFeedbackContainer}>
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <Text style={styles.promptText}>
              {isBiometricLoading ? 'Scanning fingerprint...' : 'Enter Admin PIN'}
            </Text>
          )}
          {renderDots()}
        </View>

        {/* Custom Keypad Grid */}
        <View style={styles.keypadContainer}>
          {keypadKeys.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map(key => {
                const isSpecial = key === 'bio' || key === 'back';
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.6}
                    onPress={() => handleKeyPress(key)}
                    disabled={isBiometricLoading}
                    style={[
                      styles.keypadButton,
                      isSpecial ? styles.keypadButtonSpecial : null,
                    ]}
                  >
                    {key === 'bio' ? (
                      <Animated.View style={{transform: [{scale: bioScale}]}}>
                        <FingerprintIcon
                          color={
                            isBiometricLoading
                              ? theme.colors.meshBlue
                              : theme.colors.accentCyan
                          }
                        />
                      </Animated.View>
                    ) : key === 'back' ? (
                      <BackspaceIcon />
                    ) : (
                      <Text style={styles.keypadButtonText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Offline Badge */}
        <View style={styles.footer}>
          <StatusBadge status="offline" />
          <Text style={styles.footerHint}>Passcode: 123456 (demo)</Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.sm,
  },
  appName: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textAccent,
    letterSpacing: 4,
    marginTop: theme.spacing.xs - 2,
  },
  entryFeedbackContainer: {
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
  },
  promptText: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.error,
    fontWeight: theme.typography.weights.semibold as any,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 16,
    height: 20,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.surfaceBorder,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dotActive: {
    backgroundColor: theme.colors.accentCyan,
    borderColor: 'rgba(0, 229, 160, 0.3)',
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  dotError: {
    backgroundColor: theme.colors.error,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  keypadContainer: {
    width: width * 0.85,
    maxHeight: 380,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  keypadButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  keypadButtonSpecial: {
    backgroundColor: 'rgba(6, 11, 24, 0.4)',
    borderColor: 'transparent',
  },
  keypadButtonText: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
  footer: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  footerHint: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
});

export default LoginScreen;
