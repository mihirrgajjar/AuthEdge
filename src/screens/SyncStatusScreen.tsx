/**
 * AuthEdge — Sync Status Screen
 *
 * Visual sync queue, upload progress, and purge controls.
 * Full AWS integration in Phase 10.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type {ScreenProps} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, Card, Button} from '../components/common';

const SyncStatusScreen: React.FC<ScreenProps<'SyncStatus'>> = ({
  navigation,
}) => {
  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
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
          <View style={styles.connectionIndicator}>
            <View style={styles.connectionDot} />
          </View>
          <View style={styles.connectionInfo}>
            <Text style={styles.connectionTitle}>No Connection</Text>
            <Text style={styles.connectionSubtext}>
              Data will sync when network is available
            </Text>
          </View>
        </Card>

        {/* Sync Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, {color: theme.colors.success}]}>0</Text>
            <Text style={styles.statLabel}>Synced</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, {color: theme.colors.error}]}>0</Text>
            <Text style={styles.statLabel}>Failed</Text>
          </Card>
        </View>

        {/* Sync Queue */}
        <Text style={styles.sectionTitle}>Sync Queue</Text>
        <Card style={styles.emptyState}>
          <Text style={styles.emptyText}>Queue is empty</Text>
          <Text style={styles.emptySubtext}>
            No records pending synchronization
          </Text>
        </Card>

        {/* Sync History */}
        <Text style={styles.sectionTitle}>Recent Sync History</Text>
        <Card style={styles.emptyState}>
          <Text style={styles.emptyText}>No sync history</Text>
          <Text style={styles.emptySubtext}>
            Sync events will appear here
          </Text>
        </Card>

        {/* Manual Sync Button */}
        <Button
          title="Sync Now"
          variant="secondary"
          onPress={() => {}}
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
  backArrow: {
    fontSize: theme.typography.sizes.h4,
    color: theme.colors.textPrimary,
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
    backgroundColor: 'rgba(255, 138, 101, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.offline,
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
  sectionTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm + 2,
  },
  emptyState: {
    paddingVertical: theme.spacing.xl + 8,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.sizes.bodyLarge,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold as any,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: '#4A5568',
    marginTop: theme.spacing.xs,
  },
});

export default SyncStatusScreen;
