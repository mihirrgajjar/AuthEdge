/**
 * AuthEdge — Verification Screen
 *
 * Liveness detection challenge-response interface.
 * Implements a random challenge state machine (Blink, Smile, Turn Left/Right),
 * animated SVG face meshes that react to the current challenge, countdown timers,
 * a debug panel for hackathon presentations (Pass/Fail toggles), and a result screen.
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, {Path, Circle, Line} from 'react-native-svg';
import type {ScreenProps} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, Card} from '../components/common';
import {
  ChallengePrompt,
  LivenessProgressRing,
  ResultOverlay,
  ChallengeType,
} from '../components/liveness';

const BackArrowIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = theme.colors.textPrimary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon: React.FC<{size?: number; color?: string}> = ({
  size = 18,
  color = theme.colors.textSecondary,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <Line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="12" cy="8" r="1" fill={color} />
  </Svg>
);

const MOCK_NAMES = [
  'Mihir Sharma',
  'Aarav Patel',
  'Aditi Rao',
  'Vikram Malhotra',
  'Ananya Iyer',
];

export const VerificationScreen: React.FC<ScreenProps<'Verification'>> = ({
  navigation,
}) => {
  // Liveness States
  const [gameState, setGameState] = useState<'idle' | 'scanning' | 'result'>('idle');
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isSpoofSimulated, setIsSpoofSimulated] = useState(false);
  const [resultStatus, setResultStatus] = useState<'success' | 'failed'>('success');
  const [resultScore, setResultScore] = useState(0.98);
  const [matchedUser, setMatchedUser] = useState('');

  // SVG representation states
  const [eyesClosed, setEyesClosed] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);

  // Scanning animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const faceRotationAnim = useRef(new Animated.Value(0)).current; // -1 to 1

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const challengeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize challenges on start
  const startVerification = (simulatedFail = false) => {
    // Generate a set of 3 random challenges
    const pool: ChallengeType[] = ['blink', 'smile', 'turn_left', 'turn_right'];
    const selected: ChallengeType[] = [];
    const poolCopy = [...pool];
    
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * poolCopy.length);
      selected.push(poolCopy[idx]);
      poolCopy.splice(idx, 1);
    }

    setChallenges(selected);
    setCurrentStep(0);
    setTimeLeft(5);
    setIsSpoofSimulated(simulatedFail);
    setGameState('scanning');
    
    // Choose random name for success case
    const name = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
    setMatchedUser(name);
  };

  // Handle Scanning line animation
  useEffect(() => {
    if (gameState === 'scanning') {
      scanLineAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanLineAnim.stopAnimation();
    }
  }, [gameState, scanLineAnim]);

  // Handle challenge flow and simulation
  useEffect(() => {
    if (gameState !== 'scanning' || challenges.length === 0) return;

    const currentChallenge = challenges[currentStep];

    // Reset animations & state
    setEyesClosed(false);
    setIsSmiling(false);
    Animated.spring(faceRotationAnim, { toValue: 0, useNativeDriver: true }).start();

    const timeouts: NodeJS.Timeout[] = [];

    // Trigger SVG visual reaction animations based on challenge type
    if (currentChallenge === 'turn_left') {
      Animated.spring(faceRotationAnim, { toValue: -1, delay: 500, useNativeDriver: true }).start();
    } else if (currentChallenge === 'turn_right') {
      Animated.spring(faceRotationAnim, { toValue: 1, delay: 500, useNativeDriver: true }).start();
    } else if (currentChallenge === 'blink') {
      // Simulate blinking twice
      timeouts.push(setTimeout(() => setEyesClosed(true), 600));
      timeouts.push(setTimeout(() => setEyesClosed(false), 750));
      timeouts.push(setTimeout(() => setEyesClosed(true), 1050));
      timeouts.push(setTimeout(() => setEyesClosed(false), 1200));
    } else if (currentChallenge === 'smile') {
      timeouts.push(setTimeout(() => setIsSmiling(true), 800));
    }

    // Set countdown timer
    setTimeLeft(5);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleChallengeResult(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-advance challenge after 2.5 seconds (mocking AI inference matching action)
    if (challengeTimeoutRef.current) clearTimeout(challengeTimeoutRef.current);
    
    if (isSpoofSimulated && currentStep === 1) {
      // If spoofing is simulated, we let the timer expire on step 2 to fail the verification
    } else {
      challengeTimeoutRef.current = setTimeout(() => {
        handleChallengeResult(true);
      }, 2500);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (challengeTimeoutRef.current) clearTimeout(challengeTimeoutRef.current);
      timeouts.forEach(clearTimeout);
    };
  }, [gameState, currentStep, challenges, isSpoofSimulated]);

  const handleChallengeResult = (passed: boolean) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (challengeTimeoutRef.current) clearTimeout(challengeTimeoutRef.current);

    if (passed) {
      if (currentStep < challenges.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Liveness challenge completed successfully!
        setResultStatus('success');
        setResultScore(0.96 + Math.random() * 0.039);
        setGameState('result');
      }
    } else {
      // Challenge timed out or failed liveness detection (spoofing detected)
      setResultStatus('failed');
      setResultScore(0.24 + Math.random() * 0.18);
      setGameState('result');
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (challengeTimeoutRef.current) clearTimeout(challengeTimeoutRef.current);
    };
  }, []);

  // Calculate face rotation shift
  const faceShiftX = faceRotationAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-15, 15],
  });

  const renderFaceMeshSim = () => {
    const mouthD = isSmiling
      ? 'M 78 135 Q 90 147 102 135' // Smile
      : 'M 78 135 L 102 135';      // Neutral

    return (
      <View style={styles.faceMeshContainer}>
        {/* Animated Scan Line */}
        <Animated.View
          style={[
            styles.scanLine,
            {
              transform: [
                {
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 200],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Static Face Oval Guide */}
        <Svg width="180" height="200" viewBox="0 0 180 200" style={styles.svgMesh}>
          <Path
            d="M 90 20 C 135 20, 160 60, 160 110 C 160 160, 130 190, 90 190 C 50 190, 20 160, 20 110 C 20 60, 45 20, 90 20 Z"
            stroke="rgba(0, 191, 165, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
        </Svg>

        {/* Animated/Shifting Face Features */}
        <Animated.View
          style={[
            styles.svgMesh,
            {
              transform: [{translateX: faceShiftX}],
            },
          ]}
        >
          <Svg width="180" height="200" viewBox="0 0 180 200">
            {/* Left Eye */}
            {eyesClosed ? (
              <Path d="M 58 85 Q 65 89 72 85" stroke={theme.colors.meshBlue} strokeWidth="2.5" fill="none" />
            ) : (
              <Circle cx="65" cy="85" r="5" fill={theme.colors.meshBlue} />
            )}

            {/* Right Eye */}
            {eyesClosed ? (
              <Path d="M 108 85 Q 115 89 122 85" stroke={theme.colors.meshBlue} strokeWidth="2.5" fill="none" />
            ) : (
              <Circle cx="115" cy="85" r="5" fill={theme.colors.meshBlue} />
            )}

            {/* Nose line */}
            <Path
              d="M 90 80 L 90 115"
              stroke={theme.colors.meshBlue}
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Mouth */}
            <Path
              d={mouthD}
              stroke={theme.colors.meshBlue}
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Grid coordinates overlay lines */}
            <Line x1="45" y1="110" x2="135" y2="110" stroke="rgba(79, 195, 247, 0.15)" strokeWidth="1" />
            <Line x1="90" y1="40" x2="90" y2="170" stroke="rgba(79, 195, 247, 0.15)" strokeWidth="1" />
          </Svg>
        </Animated.View>
      </View>
    );
  };

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liveness Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      {gameState === 'idle' ? (
        <View style={styles.idleContainer}>
          <Card style={styles.infoCard}>
            <View style={styles.infoTitleRow}>
              <InfoIcon color={theme.colors.accentCyan} size={24} />
              <Text style={styles.infoTitle}>Liveness Detection</Text>
            </View>
            <Text style={styles.infoBody}>
              To prevent spoofing attempts, AuthEdge requires you to complete 3 randomized facial challenge responses.
            </Text>
            <Text style={styles.infoBullets}>
              • Keep device stable at eye level{'\n'}
              • Ensure your face is fully visible{'\n'}
              • Respond quickly to prompts (5s limit)
            </Text>
          </Card>

          {/* Hackathon Presenter Panel */}
          <Card style={styles.demoCard}>
            <Text style={styles.demoTitle}>Hackathon Presenter Panel</Text>
            <Text style={styles.demoSubtitle}>
              Test both verification flows (Success and Failure):
            </Text>
            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={[styles.demoBtn, styles.demoBtnPass]}
                activeOpacity={0.8}
                onPress={() => startVerification(false)}
              >
                <Text style={styles.demoBtnText}>Verify (PASS)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoBtn, styles.demoBtnFail]}
                activeOpacity={0.8}
                onPress={() => startVerification(true)}
              >
                <Text style={styles.demoBtnText}>Verify (SPOOF/FAIL)</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      ) : (
        <View style={styles.activeContainer}>
          {/* Liveness Progress Ring wrapping simulated camera feed */}
          <View style={styles.ringWrapper}>
            <LivenessProgressRing currentStep={currentStep} size={260} strokeWidth={6}>
              <View style={styles.cameraFeedMock}>
                {renderFaceMeshSim()}
                <Text style={styles.cameraFeedText}>OFFLINE SCANNER</Text>
              </View>
            </LivenessProgressRing>
          </View>

          {/* Prompt */}
          <View style={styles.promptArea}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>
                CHALLENGE {Math.min(currentStep + 1, 3)} OF 3
              </Text>
            </View>
            <ChallengePrompt
              challenge={challenges[currentStep] || 'blink'}
              timeLeft={timeLeft}
            />
          </View>

          {/* Timer Display */}
          <View style={styles.timerWrapper}>
            <Text style={[styles.timerLabel, timeLeft <= 2 ? styles.timerLabelWarning : {}]}>
              TIME REMAINING
            </Text>
            <Text style={[styles.timerValue, timeLeft <= 2 ? styles.timerValueWarning : {}]}>
              {timeLeft}s
            </Text>
          </View>
        </View>
      )}

      {/* Result Screen Overlay */}
      {gameState === 'result' && (
        <ResultOverlay
          status={resultStatus}
          score={resultScore}
          userName={matchedUser}
          onRetry={() => startVerification(isSpoofSimulated)}
          onDone={() => {
            setGameState('idle');
            // If success, dashboard recent activities should ideally show this event (Phase 9 database)
          }}
        />
      )}
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  idleContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    gap: theme.spacing.lg,
  },
  infoCard: {
    padding: theme.spacing.xl,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  infoBody: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  infoBullets: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textAccent,
    lineHeight: 24,
    fontWeight: theme.typography.weights.semibold as any,
  },
  demoCard: {
    padding: theme.spacing.lg,
    borderColor: 'rgba(0, 229, 160, 0.15)',
  },
  demoTitle: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  demoSubtitle: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  demoBtn: {
    flex: 1,
    height: 48,
    borderRadius: theme.spacing.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnPass: {
    backgroundColor: theme.colors.success + '20',
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  demoBtnFail: {
    backgroundColor: theme.colors.error + '20',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  demoBtnText: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  activeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xl,
  },
  ringWrapper: {
    marginTop: theme.spacing.md,
  },
  cameraFeedMock: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cameraFeedText: {
    position: 'absolute',
    bottom: 20,
    fontSize: 9,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    fontWeight: theme.typography.weights.bold as any,
  },
  faceMeshContainer: {
    width: 180,
    height: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.accentCyan,
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 5,
  },
  svgMesh: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  promptArea: {
    alignItems: 'center',
    width: '100%',
  },
  stepBadge: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.spacing.radius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: theme.spacing.sm,
  },
  stepBadgeText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textAccent,
    letterSpacing: 1,
  },
  timerWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  timerLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold as any,
    marginBottom: theme.spacing.xs,
  },
  timerLabelWarning: {
    color: theme.colors.error,
  },
  timerValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.primaryCyan,
  },
  timerValueWarning: {
    color: theme.colors.error,
  },
});

export default VerificationScreen;
