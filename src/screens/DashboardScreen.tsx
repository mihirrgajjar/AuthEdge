/**
 * AuthEdge — Dashboard Screen
 *
 * Main hub showing stats, quick actions, and recent activity.
 * Full implementation with live data in Phase 5.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import type {ScreenProps} from '../navigation/types';
import {theme} from '../theme';
import {GradientBackground, Card, StatusBadge} from '../components/common';

import {
  UserPlusIcon,
  FaceScanIcon,
  SecureSyncIcon,
  SettingsGearIcon,
} from '../assets/icons';

const AuthEdgeLogo = require('../assets/images/AuthEdge_logo.png');

const DashboardScreen: React.FC<ScreenProps<'Dashboard'>> = ({navigation}) => {
  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={AuthEdgeLogo}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.headerRight}>
          <StatusBadge status="offline" />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            {label: 'Enrolled', value: '0', accent: theme.colors.success, glow: 'cyan'},
            {label: 'Verified', value: '0', accent: theme.colors.primaryCyan, glow: 'blue'},
            {label: 'Pending', value: '0', accent: theme.colors.warning, glow: 'none'},
          ].map((stat, index) => (
            <Card key={index} glow={stat.glow as any} style={styles.statCard}>
              <Text style={[styles.statValue, {color: stat.accent}]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCardWrapper}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Enrollment')}>
            <Card style={styles.actionCard}>
              <View style={[styles.actionIcon, {borderColor: theme.colors.success}]}>
                <UserPlusIcon size={24} color={theme.colors.success} />
              </View>
              <Text style={styles.actionLabel}>Enroll Face</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCardWrapper}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Verification', {})}>
            <Card style={styles.actionCard}>
              <View style={[styles.actionIcon, {borderColor: theme.colors.primaryCyan}]}>
                <FaceScanIcon size={24} color={theme.colors.primaryCyan} />
              </View>
              <Text style={styles.actionLabel}>Verify</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCardWrapper}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('SyncStatus')}>
            <Card style={styles.actionCard}>
              <View style={[styles.actionIcon, {borderColor: theme.colors.meshBlue}]}>
                <SecureSyncIcon size={24} color={theme.colors.meshBlue} />
              </View>
              <Text style={styles.actionLabel}>Sync</Text>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCardWrapper}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Settings')}>
            <Card style={styles.actionCard}>
              <View style={[styles.actionIcon, {borderColor: theme.colors.textSecondary}]}>
                <SettingsGearIcon size={24} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.actionLabel}>Settings</Text>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card style={styles.emptyState}>
          <Text style={styles.emptyText}>No activity yet</Text>
          <Text style={styles.emptySubtext}>
            Enroll a face to get started
          </Text>
        </Card>
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
  headerLogo: {
    width: 44,
    height: 44,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  actionCardWrapper: {
    width: '48%',
  },
  actionCard: {
    width: '100%',
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm + 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconText: {
    fontSize: 20,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.light as any,
  },
  actionLabel: {
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold as any,
  },
  emptyState: {
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
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

export default DashboardScreen;
