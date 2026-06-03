/**
 * AuthEdge — Login Screen
 * 6-digit PIN entry with eye toggle to reveal entered digits.
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

const BackspaceIcon: React.FC<{size?: number; color?: string}> = ({
  size = 24,
  color = theme.colors.textSecondary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M18 9l-6 6M12 9l6 6"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const EyeOpenIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = theme.colors.accentCyan,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
  </Svg>
);

const EyeOffIcon: React.FC<{size?: number; color?: string}> = ({
  size = 22,
  color = theme.colors.textSecondary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M1 1l22 22"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const LoginScreen: React.FC<ScreenProps<'Login'>> = ({navigation}) => {
  const [pin, setPin]         = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['eye', '0', 'back'],   // 'eye' replaces the empty slot
  ];

  useEffect(() => {
    if (pin.length === 6) {
      setErrorMsg('');
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace(ROUTES.DASHBOARD);
      });
    }
  }, [pin, fadeAnim, navigation]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 10,  duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 10,  duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 5,   duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -5,  duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0,   duration: 50, useNativeDriver: true}),
    ]).start();
  };

  const handleKeyPress = (key: string) => {
    if (key === 'back') {
      setErrorMsg('');
      setPin(prev => prev.slice(0, -1));
    } else if (key === 'eye') {
      setShowPin(prev => !prev);
    } else {
      setErrorMsg('');
      if (pin.length < 6) {
        setPin(prev => prev + key);
      }
    }
  };

  // ─── PIN display ─── dots or actual digits depending on showPin
  const renderPinDisplay = () => (
    <Animated.View
      style={[styles.dotsContainer, {transform: [{translateX: shakeAnim}]}]}>
      {Array.from({length: 6}).map((_, index) => {
        const isActive = index < pin.length;
        if (showPin && isActive) {
          // Show the actual digit
          return (
            <View key={index} style={[styles.dot, styles.dotReveal]}>
              <Text style={styles.dotDigit}>{pin[index]}</Text>
            </View>
          );
        }
        return (
          <View
            key={index}
            style={[
              styles.dot,
              isActive && styles.dotActive,
              !!errorMsg && styles.dotError,
            ]}
          />
        );
      })}
    </Animated.View>
  );

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        {/* Branding */}
        <View style={styles.logoContainer}>
          <Image source={AuthEdgeLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>AuthEdge</Text>
          <Text style={styles.subtitle}>SECURE PORTAL</Text>
        </View>

        {/* PIN feedback */}
        <View style={styles.entryFeedbackContainer}>
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : (
            <Text style={styles.promptText}>Enter your 6-digit PIN</Text>
          )}
          {renderPinDisplay()}
        </View>

        {/* Keypad */}
        <View style={styles.keypadContainer}>
          {keypadKeys.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.keypadRow}>
              {row.map((key, keyIdx) => {
                const isSpecial = key === 'back' || key === 'eye';
                return (
                  <TouchableOpacity
                    key={`key-${rowIndex}-${keyIdx}`}
                    activeOpacity={0.6}
                    onPress={() => handleKeyPress(key)}
                    style={[
                      styles.keypadButton,
                      isSpecial && styles.keypadButtonSpecial,
                      key === 'eye' && showPin && styles.keypadButtonEyeActive,
                    ]}>
                    {key === 'back' ? (
                      <BackspaceIcon />
                    ) : key === 'eye' ? (
                      showPin
                        ? <EyeOpenIcon />
                        : <EyeOffIcon />
                    ) : (
                      <Text style={styles.keypadButtonText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <StatusBadge status="offline" />
        </View>
      </Animated.View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  logoContainer: {alignItems: 'center', marginTop: 20},
  logo: {width: 100, height: 100, marginBottom: theme.spacing.sm},
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
    minHeight: 90,
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
  // PIN dots row
  dotsContainer: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceBorder,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: theme.colors.accentCyan,
    borderColor: 'rgba(0,229,160,0.3)',
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  dotError: {
    backgroundColor: theme.colors.error,
    borderColor: 'rgba(255,82,82,0.3)',
  },
  dotReveal: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,229,160,0.15)',
    borderColor: theme.colors.accentCyan,
    borderWidth: 1,
  },
  dotDigit: {
    fontSize: 12,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.accentCyan,
  },
  // Keypad
  keypadContainer: {
    width: width * 0.85,
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
    backgroundColor: 'rgba(6,11,24,0.4)',
    borderColor: 'transparent',
  },
  keypadButtonEyeActive: {
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderColor: theme.colors.accentCyan,
    borderWidth: 1,
  },
  keypadButtonText: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
  footer: {alignItems: 'center', gap: theme.spacing.sm},
});

export default LoginScreen;
