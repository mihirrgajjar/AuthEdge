/**
 * AuthEdge — Settings Screen
 *
 * App configuration panel allowing admin users to:
 * - View AI model information.
 * - Toggle camera settings (resolution, front/back).
 * - Manage database encryption and PIN credentials.
 * - Adjust synchronization parameters (sync toggle, intervals).
 * - Monitor storage usage (templates count, DB size).
 * - Trigger secure purge (NIST 800-88 compliant mock wipe).
 */

import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import type {ScreenProps} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, Card, Button} from '../components/common';

const AuthEdgeLogo = require('../assets/images/AuthEdge_logo.png');

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

const ShieldIcon: React.FC<{size?: number; color?: string}> = ({
  size = 48,
  color = theme.colors.error,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 8v5M12 16h.01"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ─── Component ────────────────────────────────────────────────────────────────

const SettingsScreen: React.FC<ScreenProps<'Settings'>> = ({navigation}) => {
  // Settings States
  const [resolution, setResolution] = useState<'1080p' | '720p' | '480p'>('720p');
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isAutoSync, setIsAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState<'30s' | '1m' | '5m' | '15m'>('5m');
  const [dbSize, setDbSize] = useState('342 KB');
  const [templatesCount, setTemplatesCount] = useState(12);

  // Modals & Purge states
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeStep, setPurgeStep] = useState<'idle' | 'purging' | 'done'>('idle');

  const purgeProgress = useRef(new Animated.Value(0)).current;

  // Toggle helpers
  const toggleCamera = () => setIsFrontCamera(prev => !prev);
  const toggleAutoSync = () => setIsAutoSync(prev => !prev);

  const cycleResolution = () => {
    setResolution(prev => {
      if (prev === '1080p') return '720p';
      if (prev === '720p') return '480p';
      return '1080p';
    });
  };

  const cycleInterval = () => {
    setSyncInterval(prev => {
      if (prev === '30s') return '1m';
      if (prev === '1m') return '5m';
      if (prev === '5m') return '15m';
      return '30s';
    });
  };

  const handleSecurePurge = () => {
    setPurgeStep('purging');
    purgeProgress.setValue(0);

    Animated.timing(purgeProgress, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false, // Layout width animation
    }).start(() => {
      setPurgeStep('done');
      // Reset simulated counts
      setDbSize('8 KB');
      setTemplatesCount(0);
    });
  };

  const resetPurgeModal = () => {
    setShowPurgeModal(false);
    setPurgeStep('idle');
    purgeProgress.setValue(0);
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION: Model Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Model Inference</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>AI Model Version</Text>
              <Text style={styles.settingValue}>MobileFaceNet v1.2.0</Text>
            </View>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <Text style={styles.settingLabel}>Model File Size</Text>
              <Text style={styles.settingValue}>14.8 MB</Text>
            </View>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <Text style={styles.settingLabel}>Liveness Model</Text>
              <Text style={styles.settingValue}>Custom MobileNetV3</Text>
            </View>
          </Card>
        </View>

        {/* SECTION: Camera Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Camera Configuration</Text>
          <Card style={styles.sectionCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={cycleResolution}
              style={styles.settingRow}
            >
              <Text style={styles.settingLabel}>Resolution Limit</Text>
              <Text style={styles.settingValueAccent}>
                {resolution === '1080p'
                  ? '1080p (FHD)'
                  : resolution === '720p'
                  ? '720p (HD)'
                  : '480p (SD)'}
              </Text>
            </TouchableOpacity>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <Text style={styles.settingLabel}>Front Camera Only</Text>
              <Switch
                value={isFrontCamera}
                onValueChange={toggleCamera}
                trackColor={{false: '#1A2340', true: theme.colors.accentCyan + '80'}}
                thumbColor={isFrontCamera ? theme.colors.accentCyan : '#8F9BB3'}
              />
            </View>
          </Card>
        </View>

        {/* SECTION: Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Credentials</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Storage Encryption</Text>
              <Text style={styles.settingValue}>AES-256-CBC</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.settingRow, styles.rowBorder]}
              onPress={() => Alert.alert('Secure Action', 'PIN modification is locked to current admin session')}
            >
              <Text style={styles.settingLabel}>Change Passcode</Text>
              <Text style={styles.settingValueAccent}>Modify →</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* SECTION: Cloud Synchronization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cloud Sync (Amplify)</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto Sync Queue</Text>
              <Switch
                value={isAutoSync}
                onValueChange={toggleAutoSync}
                trackColor={{false: '#1A2340', true: theme.colors.accentCyan + '80'}}
                thumbColor={isAutoSync ? theme.colors.accentCyan : '#8F9BB3'}
              />
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={cycleInterval}
              disabled={!isAutoSync}
              style={[styles.settingRow, styles.rowBorder, !isAutoSync && styles.rowDisabled]}
            >
              <Text style={styles.settingLabel}>Sync Frequency</Text>
              <Text style={styles.settingValueAccent}>{syncInterval}</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* SECTION: Storage Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Storage</Text>
          <Card style={styles.sectionCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Database Size</Text>
              <Text style={styles.settingValue}>{dbSize}</Text>
            </View>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <Text style={styles.settingLabel}>Face Templates Count</Text>
              <Text style={styles.settingValue}>{templatesCount}</Text>
            </View>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <Text style={styles.settingLabel}>Hardware Purge</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowPurgeModal(true)}
                style={styles.purgeBadge}
              >
                <Text style={styles.purgeBadgeText}>SECURE ERASE</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* About Branding Card */}
        <View style={styles.aboutSection}>
          <Image source={AuthEdgeLogo} style={styles.aboutLogo} resizeMode="contain" />
          <Text style={styles.aboutName}>AuthEdge System</Text>
          <Text style={styles.aboutVersion}>Production Build v1.2.0</Text>
          <Text style={styles.aboutTagline}>Verify. Secure. Empower.</Text>
        </View>
      </ScrollView>

      {/* Secure Purge Warning Modal */}
      <Modal
        visible={showPurgeModal}
        transparent
        animationType="fade"
        onRequestClose={resetPurgeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {purgeStep === 'idle' && (
              <View style={styles.modalInner}>
                <ShieldIcon />
                <Text style={styles.modalTitle}>CRITICAL ACTION</Text>
                <Text style={styles.modalWarning}>
                  This operation will securely overwrite all stored facial embeddings and audit logs using a NIST 800-88 compliant pattern.
                </Text>
                <Text style={styles.modalConfirmLabel}>
                  This cannot be undone. Are you sure you want to purge?
                </Text>
                <View style={styles.modalButtons}>
                  <Button
                    title="Confirm Wipe"
                    variant="primary"
                    onPress={handleSecurePurge}
                    style={styles.wipeButton}
                  />
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={resetPurgeModal}
                    style={styles.modalCancel}
                  />
                </View>
              </View>
            )}

            {purgeStep === 'purging' && (
              <View style={styles.modalInner}>
                <ActivityIndicator size="large" color={theme.colors.error} />
                <Text style={[styles.modalTitle, {marginTop: 15}]}>WIPING DATA...</Text>
                <Text style={styles.modalWarning}>
                  Performing offline storage sector wipe. Do not close the app.
                </Text>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: purgeProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {purgeStep === 'done' && (
              <View style={styles.modalInner}>
                <View style={styles.successRing}>
                  <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17l-5-5"
                      stroke={theme.colors.success}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text style={[styles.modalTitle, {color: theme.colors.success}]}>
                  PURGE COMPLETE
                </Text>
                <Text style={styles.modalWarning}>
                  All database sectors have been successfully rewritten. No traces remain.
                </Text>
                <Button
                  title="Acknowledge"
                  variant="primary"
                  onPress={resetPurgeModal}
                  style={styles.acknowledgeButton}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textAccent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    height: 58,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  settingLabel: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold as any,
  },
  settingValue: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
  },
  settingValueAccent: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.accentCyan,
    fontWeight: theme.typography.weights.bold as any,
  },
  purgeBadge: {
    backgroundColor: theme.colors.error + '20',
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.spacing.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs - 2,
  },
  purgeBadgeText: {
    fontSize: 9,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.error,
    letterSpacing: 0.5,
  },
  aboutSection: {
    alignItems: 'center',
    paddingVertical: 35,
  },
  aboutLogo: {
    width: 64,
    height: 64,
    marginBottom: theme.spacing.sm,
  },
  aboutName: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  aboutVersion: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs - 2,
  },
  aboutTagline: {
    fontSize: 8,
    color: theme.colors.textAccent,
    letterSpacing: 2,
    marginTop: theme.spacing.sm,
    fontWeight: theme.typography.weights.semibold as any,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.spacing.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: theme.colors.error,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  modalInner: {
    alignItems: 'center',
    width: '100%',
  },
  modalTitle: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    letterSpacing: 1.5,
  },
  modalWarning: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  modalConfirmLabel: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  wipeButton: {
    width: '100%',
    backgroundColor: theme.colors.error,
  },
  modalCancel: {
    width: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.error,
    borderRadius: 3,
  },
  successRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceDark,
  },
  acknowledgeButton: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
});

export default SettingsScreen;
