/**
 * AuthEdge — Splash Screen
 * Centered logo with fade-in animation and progress bar.
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
  Text,
  Dimensions,
} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import type {ScreenProps} from '../navigation/types';
import {ROUTES} from '../navigation/types';
import {theme} from '../theme';
import {useApp} from '../context/AppContext';

const AuthEdgeLogo = require('../assets/images/AuthEdge_logo.png');
const {width, height} = Dimensions.get('window');

const SplashScreen: React.FC<ScreenProps<'Splash'>> = ({navigation}) => {
  const {isLoggedIn, isRegistered, isLoading} = useApp();
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const scaleAnim    = useRef(new Animated.Value(0.88)).current;
  const taglineFade  = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Track dependencies so navigation can execute when loading completes and timer fires
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  useEffect(() => {
    // Logo fade + scale in
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

    // Tagline fades in after logo
    setTimeout(() => {
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 700);

    // Progress bar fills over 2.2s
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: false,
    }).start();

    // Navigate after 2.6s
    const timer = setTimeout(() => {
      setIsTimerFinished(true);
    }, 2600);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, taglineFade, progressAnim]);

  // Navigate when loading finishes if the timer has fired
  useEffect(() => {
    if (!isLoading && isTimerFinished) {
      checkAndNavigate();
    }
  }, [isLoading, isLoggedIn, isRegistered, isTimerFinished]);

  const checkAndNavigate = () => {
    if (isLoading) return; // Wait for database to load
    
    if (isRegistered) {
      if (isLoggedIn) {
        navigation.replace(ROUTES.DASHBOARD);
      } else {
        navigation.replace(ROUTES.LOGIN);
      }
    } else {
      navigation.replace(ROUTES.HOME);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      {/* Full-screen gradient background — pure black to dark blue, no mid stops */}
      <Svg style={StyleSheet.absoluteFillObject} width={width} height={height}>
        <Defs>
          <LinearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%"   stopColor="#000000" />
            <Stop offset="100%" stopColor="#060B18" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#bg)" />
      </Svg>

      {/* Centred content */}
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoWrap,
            {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
          ]}>
          <Image
            source={AuthEdgeLogo}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.taglineRow, {opacity: taglineFade}]}>
          <View style={styles.taglineLine} />
          <Text style={styles.taglineText}>VERIFY. SECURE. EMPOWER.</Text>
          <View style={styles.taglineLine} />
        </Animated.View>
      </View>

      {/* Progress bar — pinned 60px from bottom */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, {width: progressWidth}]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80, // shift slightly above true center for visual balance
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 200,
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taglineLine: {
    width: 36,
    height: 1,
    backgroundColor: theme.colors.primaryBlue,
    opacity: 0.7,
  },
  taglineText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3,
    color: theme.colors.textAccent,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  progressTrack: {
    width: 120,
    height: 2,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.accentCyan,
  },
});

export default SplashScreen;
