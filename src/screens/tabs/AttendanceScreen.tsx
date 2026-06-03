/**
 * AuthEdge — Attendance Tab
 * Uses the existing EnrollmentScreen face-capture flow to mark attendance.
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {theme} from '../../theme';
import {GradientBackground, Card, Button} from '../../components/common';
import {FaceGuideOverlay, CaptureButton, QualityIndicator} from '../../components/enrollment';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const FaceScanIcon = ({size = 80, color = theme.colors.accentCyan}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <Path d="M12 18c2.5 0 4.5-2.2 4.5-5s-2-5-4.5-5-4.5 2.2-4.5 5 2 5 4.5 5z" stroke={theme.colors.meshBlue} strokeWidth="1" strokeDasharray="3 2"/>
  </Svg>
);

const CheckIcon = ({size = 56, color = theme.colors.success}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const LocationIcon = ({size = 14, color = theme.colors.textSecondary}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={color} strokeWidth="2"/>
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2"/>
  </Svg>
);

const CalendarIcon = ({size = 14, color = theme.colors.textSecondary}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="2"/>
    <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

const Rect = ({x, y, width, height, rx, ry, stroke, strokeWidth}: any) => (
  <Path
    d={`M${Number(x) + Number(rx || 0)} ${y} h${Number(width) - 2 * Number(rx || 0)} a${rx||0} ${ry||0} 0 0 1 ${rx||0} ${ry||0} v${Number(height) - 2 * Number(ry || 0)} a${rx||0} ${ry||0} 0 0 1 -${rx||0} ${ry||0} h-${Number(width) - 2 * Number(rx || 0)} a${rx||0} ${ry||0} 0 0 1 -${rx||0} -${ry||0} v-${Number(height) - 2 * Number(ry || 0)} a${rx||0} ${ry||0} 0 0 1 ${rx||0} -${ry||0} z`}
    stroke={stroke}
    strokeWidth={strokeWidth}
    fill="none"
  />
);

// ─── Mock Data ────────────────────────────────────────────────────────────────
const QUALITY_METRICS = [
  {label: 'Lighting',       value: 94, passed: true},
  {label: 'Sharpness',      value: 92, passed: true},
  {label: 'Face Alignment', value: 89, passed: true},
];

const today = new Date();
const timeStr = today.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit', hour12: true});
const dateStr = today.toLocaleDateString('en-IN', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});

type AttendanceStep = 'idle' | 'scan' | 'quality' | 'success';

// ─── Component ────────────────────────────────────────────────────────────────
const AttendanceScreen: React.FC = () => {
  const [step, setStep] = useState<AttendanceStep>('idle');

  const handleCapture = () => setStep('quality');
  const handleConfirm = () => setStep('success');
  const handleReset = () => setStep('idle');

  if (step === 'scan') {
    return (
      <GradientBackground style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.scanHeader}>
          <TouchableOpacity onPress={() => setStep('idle')} style={styles.backBtn} activeOpacity={0.7}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke={theme.colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <Text style={styles.scanHeaderTitle}>Face Scan</Text>
          <View style={{width: 40}} />
        </View>
        <View style={styles.scanBody}>
          <View style={styles.cameraBox}>
            <FaceGuideOverlay
              stepText="Look straight at the camera"
              statusMessage="Position your face within the frame"
            />
          </View>
          <Text style={styles.scanHint}>Keep your face centred and well-lit</Text>
          <CaptureButton onPress={handleCapture} />
        </View>
      </GradientBackground>
    );
  }

  if (step === 'quality') {
    return (
      <GradientBackground style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.scanHeader}>
          <TouchableOpacity onPress={() => setStep('scan')} style={styles.backBtn} activeOpacity={0.7}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M12 19l-7-7 7-7" stroke={theme.colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </Svg>
          </TouchableOpacity>
          <Text style={styles.scanHeaderTitle}>Quality Check</Text>
          <View style={{width: 40}} />
        </View>
        <ScrollView contentContainerStyle={styles.qualityContent}>
          <View style={styles.qualityPreview}>
            <FaceScanIcon size={60} color={theme.colors.accentCyan} />
          </View>
          <Text style={styles.qualityTitle}>Scan Successful</Text>
          <Text style={styles.qualitySub}>Verify quality before confirming attendance</Text>
          <Card style={styles.qualityCard}>
            <QualityIndicator metrics={QUALITY_METRICS} />
          </Card>
          <Button title="Confirm Attendance" variant="primary" onPress={handleConfirm} style={styles.fullBtn} />
          <Button title="Retake" variant="secondary" onPress={() => setStep('scan')} style={styles.fullBtn} />
        </ScrollView>
      </GradientBackground>
    );
  }

  if (step === 'success') {
    return (
      <GradientBackground style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.successBody}>
          <View style={styles.successRing}>
            <CheckIcon size={64} />
          </View>
          <Text style={styles.successTitle}>Attendance Marked!</Text>
          <Text style={styles.successSub}>Your attendance has been recorded successfully</Text>
          <Card style={styles.successInfo}>
            <View style={styles.infoRow}>
              <CalendarIcon />
              <Text style={styles.infoText}>{dateStr}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoBorder]}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Circle cx="12" cy="12" r="10" stroke={theme.colors.textSecondary} strokeWidth="2"/>
                <Path d="M12 6v6l4 2" stroke={theme.colors.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={styles.infoText}>Check-in at {timeStr}</Text>
            </View>
            <View style={styles.infoRow}>
              <LocationIcon />
              <Text style={styles.infoText}>Site Office, NHAI HQ</Text>
            </View>
          </Card>
          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>✓ Verified via Face Recognition</Text>
          </View>
          <Button title="Done" variant="primary" onPress={handleReset} style={styles.fullBtn} />
        </View>
      </GradientBackground>
    );
  }

  // ─── Idle (default) ───────────────────────────────────────────────────────
  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text style={styles.headerSub}>{dateStr}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.idleContent} showsVerticalScrollIndicator={false}>

        {/* Today's status card */}
        <Card style={styles.todayCard} glow="cyan">
          <View style={styles.todayTop}>
            <View style={styles.todayLeft}>
              <Text style={styles.todayLabel}>TODAY'S STATUS</Text>
              <Text style={styles.todayStatus}>Not Marked</Text>
              <Text style={styles.todayTime}>{timeStr}</Text>
            </View>
            <View style={styles.todayRight}>
              <FaceScanIcon size={64} />
            </View>
          </View>
          <View style={styles.todayFooter}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>⚠ Pending</Text>
            </View>
            <Text style={styles.todayFooterNote}>Mark before end of shift</Text>
          </View>
        </Card>

        {/* Mark attendance CTA */}
        <Button
          title="Mark Attendance with Face Scan"
          variant="primary"
          onPress={() => setStep('scan')}
          style={styles.markBtn}
          icon={<FaceScanIcon size={18} color="#fff" />}
        />

        {/* Info cards */}
        <Text style={styles.sectionTitle}>Today's Info</Text>
        <View style={styles.infoGrid}>
          {[
            {label: 'Shift Start', value: '09:00 AM', color: theme.colors.primaryCyan},
            {label: 'Shift End', value: '06:00 PM', color: theme.colors.meshBlue},
            {label: 'Location', value: 'NHAI HQ', color: theme.colors.accentCyan},
            {label: 'Work Type', value: 'On-Site', color: theme.colors.warning},
          ].map((item, i) => (
            <Card key={i} style={styles.infoCard}>
              <Text style={[styles.infoCardVal, {color: item.color}]}>{item.value}</Text>
              <Text style={styles.infoCardLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

        {/* Recent attendance list */}
        <Text style={styles.sectionTitle}>Recent Records</Text>
        <Card style={styles.recentCard}>
          {[
            {date: 'Yesterday', time: '09:05 AM', status: 'Present', color: theme.colors.accentCyan},
            {date: '2 days ago', time: '—', status: 'Absent', color: theme.colors.error},
            {date: '3 days ago', time: '08:58 AM', status: 'Present', color: theme.colors.accentCyan},
            {date: '4 days ago', time: '09:22 AM', status: 'Late', color: theme.colors.warning},
          ].map((r, i) => (
            <View key={i} style={[styles.recentRow, i > 0 && styles.recentBorder]}>
              <View style={[styles.recentDot, {backgroundColor: r.color}]} />
              <View style={styles.recentInfo}>
                <Text style={styles.recentDate}>{r.date}</Text>
                <Text style={styles.recentTime}>{r.time}</Text>
              </View>
              <View style={[styles.recentBadge, {borderColor: r.color, backgroundColor: r.color + '15'}]}>
                <Text style={[styles.recentBadgeText, {color: r.color}]}>{r.status}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{height: 20}} />
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},

  // Scan step
  scanHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg, paddingTop: 50, paddingBottom: theme.spacing.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  scanHeaderTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  scanBody: {
    flex: 1, paddingHorizontal: theme.spacing.lg,
    alignItems: 'center', gap: theme.spacing.md,
  },
  cameraBox: {
    width: '100%', flex: 1,
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.spacing.radius.lg,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
  },
  scanHint: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary, textAlign: 'center',
  },

  // Quality step
  qualityContent: {
    paddingHorizontal: theme.spacing.lg, paddingBottom: 30,
    alignItems: 'center',
  },
  qualityPreview: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1, borderColor: theme.colors.accentCyan,
    alignItems: 'center', justifyContent: 'center',
    marginVertical: theme.spacing.lg,
  },
  qualityTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary, marginBottom: 4,
  },
  qualitySub: {fontSize: theme.typography.sizes.bodySmall, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg},
  qualityCard: {width: '100%', marginBottom: theme.spacing.md},
  fullBtn: {width: '100%', marginBottom: theme.spacing.sm},

  // Success step
  successBody: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg, gap: theme.spacing.md,
    paddingBottom: 40,
  },
  successRing: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderWidth: 2, borderColor: theme.colors.accentCyan,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.textPrimary,
  },
  successSub: {fontSize: theme.typography.sizes.bodyMedium, color: theme.colors.textSecondary, textAlign: 'center'},
  successInfo: {width: '100%', padding: 0, overflow: 'hidden'},
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: theme.spacing.md, paddingVertical: 12,
  },
  infoBorder: {borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.surfaceBorder},
  infoText: {fontSize: theme.typography.sizes.bodyMedium, color: theme.colors.textPrimary},
  successBadge: {
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderRadius: theme.spacing.radius.full,
    borderWidth: 1, borderColor: theme.colors.accentCyan,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  successBadgeText: {fontSize: 12, color: theme.colors.accentCyan, fontWeight: '600'},

  // Idle
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50, paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.textPrimary,
  },
  headerSub: {fontSize: 12, color: theme.colors.textSecondary, marginTop: 2},

  idleContent: {paddingHorizontal: theme.spacing.lg, paddingBottom: 30},
  todayCard: {marginBottom: theme.spacing.md},
  todayTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md},
  todayLeft: {flex: 1},
  todayRight: {},
  todayLabel: {
    fontSize: 10, color: theme.colors.textAccent,
    letterSpacing: 1.5, fontWeight: '700', marginBottom: 4,
  },
  todayStatus: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.textPrimary,
  },
  todayTime: {fontSize: 12, color: theme.colors.textSecondary, marginTop: 4},
  todayFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder,
  },
  todayBadge: {
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.spacing.radius.full,
    borderWidth: 1, borderColor: theme.colors.warning,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  todayBadgeText: {fontSize: 11, color: theme.colors.warning, fontWeight: '600'},
  todayFooterNote: {fontSize: 11, color: theme.colors.textSecondary},

  markBtn: {width: '100%', marginBottom: theme.spacing.xl},

  sectionTitle: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm, marginTop: 4,
  },

  infoGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm, marginBottom: theme.spacing.lg},
  infoCard: {
    width: '48%', paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  infoCardVal: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.bold as any,
  },
  infoCardLabel: {fontSize: 11, color: theme.colors.textSecondary, marginTop: 4},

  recentCard: {padding: 0, overflow: 'hidden', marginBottom: theme.spacing.md},
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: theme.spacing.md, paddingVertical: 12,
  },
  recentBorder: {borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder},
  recentDot: {width: 8, height: 8, borderRadius: 4},
  recentInfo: {flex: 1},
  recentDate: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
  recentTime: {fontSize: 11, color: theme.colors.textSecondary, marginTop: 2},
  recentBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: theme.spacing.radius.full,
    borderWidth: 1,
  },
  recentBadgeText: {fontSize: 11, fontWeight: '600'},
});

export default AttendanceScreen;
