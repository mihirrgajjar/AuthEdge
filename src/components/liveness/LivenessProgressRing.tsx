/**
 * AuthEdge — Liveness Progress Ring
 *
 * Renders a circular SVG progress track around the camera view.
 * Features gradient stroke, segmentation into 3 steps, and smooth ring drawing.
 */

import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import Svg, {Circle, Defs, LinearGradient, Stop} from 'react-native-svg';
import {theme} from '../../theme';

interface LivenessProgressRingProps {
  size?: number;
  strokeWidth?: number;
  currentStep: number; // 0, 1, 2, 3
  totalSteps?: number; // 3
  children: React.ReactNode;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const LivenessProgressRing: React.FC<LivenessProgressRingProps> = ({
  size = 260,
  strokeWidth = 6,
  currentStep,
  totalSteps = 3,
  children,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate to the current step progress
    const targetProgress = Math.min(Math.max(currentStep / totalSteps, 0), 1);
    Animated.timing(animatedProgress, {
      toValue: targetProgress,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentStep, totalSteps, animatedProgress]);

  // Interpolate progress to stroke dashoffset
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, {width: size, height: size}]}>
      {/* Background/Children camera preview inside the ring */}
      <View style={[styles.contentContainer, {borderRadius: size / 2}]}>
        {children}
      </View>

      {/* SVG Ring Overlay */}
      <Svg
        width={size}
        height={size}
        style={styles.svg}
        viewBox={`0 0 ${size} ${size}`}
      >
        <Defs>
          <LinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={theme.colors.gradientStart} />
            <Stop offset="50%" stopColor={theme.colors.primaryCyan} />
            <Stop offset="100%" stopColor={theme.colors.gradientEnd} />
          </LinearGradient>
        </Defs>

        {/* Gray Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surfaceBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Active Animated Progress Circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />

        {/* Step Tick Marks */}
        {Array.from({length: totalSteps}).map((_, index) => {
          if (index === 0) return null; // Skip start tick
          const angle = (index / totalSteps) * 360 - 90;
          const radian = (angle * Math.PI) / 180;
          const x = size / 2 + radius * Math.cos(radian);
          const y = size / 2 + radius * Math.sin(radian);
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={strokeWidth / 2 + 1}
              fill={currentStep >= index ? theme.colors.gradientEnd : theme.colors.surfaceBorder}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    overflow: 'hidden',
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
