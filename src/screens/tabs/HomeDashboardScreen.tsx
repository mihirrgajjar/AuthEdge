/**
 * AuthEdge — Home Dashboard Tab
 * Industry-ready attendance analytics dashboard for current month.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/types';
import {theme} from '../../theme';
import {GradientBackground, Card, StatusBadge} from '../../components/common';

const AuthEdgeLogo = require('../../assets/images/AuthEdge_logo.png');
const {width} = Dimensions.get('window');

// ─── Mock Data ────────────────────────────────────────────────────────────────
const today = new Date();
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const currentMonth = MONTH_NAMES[today.getMonth()];
const currentYear = today.getFullYear();

// Total working days in month so far (excluding weekends)
function countWorkingDays(year: number, month: number, upToDay: number): number {
  let count = 0;
  for (let d = 1; d <= upToDay; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

const WORKING_DAYS = countWorkingDays(today.getFullYear(), today.getMonth(), today.getDate());
const PRESENT_DAYS = Math.min(18, WORKING_DAYS); // can't exceed working days
const ABSENT_DAYS  = Math.max(0, Math.min(3, WORKING_DAYS - PRESENT_DAYS));
const PENDING_TODAY = false;

// Bar chart data — last 7 days check-in hours (mock)
const WEEKLY_DATA = [
  {day: 'Mon', hours: 8.5, present: true},
  {day: 'Tue', hours: 9.0, present: true},
  {day: 'Wed', hours: 7.5, present: true},
  {day: 'Thu', hours: 8.0, present: true},
  {day: 'Fri', hours: 0,   present: false},
  {day: 'Sat', hours: 4.0, present: true},
  {day: 'Sun', hours: 0,   present: false},
];
const MAX_HOURS = 10;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const LogoutIcon = ({size = 20, color = theme.colors.error}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CheckCircleFillIcon = ({color = theme.colors.success}: {color?: string}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 4L12 14.01l-3-3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ClockIcon = ({color = theme.colors.warning}: {color?: string}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const TrendUpIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M23 6l-9.5 9.5-5-5L1 18" stroke={theme.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M17 6h6v6" stroke={theme.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── Donut Chart ──────────────────────────────────────────────────────────────
const DonutChart: React.FC<{present: number; absent: number; total: number}> = ({
  present, absent, total,
}) => {
  const size = 110;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safePresentPct = total > 0 ? Math.min(present / total, 1) : 0;
  const safeAbsentPct  = total > 0 ? Math.min(absent  / total, 1 - safePresentPct) : 0;
  const presentDash = safePresentPct * circumference;
  const absentDash  = safeAbsentPct  * circumference;
  // Start from top (offset by circumference/4)
  const startOffset = circumference / 4;

  return (
    <Svg width={size} height={size}>
      {/* Track */}
      <Circle cx={size/2} cy={size/2} r={radius} stroke={theme.colors.surfaceBorder} strokeWidth={strokeWidth} fill="none"/>
      {/* Present arc */}
      {presentDash > 0 && (
        <Circle
          cx={size/2} cy={size/2} r={radius}
          stroke={theme.colors.accentCyan} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${presentDash} ${circumference - presentDash}`}
          strokeDashoffset={startOffset}
          strokeLinecap="round"
        />
      )}
      {/* Absent arc */}
      {absentDash > 0 && (
        <Circle
          cx={size/2} cy={size/2} r={radius}
          stroke={theme.colors.error} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${absentDash} ${circumference - absentDash}`}
          strokeDashoffset={startOffset - presentDash}
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
};

// ─── Bar Chart ────────────────────────────────────────────────────────────────
const WeeklyBarChart: React.FC = () => {
  const barW = 28;
  const chartH = 80;

  return (
    <View style={barStyles.container}>
      {WEEKLY_DATA.map((d, i) => {
        const barH = d.present ? Math.max(6, (d.hours / MAX_HOURS) * chartH) : 6;
        return (
          <View key={i} style={barStyles.barCol}>
            <View style={[barStyles.barTrack, {height: chartH}]}>
              <View
                style={[
                  barStyles.bar,
                  {
                    height: barH,
                    backgroundColor: d.present
                      ? theme.colors.accentCyan
                      : theme.colors.surfaceBorder,
                    opacity: d.present ? 1 : 0.5,
                  },
                ]}
              />
            </View>
            <Text style={barStyles.dayLabel}>{d.day}</Text>
          </View>
        );
      })}
    </View>
  );
};

const barStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  barCol: {
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    justifyContent: 'flex-end',
    width: 28,
  },
  bar: {
    width: 28,
    borderRadius: 6,
  },
  dayLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
const HomeDashboardScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Attendance % capped at 100 — present / working days elapsed
  const attendancePct = WORKING_DAYS > 0
    ? Math.min(100, Math.round((PRESENT_DAYS / WORKING_DAYS) * 100))
    : 0;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => navigation.replace('Home'),
      },
    ]);
  };

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={AuthEdgeLogo} style={styles.headerLogo} resizeMode="contain" />
          <View>
            <Text style={styles.headerGreeting}>Good {today.getHours() < 12 ? 'Morning' : today.getHours() < 17 ? 'Afternoon' : 'Evening'} 👋</Text>
            <Text style={styles.headerName}>Rajesh Kumar</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <StatusBadge status="offline" />
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
            <LogoutIcon size={18} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Attendance Status Banner */}
        <Card
          style={[styles.statusBanner, {borderColor: PENDING_TODAY ? theme.colors.warning : theme.colors.accentCyan}] as any}>
          <View style={styles.statusBannerLeft}>
            {PENDING_TODAY ? <ClockIcon /> : <CheckCircleFillIcon />}
            <View style={styles.statusBannerText}>
              <Text style={styles.statusBannerTitle}>
                {PENDING_TODAY ? 'Attendance Pending' : 'You Are Present Today ✓'}
              </Text>
              <Text style={styles.statusBannerSub}>
                {PENDING_TODAY
                  ? 'Your attendance is still pending for today'
                  : `Marked at 09:12 AM · ${today.toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'})}`}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: PENDING_TODAY ? theme.colors.warning : theme.colors.accentCyan},
            ]}
          />
        </Card>

        {/* Monthly Overview */}
        <Text style={styles.sectionTitle}>{currentMonth} {currentYear} Overview</Text>
        <View style={styles.overviewRow}>
          {/* Donut */}
          <Card style={styles.donutCard}>
            <View style={styles.donutWrap}>
              <DonutChart present={PRESENT_DAYS} absent={ABSENT_DAYS} total={WORKING_DAYS} />
              <View style={styles.donutCenter}>
                <Text style={styles.donutPct}>{attendancePct}%</Text>
                <Text style={styles.donutLabel}>Rate</Text>
              </View>
            </View>
            <View style={styles.donutLegend}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, {backgroundColor: theme.colors.accentCyan}]} />
                <Text style={styles.legendText}>Present</Text>
                <Text style={styles.legendVal}>{PRESENT_DAYS}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, {backgroundColor: theme.colors.error}]} />
                <Text style={styles.legendText}>Absent</Text>
                <Text style={styles.legendVal}>{ABSENT_DAYS}</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, {backgroundColor: theme.colors.warning}]} />
                <Text style={styles.legendText}>Pending</Text>
                <Text style={styles.legendVal}>{WORKING_DAYS - PRESENT_DAYS - ABSENT_DAYS}</Text>
              </View>
            </View>
          </Card>

          {/* Stats column */}
          <View style={styles.statsCol}>
            {[
              {label: 'Working Days', value: String(WORKING_DAYS), color: theme.colors.primaryCyan},
              {label: 'Present', value: String(PRESENT_DAYS), color: theme.colors.accentCyan},
              {label: 'Absent', value: String(ABSENT_DAYS), color: theme.colors.error},
              {label: 'On Leave', value: '1', color: theme.colors.warning},
            ].map((s, i) => (
              <Card key={i} style={styles.miniStatCard}>
                <Text style={[styles.miniStatVal, {color: s.color}]}>{s.value}</Text>
                <Text style={styles.miniStatLabel}>{s.label}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Attendance % progress bar */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Monthly Attendance Rate</Text>
            <View style={styles.progressBadge}>
              <TrendUpIcon />
              <Text style={styles.progressBadgeText}>{attendancePct}%</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${attendancePct}%`}]} />
          </View>
          <Text style={styles.progressFooter}>
            {PRESENT_DAYS} of {WORKING_DAYS} working days attended
          </Text>
        </Card>

        {/* Weekly activity */}
        <Text style={styles.sectionTitle}>This Week's Activity</Text>
        <Card style={styles.weeklyCard}>
          <View style={styles.weeklyHeader}>
            <Text style={styles.weeklyTitle}>Daily Check-in Hours</Text>
            <Text style={styles.weeklyAvg}>Avg 8.2h</Text>
          </View>
          <WeeklyBarChart />
        </Card>

        {/* Recent activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.activityCard}>
          {[
            {action: 'Attendance Marked', time: 'Today, 09:12 AM', color: theme.colors.accentCyan},
            {action: 'Attendance Marked', time: 'Yesterday, 09:05 AM', color: theme.colors.accentCyan},
            {action: 'Absent', time: '2 days ago', color: theme.colors.error},
            {action: 'Attendance Marked', time: '3 days ago, 08:58 AM', color: theme.colors.accentCyan},
          ].map((item, i) => (
            <View key={i} style={[styles.activityRow, i > 0 && styles.activityBorder]}>
              <View style={[styles.activityDot, {backgroundColor: item.color}]} />
              <View style={styles.activityInfo}>
                <Text style={styles.activityAction}>{item.action}</Text>
                <Text style={styles.activityTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Compliance card */}
        <Card style={styles.complianceCard} glow="cyan">
          <View style={styles.complianceRow}>
            <View>
              <Text style={styles.complianceTitle}>Compliance Score</Text>
              <Text style={styles.complianceSub}>Based on {currentMonth} attendance</Text>
            </View>
            <View style={styles.complianceScore}>
              <Text style={styles.complianceScoreText}>A+</Text>
            </View>
          </View>
          <View style={styles.complianceBars}>
            {[
              {label: 'Punctuality', val: 92},
              {label: 'Consistency', val: 88},
              {label: 'Compliance', val: 95},
            ].map((b, i) => (
              <View key={i} style={styles.complianceBarRow}>
                <Text style={styles.complianceBarLabel}>{b.label}</Text>
                <View style={styles.complianceBarTrack}>
                  <View style={[styles.complianceBarFill, {width: `${b.val}%`}]} />
                </View>
                <Text style={styles.complianceBarVal}>{b.val}%</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={{height: 20}} />
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 50,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  headerLogo: {width: 36, height: 36},
  headerGreeting: {fontSize: 11, color: theme.colors.textSecondary},
  headerName: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  headerRight: {flexDirection: 'row', alignItems: 'center', gap: 10},
  logoutBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderWidth: 1, borderColor: theme.colors.error,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: {flex: 1},
  scrollContent: {paddingHorizontal: theme.spacing.lg, paddingBottom: 100},

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    borderWidth: 1.5,
  },
  statusBannerLeft: {flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1},
  statusBannerText: {flex: 1},
  statusBannerTitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  statusBannerSub: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusDot: {width: 10, height: 10, borderRadius: 5},

  sectionTitle: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    marginTop: 4,
  },

  overviewRow: {flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.lg},
  donutCard: {flex: 1.3, alignItems: 'center', gap: 8},
  donutWrap: {position: 'relative', alignItems: 'center', justifyContent: 'center'},
  donutCenter: {
    position: 'absolute', alignItems: 'center',
  },
  donutPct: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.textPrimary,
  },
  donutLabel: {fontSize: 10, color: theme.colors.textSecondary},
  donutLegend: {width: '100%', gap: 4},
  legendRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 8, height: 8, borderRadius: 4},
  legendText: {flex: 1, fontSize: 11, color: theme.colors.textSecondary},
  legendVal: {
    fontSize: 11,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },

  statsCol: {flex: 1, gap: theme.spacing.sm},
  miniStatCard: {
    padding: theme.spacing.sm,
    alignItems: 'center',
    flex: 1,
  },
  miniStatVal: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.heavy as any,
  },
  miniStatLabel: {fontSize: 9, color: theme.colors.textSecondary, marginTop: 2, textAlign: 'center'},

  progressCard: {marginBottom: theme.spacing.lg},
  progressHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  progressTitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
  progressBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderRadius: theme.spacing.radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  progressBadgeText: {
    fontSize: 11, color: theme.colors.accentCyan,
    fontWeight: theme.typography.weights.bold as any,
  },
  progressTrack: {
    height: 8, borderRadius: 4,
    backgroundColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressFill: {
    height: '100%', borderRadius: 4,
    backgroundColor: theme.colors.accentCyan,
  },
  progressFooter: {fontSize: 11, color: theme.colors.textSecondary},

  weeklyCard: {marginBottom: theme.spacing.lg},
  weeklyHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  weeklyTitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
  weeklyAvg: {fontSize: 12, color: theme.colors.accentCyan, fontWeight: '600'},

  activityCard: {marginBottom: theme.spacing.lg, padding: 0, overflow: 'hidden'},
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: theme.spacing.md, paddingVertical: 12,
  },
  activityBorder: {borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder},
  activityDot: {width: 8, height: 8, borderRadius: 4},
  activityInfo: {flex: 1},
  activityAction: {
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },
  activityTime: {fontSize: 11, color: theme.colors.textSecondary, marginTop: 2},

  complianceCard: {marginBottom: theme.spacing.md},
  complianceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  complianceTitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  complianceSub: {fontSize: 11, color: theme.colors.textSecondary, marginTop: 2},
  complianceScore: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,229,160,0.15)',
    borderWidth: 1.5, borderColor: theme.colors.accentCyan,
    alignItems: 'center', justifyContent: 'center',
  },
  complianceScoreText: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.accentCyan,
  },
  complianceBars: {gap: 8},
  complianceBarRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  complianceBarLabel: {width: 80, fontSize: 11, color: theme.colors.textSecondary},
  complianceBarTrack: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: theme.colors.surfaceBorder, overflow: 'hidden',
  },
  complianceBarFill: {height: '100%', borderRadius: 3, backgroundColor: theme.colors.accentCyan},
  complianceBarVal: {
    width: 34, fontSize: 11,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary, textAlign: 'right',
  },
});

export default HomeDashboardScreen;
