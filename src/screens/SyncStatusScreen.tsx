/**
 * AuthEdge — Sync Status Screen
 *
 * Visual sync queue, upload progress, and purge controls.
 * Wired to AppContext for real sync stats and manual sync action.
 */

import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import type {ScreenProps} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, Card, Button} from '../components/common';
import {useApp} from '../context/AppContext';
import {SyncService} from '../services';

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

const CloudIcon: React.FC<{size?: number; color?: string}> = ({
  size = 20,
  color = theme.colors.accentCyan,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SyncStatusScreen: React.FC<ScreenProps<'SyncStatus'>> = ({
  navigation,
}) => {
  const {syncStats, triggerSync} = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncText, setSyncText] = useState('');
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  const [lastSyncResult, setLastSyncResult] = useState<'success' | 'failed' | null>(null);

  // Load sync queue items
  const loadQueue = useCallback(async () => {
    try {
      const items = await SyncService.getSyncQueue();
      setSyncQueue(items);
    } catch (e) {
      console.warn('[SyncStatusScreen] Error loading queue:', e);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncText('Initializing sync...');
    setLastSyncResult(null);

    try {
      const result = await triggerSync((progress, text) => {
        setSyncProgress(progress);
        setSyncText(text);
      });
      setLastSyncResult(result ? 'success' : 'failed');
      await loadQueue(); // Refresh queue after sync
    } catch (e) {
      setLastSyncResult('failed');
    } finally {
      setIsSyncing(false);
    }
  }, [triggerSync, loadQueue]);

  // Determine connection status display
  const isOnline = false; // Simulated — offline-first architecture
  const connectionColor = isOnline ? theme.colors.success : theme.colors.offline;
  const connectionLabel = isOnline ? 'Connected' : 'No Connection';
  const connectionSub = isOnline
    ? 'Sync is active and running'
    : 'Data will sync when network is available';

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}>
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sync Status</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Connection Status */}
        <Card style={styles.connectionCard}>
          <View style={[styles.connectionIndicator, {backgroundColor: connectionColor + '18'}]}>
            <View style={[styles.connectionDot, {backgroundColor: connectionColor}]} />
          </View>
          <View style={styles.connectionInfo}>
            <Text style={styles.connectionTitle}>{connectionLabel}</Text>
            <Text style={styles.connectionSubtext}>{connectionSub}</Text>
          </View>
        </Card>

        {/* Sync Stats — from DB */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{syncStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, {color: theme.colors.success}]}>{syncStats.synced}</Text>
            <Text style={styles.statLabel}>Synced</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, {color: theme.colors.error}]}>{syncStats.failed}</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </Card>
        </View>

        {/* Sync Progress (while syncing) */}
        {isSyncing && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <ActivityIndicator size="small" color={theme.colors.accentCyan} />
              <Text style={styles.progressTitle}>Syncing...</Text>
            </View>
            <Text style={styles.progressText}>{syncText}</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, {width: `${Math.round(syncProgress * 100)}%`}]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round(syncProgress * 100)}%</Text>
          </Card>
        )}

        {/* Last Sync Result */}
        {lastSyncResult && !isSyncing && (
          <Card style={[styles.resultCard, lastSyncResult === 'success' ? styles.resultSuccess : styles.resultFailed]}>
            <Text style={[styles.resultText, {color: lastSyncResult === 'success' ? theme.colors.success : theme.colors.error}]}>
              {lastSyncResult === 'success' ? '✓ Sync completed successfully' : '✕ Sync failed — will retry'}
            </Text>
          </Card>
        )}

        {/* Sync Queue */}
        <Text style={styles.sectionTitle}>Sync Queue</Text>
        {syncQueue.length > 0 ? (
          <Card style={styles.queueCard}>
            {syncQueue.map((item, idx) => (
              <View key={item.id} style={[styles.queueRow, idx > 0 && styles.queueBorder]}>
                <View style={styles.queueInfo}>
                  <Text style={styles.queueTable}>{item.table_name}</Text>
                  <Text style={styles.queueAction}>{item.action} · ID {item.record_id}</Text>
                </View>
                <View style={[
                  styles.queueBadge,
                  {
                    backgroundColor: item.status === 'pending'
                      ? theme.colors.warning + '18'
                      : item.status === 'synced'
                      ? theme.colors.success + '18'
                      : theme.colors.error + '18',
                    borderColor: item.status === 'pending'
                      ? theme.colors.warning
                      : item.status === 'synced'
                      ? theme.colors.success
                      : theme.colors.error,
                  }
                ]}>
                  <Text style={[
                    styles.queueBadgeText,
                    {
                      color: item.status === 'pending'
                        ? theme.colors.warning
                        : item.status === 'synced'
                        ? theme.colors.success
                        : theme.colors.error,
                    }
                  ]}>
                    {item.status?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyState}>
            <CloudIcon size={32} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Queue is empty</Text>
            <Text style={styles.emptySubtext}>
              No records pending synchronization
            </Text>
          </Card>
        )}

        {/* Manual Sync Button */}
        <Button
          title={isSyncing ? 'Syncing...' : 'Sync Now'}
          variant="secondary"
          onPress={handleSync}
          disabled={isSyncing}
          style={styles.syncBtn}
        />
      </ScrollView>
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
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md - 2,
  },
  connectionIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionTitle: {
    fontSize: theme.typography.sizes.bodyLarge,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  connectionSubtext: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs - 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.warning,
  },
  statLabel: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium as any,
  },
  progressCard: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressTitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.accentCyan,
  },
  progressText: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.accentCyan,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  resultCard: {
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  resultSuccess: {
    borderWidth: 1,
    borderColor: theme.colors.success,
    backgroundColor: 'rgba(0, 200, 83, 0.08)',
  },
  resultFailed: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
  },
  resultText: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm + 2,
  },
  queueCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
  },
  queueBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
  },
  queueInfo: {
    flex: 1,
  },
  queueTable: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  queueAction: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  queueBadge: {
    borderRadius: theme.spacing.radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  queueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyState: {
    paddingVertical: theme.spacing.xl + 8,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.sizes.bodyLarge,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold as any,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: '#4A5568',
  },
  syncBtn: {
    marginTop: theme.spacing.sm,
  },
});

export default SyncStatusScreen;
