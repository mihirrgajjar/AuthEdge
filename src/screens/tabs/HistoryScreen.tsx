/**
 * AuthEdge — History Tab
 * Calendar with attendance dots, month selector, PDF download (mock).
 * Wired to SQLite via AppContext + AttendanceService.
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {theme} from '../../theme';
import {GradientBackground, Card, Button} from '../../components/common';
import {useApp} from '../../context/AppContext';
import {AttendanceService} from '../../services';
import {formatDisplayDate, formatDisplayTime, toDBDate} from '../../utils';

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

type DayStatus = 'present' | 'absent' | 'pending' | 'late' | 'weekend' | undefined;

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ChevronLeft = ({color = theme.colors.textPrimary}: {color?: string}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const ChevronRight = ({color = theme.colors.textPrimary}: {color?: string}) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);
const DownloadIcon = ({color = '#fff'}: {color?: string}) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 10l5 5 5-5M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function getStatusColor(status?: DayStatus) {
  switch (status) {
    case 'present':  return theme.colors.accentCyan;
    case 'late':     return theme.colors.warning;
    case 'absent':   return theme.colors.error;
    case 'pending':  return theme.colors.warning;
    case 'leave':    return theme.colors.meshBlue;
    default:         return 'transparent';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
const HistoryScreen: React.FC = () => {
  const {currentUser} = useApp();
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  // Real data from DB
  const [calendarData, setCalendarData] = useState<Record<string, any>>({});
  const [monthStats, setMonthStats] = useState({present: 0, absent: 0, late: 0, total: 0, percentage: 0});

  const daysInMonth  = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);
  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth());

  // Load calendar data from DB whenever month/year changes
  const loadCalendarData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
      const data = await AttendanceService.getMonthCalendarData(currentUser.id, yearMonth);
      setCalendarData(data);

      const stats = await AttendanceService.getMonthlyStats(currentUser.id, yearMonth);
      setMonthStats(stats);
    } catch (e) {
      console.warn('[HistoryScreen] Error loading calendar data:', e);
    }
  }, [currentUser, year, month]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (isFutureMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  };

  // Build calendar grid
  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({length: daysInMonth}, (_, i) => i + 1),
  ];

  // Derive status for a given date key from DB calendar data
  const getDateStatus = (dateKey: string): DayStatus => {
    const entry = calendarData[dateKey];
    if (entry?.record) {
      return entry.record.status as DayStatus;
    }
    return undefined;
  };

  // Get record details for selected day
  const selectedRecord = selected ? calendarData[selected]?.record : null;
  const selectedStatus = selected ? getDateStatus(selected) : undefined;

  const handleDownload = () => {
    Alert.alert('PDF Download', `Attendance report for ${MONTH_NAMES[month]} ${year} will be downloaded as PDF.`);
  };

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
        <TouchableOpacity onPress={handleDownload} style={styles.downloadBtn} activeOpacity={0.7}>
          <DownloadIcon />
          <Text style={styles.downloadText}>PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Month Navigator */}
        <Card style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
              <ChevronLeft />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{MONTH_NAMES[month]} {year}</Text>
            <TouchableOpacity
              onPress={nextMonth}
              style={[styles.navBtn, isFutureMonth && styles.navBtnDisabled]}
              activeOpacity={0.7}
              disabled={isFutureMonth}>
              <ChevronRight color={isFutureMonth ? theme.colors.surfaceBorder : theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabelsRow}>
            {DAY_LABELS.map(d => (
              <View key={d} style={styles.dayLabelCell}>
                <Text style={[styles.dayLabelText, (d === 'Sun' || d === 'Sat') && styles.dayLabelWeekend]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calGrid}>
            {cells.map((day, idx) => {
              if (day === null) return <View key={`e-${idx}`} style={styles.calCell} />;
              const mm = String(month + 1).padStart(2, '0');
              const dd = String(day).padStart(2, '0');
              const key = `${year}-${mm}-${dd}`;
              const status = getDateStatus(key);
              const dotColor = getStatusColor(status);
              const isToday = key === todayKey;
              const isSelected = key === selected;
              const isFuture = new Date(year, month, day) > now;
              const dow = new Date(year, month, day).getDay();
              const isWeekend = dow === 0 || dow === 6;

              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.calCell,
                    isToday && styles.calCellToday,
                    isSelected && styles.calCellSelected,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelected(isSelected ? null : key)}
                  disabled={isFuture}>
                  <Text style={[
                    styles.calDayText,
                    isToday && styles.calDayToday,
                    isFuture && styles.calDayFuture,
                    isWeekend && !isFuture && styles.calDayWeekend,
                  ]}>
                    {day}
                  </Text>
                  {dotColor !== 'transparent' && !isFuture && (
                    <View style={[styles.calDot, {backgroundColor: dotColor}]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            {[
              {color: theme.colors.accentCyan, label: 'Present'},
              {color: theme.colors.error,      label: 'Absent'},
              {color: theme.colors.warning,    label: 'Late'},
              {color: theme.colors.meshBlue,   label: 'Leave'},
            ].map(l => (
              <View key={l.label} style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: l.color}]} />
                <Text style={styles.legendText}>{l.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Selected day detail */}
        {selected && (
          <Card style={styles.detailCard}>
            <Text style={styles.detailTitle}>
              {new Date(selected).toLocaleDateString('en-IN', {weekday: 'long', day: 'numeric', month: 'long'})}
            </Text>
            <View style={[styles.detailBadge, {borderColor: getStatusColor(selectedStatus), backgroundColor: getStatusColor(selectedStatus) + '18'}]}>
              <Text style={[styles.detailBadgeText, {color: getStatusColor(selectedStatus)}]}>
                {selectedStatus ? selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1) : 'No Record'}
              </Text>
            </View>
            {selectedRecord && (
              <Text style={styles.detailInfo}>
                {selectedRecord.check_in_time
                  ? `Check-in: ${selectedRecord.check_in_time}`
                  : ''}
                {selectedRecord.check_out_time
                  ? ` · Check-out: ${selectedRecord.check_out_time}`
                  : ''}
                {selectedRecord.verification_method
                  ? ` · Via ${selectedRecord.verification_method}`
                  : ''}
              </Text>
            )}
          </Card>
        )}

        {/* Monthly summary — from DB stats */}
        <Text style={styles.sectionTitle}>Summary — {MONTH_NAMES[month]}</Text>
        <View style={styles.summaryGrid}>
          {[
            {label: 'Present',  value: monthStats.presentCount, color: theme.colors.accentCyan},
            {label: 'Absent',   value: monthStats.absentCount,  color: theme.colors.error},
            {label: 'Late',     value: monthStats.lateCount,    color: theme.colors.warning},
            {label: 'Total',    value: monthStats.totalDays,    color: theme.colors.meshBlue},
          ].map((s, i) => (
            <Card key={i} style={styles.summaryCard}>
              <Text style={[styles.summaryVal, {color: s.color}]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* Download card */}
        <Card style={styles.downloadCard}>
          <View style={styles.downloadInfo}>
            <Text style={styles.downloadTitle}>Download Report</Text>
            <Text style={styles.downloadSub}>Export {MONTH_NAMES[month]} {year} attendance as PDF</Text>
          </View>
          <Button
            title="Download PDF"
            variant="primary"
            onPress={handleDownload}
            icon={<DownloadIcon />}
            style={styles.downloadActionBtn}
          />
        </Card>

        <View style={{height: 20}} />
      </ScrollView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg, paddingTop: 50, paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.textPrimary,
  },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.surfaceDark,
    borderWidth: 1, borderColor: theme.colors.accentCyan,
    borderRadius: theme.spacing.radius.sm,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  downloadText: {fontSize: 12, color: theme.colors.accentCyan, fontWeight: '700'},

  content: {paddingHorizontal: theme.spacing.lg, paddingBottom: 100},

  calendarCard: {marginBottom: theme.spacing.md, padding: theme.spacing.md},

  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnDisabled: {opacity: 0.4},
  monthLabel: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },

  dayLabelsRow: {flexDirection: 'row', marginBottom: 4},
  dayLabelCell: {flex: 1, alignItems: 'center', paddingVertical: 4},
  dayLabelText: {fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600'},
  dayLabelWeekend: {color: '#4A5568'},

  calGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  calCell: {
    width: '14.28%', aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    padding: 2,
    borderRadius: 6,
  },
  calCellToday: {
    backgroundColor: 'rgba(0,229,160,0.12)',
    borderWidth: 1, borderColor: theme.colors.accentCyan,
    borderRadius: 8,
  },
  calCellSelected: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1.5, borderColor: theme.colors.primaryCyan,
    borderRadius: 8,
  },
  calDayText: {
    fontSize: 13, fontWeight: '500', color: theme.colors.textPrimary,
  },
  calDayToday: {color: theme.colors.accentCyan, fontWeight: '700'},
  calDayFuture: {color: '#3A4A60'},
  calDayWeekend: {color: '#4A5568'},
  calDot: {width: 5, height: 5, borderRadius: 2.5, marginTop: 1},

  legend: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder,
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 5},
  legendDot: {width: 8, height: 8, borderRadius: 4},
  legendText: {fontSize: 11, color: theme.colors.textSecondary},

  detailCard: {marginBottom: theme.spacing.md, gap: 8},
  detailTitle: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  detailBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.spacing.radius.full,
    borderWidth: 1,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  detailBadgeText: {fontSize: 12, fontWeight: '600'},
  detailInfo: {fontSize: 12, color: theme.colors.textSecondary},

  sectionTitle: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm, marginTop: 4,
  },

  summaryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    width: '48%', alignItems: 'center', paddingVertical: theme.spacing.md,
  },
  summaryVal: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.heavy as any,
  },
  summaryLabel: {fontSize: 11, color: theme.colors.textSecondary, marginTop: 3},

  downloadCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: theme.spacing.md, marginBottom: theme.spacing.md,
  },
  downloadInfo: {flex: 1},
  downloadTitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  downloadSub: {fontSize: 11, color: theme.colors.textSecondary, marginTop: 3},
  downloadActionBtn: {minWidth: 130},
});

export default HistoryScreen;
