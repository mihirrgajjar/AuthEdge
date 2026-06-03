/**
 * AuthEdge — Enrollment Screen
 *
 * Face registration wizard with 4 steps:
 *   1. Instructions — overview of how to capture your face
 *   2. Camera Capture — mock scanner with face guide overlay (3 angles)
 *   3. Quality Check — lighting, sharpness, angle quality bars
 *   4. Confirmation — enter name and save
 *
 * Uses a fallback animated scanner when camera is unavailable.
 */

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import type {ScreenProps} from '../navigation/types';
import {ROUTES} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, Button, Card} from '../components/common';
import {FaceGuideOverlay, QualityIndicator, CaptureButton} from '../components/enrollment';

// ─── SVG Icons ────────────────────────────────────────────────────────────────

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

const FaceInstructionIcon: React.FC<{size?: number; color?: string}> = ({
  size = 80,
  color = theme.colors.accentCyan,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Corner brackets */}
    <Path
      d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Face center */}
    <Path
      d="M12 18c2.5 0 4.5-2.2 4.5-5s-2-5-4.5-5-4.5 2.2-4.5 5 2 5 4.5 5z"
      stroke={theme.colors.meshBlue}
      strokeWidth="1"
      strokeDasharray="3 2"
    />
  </Svg>
);

const CheckCircleIcon: React.FC<{size?: number; color?: string}> = ({
  size = 64,
  color = theme.colors.success,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 11.08V12a10 10 0 11-5.93-9.14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 4L12 14.01l-3-3"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Step Labels ──────────────────────────────────────────────────────────────

const CAPTURE_ANGLES = ['Front', 'Slight Left', 'Slight Right'];

const QUALITY_METRICS = [
  {label: 'Lighting', value: 94, passed: true},
  {label: 'Sharpness', value: 90, passed: true},
  {label: 'Angle Alignment', value: 88, passed: true},
];

const INSTRUCTIONS = [
  'Find a well-lit area with even lighting',
  'Remove glasses, hats, or face coverings',
  'Look directly at the camera for front angle',
  'Follow the on-screen prompts for side angles',
];

// ─── Component ────────────────────────────────────────────────────────────────

type WizardStep = 'instructions' | 'capture' | 'quality' | 'confirmation' | 'setpin';

const EnrollmentScreen: React.FC<ScreenProps<'Enrollment'>> = ({
  navigation,
}) => {
  const [step, setStep] = useState<WizardStep>('instructions');
  const [captureIndex, setCaptureIndex] = useState(0);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [pinError, setPinError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: -10, duration: 50, useNativeDriver: true}),
      Animated.timing(shakeAnim, {toValue: 0, duration: 50, useNativeDriver: true}),
    ]).start();
  };

  // ─── Navigation helpers ───────

  const handleBack = () => {
    switch (step) {
      case 'instructions':
        navigation.goBack();
        break;
      case 'capture':
        setStep('instructions');
        setCaptureIndex(0);
        break;
      case 'quality':
        setStep('capture');
        setCaptureIndex(0);
        break;
      case 'confirmation':
        setStep('quality');
        break;
      case 'setpin':
        if (pinStep === 'confirm') {
          setPinStep('enter');
          setConfirmPin('');
          setPinError('');
        } else {
          setStep('confirmation');
        }
        break;
    }
  };

  const handleCapture = () => {
    if (captureIndex < CAPTURE_ANGLES.length - 1) {
      setCaptureIndex(prev => prev + 1);
    } else {
      setStep('quality');
    }
  };

  const handleSave = () => {
    setStep('setpin');
  };

  // ─── PIN keypad handler ───────
  const handlePinKey = (key: string) => {
    setPinError('');
    const currentPin = pinStep === 'enter' ? pin : confirmPin;
    const setter = pinStep === 'enter' ? setPin : setConfirmPin;

    if (key === 'back') {
      setter(prev => prev.slice(0, -1));
    } else if (currentPin.length < 6) {
      const newPin = currentPin + key;
      setter(newPin);

      if (newPin.length === 6) {
        if (pinStep === 'enter') {
          // Move to confirm step after short delay
          setTimeout(() => setPinStep('confirm'), 300);
        } else {
          // Validate both PINs match
          if (newPin === pin) {
            // Success — navigate to Dashboard
            setTimeout(() => navigation.replace(ROUTES.DASHBOARD), 400);
          } else {
            setPinError("PINs don't match. Try again.");
            triggerShake();
            setTimeout(() => {
              setConfirmPin('');
              setPinError('');
            }, 1200);
          }
        }
      }
    }
  };

  // ─── Step title ───────
  const stepTitle: Record<WizardStep, string> = {
    instructions: 'Enroll Face',
    capture: 'Capture Face',
    quality: 'Quality Review',
    confirmation: 'Your Details',
    setpin: 'Set Your PIN',
  };

  // ─── Render Steps ─────

  const renderInstructions = () => (
    <View style={styles.stepContent}>
      <View style={styles.instructionIconContainer}>
        <FaceInstructionIcon size={96} />
      </View>

      <Text style={styles.instructionTitle}>Position Your Face</Text>
      <Text style={styles.instructionSubtitle}>
        We will capture 3 angles of your face for maximum accuracy
      </Text>

      <Card style={styles.instructionsList}>
        {INSTRUCTIONS.map((item, index) => (
          <View key={index} style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{item}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.anglePreview}>
        {CAPTURE_ANGLES.map((angle, index) => (
          <View key={angle} style={styles.angleBadge}>
            <Text style={styles.angleBadgeText}>{angle}</Text>
          </View>
        ))}
      </View>

      <Button
        title="Start Capture"
        variant="primary"
        onPress={() => setStep('capture')}
        style={styles.fullWidthButton}
      />
    </View>
  );

  const renderCapture = () => (
    <View style={styles.captureContent}>
      {/* Camera / Scanner Area */}
      <View style={styles.cameraArea}>
        <View style={styles.cameraPlaceholder}>
          <FaceGuideOverlay
            stepText={`Step ${captureIndex + 1} of ${CAPTURE_ANGLES.length}: ${CAPTURE_ANGLES[captureIndex]}`}
            statusMessage={
              captureIndex === 0
                ? 'Look straight at the camera'
                : captureIndex === 1
                ? 'Turn your head slightly left'
                : 'Turn your head slightly right'
            }
          />
        </View>
      </View>

      {/* Capture Progress */}
      <View style={styles.captureProgressRow}>
        {CAPTURE_ANGLES.map((angle, index) => (
          <View key={angle} style={styles.captureProgressItem}>
            <View
              style={[
                styles.captureProgressDot,
                index < captureIndex && styles.captureProgressDotDone,
                index === captureIndex && styles.captureProgressDotActive,
              ]}
            />
            <Text
              style={[
                styles.captureProgressLabel,
                index === captureIndex && styles.captureProgressLabelActive,
              ]}>
              {angle}
            </Text>
          </View>
        ))}
      </View>

      {/* Capture Button */}
      <View style={styles.captureButtonRow}>
        <CaptureButton onPress={handleCapture} />
      </View>
    </View>
  );

  const renderQuality = () => (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.qualityContent}
      showsVerticalScrollIndicator={false}>
      {/* Preview of captured faces */}
      <View style={styles.capturePreviewRow}>
        {CAPTURE_ANGLES.map((angle, index) => (
          <View key={angle} style={styles.capturePreviewCard}>
            <View style={styles.capturePreviewPlaceholder}>
              <FaceInstructionIcon size={32} color={theme.colors.meshBlue} />
            </View>
            <Text style={styles.capturePreviewLabel}>{angle}</Text>
          </View>
        ))}
      </View>

      {/* Quality Metrics */}
      <Card style={styles.qualityCard}>
        <QualityIndicator metrics={QUALITY_METRICS} />
      </Card>

      <Button
        title="Continue"
        variant="primary"
        onPress={() => setStep('confirmation')}
        style={styles.fullWidthButton}
      />

      <Button
        title="Retake"
        variant="secondary"
        onPress={() => {
          setCaptureIndex(0);
          setStep('capture');
        }}
        style={styles.fullWidthButton}
      />
    </ScrollView>
  );

  const renderConfirmation = () => (
    <ScrollView
      style={styles.scrollFlex}
      contentContainerStyle={styles.confirmationContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.confirmationIconContainer}>
        <CheckCircleIcon size={80} />
      </View>

      <Text style={styles.confirmationTitle}>Face Captured Successfully</Text>
      <Text style={styles.confirmationSubtitle}>
        Complete your registration
      </Text>

      <Card style={styles.inputCard}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Rajesh Kumar"
          placeholderTextColor={theme.colors.textSecondary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      </Card>

      <Card style={styles.inputCard}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. rajesh@example.com"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Card>

      <Card style={styles.inputCard}>
        <Text style={styles.inputLabel}>Employee ID</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. NHAI-2024-0012"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </Card>

      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Captures</Text>
          <Text style={styles.summaryValue}>3 angles</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryRowBorder]}>
          <Text style={styles.summaryLabel}>Quality</Text>
          <Text style={[styles.summaryValue, {color: theme.colors.success}]}>
            Passed
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Storage</Text>
          <Text style={styles.summaryValue}>Local (Encrypted)</Text>
        </View>
      </Card>

      <Button
        title="Continue to Set PIN"
        variant="primary"
        onPress={handleSave}
        disabled={name.trim().length < 2}
        style={styles.fullWidthButton}
      />
    </ScrollView>
  );

  const renderSetPin = () => {
    const currentPin = pinStep === 'enter' ? pin : confirmPin;
    const keypadKeys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'back'],
    ];

    return (
      <View style={styles.setPinContent}>
        <View style={styles.setPinHeader}>
          <Text style={styles.setPinTitle}>
            {pinStep === 'enter' ? 'Create a 6-digit PIN' : 'Confirm your PIN'}
          </Text>
          <Text style={styles.setPinSubtitle}>
            {pinStep === 'enter'
              ? 'You will use this PIN to log in'
              : 'Enter the same PIN again to confirm'}
          </Text>
        </View>

        {/* Dots */}
        <Animated.View
          style={[
            styles.pinDotsRow,
            {transform: [{translateX: shakeAnim}]},
          ]}>
          {Array.from({length: 6}).map((_, i) => (
            <View
              key={i}
              style={[
                styles.pinDot,
                i < currentPin.length && styles.pinDotFilled,
                pinError ? styles.pinDotError : null,
              ]}
            />
          ))}
        </Animated.View>

        {pinError ? (
          <Text style={styles.pinErrorText}>{pinError}</Text>
        ) : (
          <Text style={styles.pinStepLabel}>
            {pinStep === 'enter' ? 'Step 1 of 2' : 'Step 2 of 2'}
          </Text>
        )}

        {/* Keypad */}
        <View style={styles.pinKeypad}>
          {keypadKeys.map((row, rowIdx) => (
            <View key={`row-${rowIdx}`} style={styles.pinKeypadRow}>
              {row.map((key, keyIdx) => {
                if (key === '') {
                  return <View key={`empty-${rowIdx}-${keyIdx}`} style={styles.pinKeyEmpty} />;
                }
                return (
                  <TouchableOpacity
                    key={`key-${rowIdx}-${keyIdx}`}
                    activeOpacity={0.6}
                    onPress={() => handlePinKey(key)}
                    style={[
                      styles.pinKey,
                      key === 'back' && styles.pinKeySpecial,
                    ]}>
                    {key === 'back' ? (
                      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"
                          stroke={theme.colors.textSecondary}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M18 9l-6 6M12 9l6 6"
                          stroke={theme.colors.textSecondary}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    ) : (
                      <Text style={styles.pinKeyText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.backButton}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stepTitle[step]}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        {(['instructions', 'capture', 'quality', 'confirmation', 'setpin'] as WizardStep[]).map(
          (s, index) => (
            <View key={s} style={styles.stepDotRow}>
              <View
                style={[
                  styles.stepDot,
                  step === s && styles.stepDotActive,
                  (['instructions', 'capture', 'quality', 'confirmation', 'setpin'] as WizardStep[]).indexOf(step) > index &&
                    styles.stepDotDone,
                ]}
              />
              {index < 4 && (
                <View
                  style={[
                    styles.stepLine,
                    (['instructions', 'capture', 'quality', 'confirmation', 'setpin'] as WizardStep[]).indexOf(step) > index &&
                      styles.stepLineDone,
                  ]}
                />
              )}
            </View>
          )
        )}
      </View>

      {/* Step Content */}
      {step === 'instructions' && renderInstructions()}
      {step === 'capture' && renderCapture()}
      {step === 'quality' && renderQuality()}
      {step === 'confirmation' && renderConfirmation()}
      {step === 'setpin' && renderSetPin()}
    </GradientBackground>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: theme.spacing.sm,
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

  // Step indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.md,
  },
  stepDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.surfaceBorder,
  },
  stepDotActive: {
    backgroundColor: theme.colors.accentCyan,
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  stepDotDone: {
    backgroundColor: theme.colors.success,
  },
  stepLine: {
    width: 36,
    height: 2,
    backgroundColor: theme.colors.surfaceBorder,
    marginHorizontal: 2,
  },
  stepLineDone: {
    backgroundColor: theme.colors.success,
  },

  // Instruction step
  stepContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  instructionIconContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  instructionTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  instructionSubtitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  instructionsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm + 4,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 160, 0.12)',
    borderWidth: 1,
    borderColor: theme.colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.accentCyan,
  },
  instructionText: {
    flex: 1,
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium as any,
  },
  anglePreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  angleBadge: {
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.radius.full,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  angleBadgeText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium as any,
  },
  fullWidthButton: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },

  // Capture step
  captureContent: {
    flex: 1,
  },
  cameraArea: {
    flex: 1,
    marginHorizontal: theme.spacing.lg,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.spacing.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
    position: 'relative',
  },
  captureProgressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  captureProgressItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  captureProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.surfaceBorder,
  },
  captureProgressDotDone: {
    backgroundColor: theme.colors.success,
  },
  captureProgressDotActive: {
    backgroundColor: theme.colors.accentCyan,
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  captureProgressLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium as any,
  },
  captureProgressLabelActive: {
    color: theme.colors.accentCyan,
    fontWeight: theme.typography.weights.bold as any,
  },
  captureButtonRow: {
    alignItems: 'center',
    paddingBottom: 30,
  },

  // Quality step
  scrollFlex: {
    flex: 1,
  },
  qualityContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  capturePreviewRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  capturePreviewCard: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  capturePreviewPlaceholder: {
    width: 80,
    height: 100,
    borderRadius: theme.spacing.radius.md,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturePreviewLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium as any,
  },
  qualityCard: {
    marginBottom: theme.spacing.lg,
  },

  // Confirmation step
  confirmationContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  confirmationIconContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  confirmationTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  confirmationSubtitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputCard: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textAccent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: theme.spacing.radius.sm,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.bodyLarge,
    color: theme.colors.textPrimary,
  },
  summaryCard: {
    marginBottom: theme.spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md - 2,
  },
  summaryRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium as any,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold as any,
  },

  // Set PIN step
  setPinContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  setPinHeader: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  setPinTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  setPinSubtitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceBorder,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: theme.colors.accentCyan,
    borderColor: 'rgba(0, 229, 160, 0.3)',
    shadowColor: theme.colors.accentCyan,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  pinDotError: {
    backgroundColor: theme.colors.error,
    borderColor: 'rgba(255, 82, 82, 0.3)',
  },
  pinErrorText: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.error,
    fontWeight: theme.typography.weights.semibold as any,
    marginBottom: theme.spacing.sm,
  },
  pinStepLabel: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
  },
  pinKeypad: {
    width: '100%',
    maxWidth: 300,
  },
  pinKeypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  pinKey: {
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
  pinKeySpecial: {
    backgroundColor: 'rgba(6,11,24,0.4)',
    borderColor: 'transparent',
  },
  pinKeyEmpty: {
    width: 72,
    height: 72,
  },
  pinKeyText: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
});

export default EnrollmentScreen;
