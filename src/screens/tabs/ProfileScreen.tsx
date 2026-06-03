/**
 * AuthEdge — Profile Tab
 * Industry-standard employee profile screen.
 * Wired to AppContext for real user data, stats, and actions.
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {theme} from '../../theme';
import {GradientBackground, Card, Button} from '../../components/common';
import {useApp} from '../../context/AppContext';

// ─── Icons ────────────────────────────────────────────────────────────────────
const UserCircleIcon = ({size = 64, color = theme.colors.accentCyan}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/>
    <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.5"/>
    <Path d="M6 20.66C6.79 18.77 9.24 17.5 12 17.5s5.21 1.27 6 3.16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

const EditIcon = ({size = 18, color = theme.colors.accentCyan}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ChevronRightIcon = ({size = 16, color = theme.colors.textSecondary}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const LogoutIcon = ({size = 18, color = theme.colors.error}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const ShieldIcon = ({size = 16, color = theme.colors.accentCyan}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const BellIcon = ({size = 16, color = theme.colors.textSecondary}: {size?: number; color?: string}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// ─── Component ────────────────────────────────────────────────────────────────
const ProfileScreen: React.FC = () => {
  const {
    currentUser,
    monthlyStats,
    logout,
    updateProfile,
    changePin,
    settings,
    updateSetting,
  } = useApp();

  const [biometric, setBiometric] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // Change PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(currentUser?.full_name || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editLoading, setEditLoading] = useState(false);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  }, [logout]);

  const handleChangePin = useCallback(async () => {
    if (oldPin.length !== 6 || newPin.length !== 6) {
      Alert.alert('Error', 'PIN must be exactly 6 digits.');
      return;
    }
    setPinLoading(true);
    try {
      const success = await changePin(oldPin, newPin);
      if (success) {
        Alert.alert('Success', 'Your PIN has been changed successfully.');
        setShowPinModal(false);
        setOldPin('');
        setNewPin('');
      } else {
        Alert.alert('Error', 'Current PIN is incorrect. Please try again.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to change PIN.');
    } finally {
      setPinLoading(false);
    }
  }, [oldPin, newPin, changePin]);

  const handleEditProfile = useCallback(async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setEditLoading(true);
    try {
      const success = await updateProfile({
        fullName: editName.trim(),
        email: editEmail.trim() || undefined,
      });
      if (success) {
        Alert.alert('Success', 'Profile updated successfully.');
        setShowEditModal(false);
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setEditLoading(false);
    }
  }, [editName, editEmail, updateProfile]);

  // Derive display values from DB
  const userName = currentUser?.full_name || 'User';
  const userEmail = currentUser?.email || 'Not set';
  const employeeId = currentUser?.employee_id || 'N/A';
  const faceEnrolled = (currentUser?.face_enrolled ?? 0) > 0;
  const faceAngles = currentUser?.face_angles_count ?? 0;
  const joinedDate = currentUser?.created_at
    ? new Date(currentUser.created_at).toLocaleDateString('en-IN', {month: 'short', year: 'numeric'})
    : 'N/A';

  const menuItems = [
    {
      section: 'Account',
      items: [
        {label: 'Edit Profile', icon: <EditIcon />, arrow: true, onPress: () => {
          setEditName(currentUser?.full_name || '');
          setEditEmail(currentUser?.email || '');
          setShowEditModal(true);
        }},
        {label: 'Change PIN', icon: <ShieldIcon />, arrow: true, onPress: () => {
          setOldPin('');
          setNewPin('');
          setShowPinModal(true);
        }},
        {label: 'Biometric Login', icon: <ShieldIcon />, toggle: true, value: biometric, onToggle: setBiometric},
      ],
    },
    {
      section: 'Preferences',
      items: [
        {label: 'Notifications', icon: <BellIcon />, toggle: true, value: notifications, onToggle: setNotifications},
        {label: 'Language', icon: <ChevronRightIcon />, value_label: 'English', arrow: true},
        {label: 'App Theme', icon: <ChevronRightIcon />, value_label: 'Dark', arrow: true},
      ],
    },
  ];

  // Stats from context
  const compliance = monthlyStats.totalDays > 0
    ? Math.round(((monthlyStats.presentCount + monthlyStats.lateCount) / monthlyStats.totalDays) * 100)
    : 0;

  return (
    <GradientBackground style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar card — uses real user data */}
        <Card style={styles.avatarCard} glow="cyan">
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <UserCircleIcon size={52} />
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{userName}</Text>
              <Text style={styles.avatarRole}>Field Officer</Text>
              <View style={styles.avatarBadge}>
                <ShieldIcon size={12} />
                <Text style={styles.avatarBadgeText}>
                  {faceEnrolled ? 'Biometric Enrolled' : 'Not Enrolled'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.7}
              onPress={() => {
                setEditName(currentUser?.full_name || '');
                setEditEmail(currentUser?.email || '');
                setShowEditModal(true);
              }}>
              <EditIcon size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarStats}>
            {[
              {label: 'Employee ID', value: employeeId},
              {label: 'Department', value: 'Operations'},
              {label: 'Joined', value: joinedDate},
            ].map((s, i) => (
              <View key={i} style={[styles.avatarStatItem, i > 0 && styles.avatarStatBorder]}>
                <Text style={styles.avatarStatLabel}>{s.label}</Text>
                <Text style={styles.avatarStatValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Contact info — from DB */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Card style={styles.contactCard}>
          {[
            {label: 'Email',    value: userEmail},
            {label: 'Emp ID',   value: employeeId},
            {label: 'Location', value: 'NHAI HQ, New Delhi'},
            {label: 'Manager',  value: 'Admin'},
          ].map((c, i) => (
            <View key={i} style={[styles.contactRow, i > 0 && styles.contactBorder]}>
              <Text style={styles.contactLabel}>{c.label}</Text>
              <Text style={styles.contactValue}>{c.value}</Text>
            </View>
          ))}
        </Card>

        {/* This month summary — from DB stats */}
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.statsRow}>
          {[
            {label: 'Present',     value: String(monthlyStats.presentCount), color: theme.colors.accentCyan},
            {label: 'Absent',      value: String(monthlyStats.absentCount),  color: theme.colors.error},
            {label: 'Late',        value: String(monthlyStats.lateCount),    color: theme.colors.warning},
            {label: 'Compliance',  value: `${compliance}%`,                  color: theme.colors.success},
          ].map((s, i) => (
            <Card key={i} style={styles.statCard}>
              <Text style={[styles.statValue, {color: s.color}]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </Card>
          ))}
        </View>

        {/* Settings menu */}
        {menuItems.map((group, gi) => (
          <View key={gi}>
            <Text style={styles.sectionTitle}>{group.section}</Text>
            <Card style={styles.menuCard}>
              {group.items.map((item: any, ii) => (
                <TouchableOpacity
                  key={ii}
                  style={[styles.menuRow, ii > 0 && styles.menuBorder]}
                  activeOpacity={item.toggle ? 1 : 0.7}
                  onPress={item.onPress}
                  disabled={!!item.toggle}>
                  <View style={styles.menuIcon}>{item.icon}</View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.toggle !== undefined ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{false: '#1A2340', true: theme.colors.accentCyan + '80'}}
                      thumbColor={item.value ? theme.colors.accentCyan : '#8F9BB3'}
                    />
                  ) : item.value_label ? (
                    <View style={styles.menuValueRow}>
                      <Text style={styles.menuValueLabel}>{item.value_label}</Text>
                      <ChevronRightIcon />
                    </View>
                  ) : (
                    <ChevronRightIcon />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        {/* Face enrollment status — from DB */}
        <Text style={styles.sectionTitle}>Biometric Status</Text>
        <Card style={styles.biometricCard} glow="cyan">
          <View style={styles.biometricRow}>
            <View style={styles.biometricIconWrap}>
              <ShieldIcon size={24} />
            </View>
            <View style={styles.biometricInfo}>
              <Text style={styles.biometricTitle}>
                {faceEnrolled ? 'Face Enrolled' : 'Not Enrolled'}
              </Text>
              <Text style={styles.biometricSub}>
                {faceEnrolled
                  ? `${faceAngles} angle${faceAngles !== 1 ? 's' : ''} · Enrolled ${joinedDate}`
                  : 'Complete face enrollment to enable biometric attendance'}
              </Text>
            </View>
            <View style={[styles.biometricBadge, !faceEnrolled && {borderColor: theme.colors.warning, backgroundColor: 'rgba(255,179,0,0.1)'}]}>
              <Text style={[styles.biometricBadgeText, !faceEnrolled && {color: theme.colors.warning}]}>
                {faceEnrolled ? 'Active' : 'Pending'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.7} onPress={handleLogout}>
          <LogoutIcon />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>AuthEdge v1.2.0 · Build 2024.06</Text>

        <View style={{height: 20}} />
      </ScrollView>

      {/* ──── Change PIN Modal ──── */}
      <Modal visible={showPinModal} transparent animationType="fade" onRequestClose={() => setShowPinModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change PIN</Text>
            <Text style={styles.modalSub}>Enter your current PIN and then your new 6-digit PIN.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Current PIN"
              placeholderTextColor="#4A5568"
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              value={oldPin}
              onChangeText={setOldPin}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="New PIN"
              placeholderTextColor="#4A5568"
              keyboardType="number-pad"
              maxLength={6}
              secureTextEntry
              value={newPin}
              onChangeText={setNewPin}
            />
            <View style={styles.modalBtnRow}>
              <Button title="Save" variant="primary" onPress={handleChangePin} style={{flex: 1}} />
              <Button title="Cancel" variant="ghost" onPress={() => setShowPinModal(false)} style={{flex: 1}} />
            </View>
          </View>
        </View>
      </Modal>

      {/* ──── Edit Profile Modal ──── */}
      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              placeholderTextColor="#4A5568"
              value={editName}
              onChangeText={setEditName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              placeholderTextColor="#4A5568"
              keyboardType="email-address"
              value={editEmail}
              onChangeText={setEditEmail}
            />
            <View style={styles.modalBtnRow}>
              <Button title="Save" variant="primary" onPress={handleEditProfile} style={{flex: 1}} />
              <Button title="Cancel" variant="ghost" onPress={() => setShowEditModal(false)} style={{flex: 1}} />
            </View>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  header: {
    paddingHorizontal: theme.spacing.lg, paddingTop: 50, paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.heavy as any,
    color: theme.colors.textPrimary,
  },
  content: {paddingHorizontal: theme.spacing.lg, paddingBottom: 100},

  avatarCard: {marginBottom: theme.spacing.lg},
  avatarRow: {
    flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderWidth: 2, borderColor: theme.colors.accentCyan,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInfo: {flex: 1},
  avatarName: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  avatarRole: {fontSize: 13, color: theme.colors.textSecondary, marginTop: 2},
  avatarBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 6,
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderRadius: theme.spacing.radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: theme.colors.accentCyan,
  },
  avatarBadgeText: {fontSize: 10, color: theme.colors.accentCyan, fontWeight: '600'},
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1, borderColor: theme.colors.surfaceBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarStats: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder,
    paddingTop: theme.spacing.md,
  },
  avatarStatItem: {flex: 1, alignItems: 'center'},
  avatarStatBorder: {borderLeftWidth: 1, borderLeftColor: theme.colors.surfaceBorder},
  avatarStatLabel: {fontSize: 10, color: theme.colors.textSecondary, marginBottom: 3},
  avatarStatValue: {
    fontSize: 11, fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary, textAlign: 'center',
  },

  sectionTitle: {
    fontSize: theme.typography.sizes.h5,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm, marginTop: 4,
  },

  contactCard: {padding: 0, overflow: 'hidden', marginBottom: theme.spacing.lg},
  contactRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md, paddingVertical: 12,
  },
  contactBorder: {borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder},
  contactLabel: {fontSize: 12, color: theme.colors.textSecondary, width: 80},
  contactValue: {
    flex: 1, textAlign: 'right',
    fontSize: theme.typography.sizes.bodySmall,
    fontWeight: theme.typography.weights.semibold as any,
    color: theme.colors.textPrimary,
  },

  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statCard: {width: '48%', alignItems: 'center', paddingVertical: theme.spacing.md},
  statValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.heavy as any,
  },
  statLabel: {fontSize: 11, color: theme.colors.textSecondary, marginTop: 3},

  menuCard: {padding: 0, overflow: 'hidden', marginBottom: theme.spacing.lg},
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: theme.spacing.md, paddingVertical: 14, gap: 12,
  },
  menuBorder: {borderTopWidth: 1, borderTopColor: theme.colors.surfaceBorder},
  menuIcon: {width: 24, alignItems: 'center'},
  menuLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.medium as any,
    color: theme.colors.textPrimary,
  },
  menuValueRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  menuValueLabel: {fontSize: 13, color: theme.colors.textSecondary},

  biometricCard: {marginBottom: theme.spacing.lg},
  biometricRow: {flexDirection: 'row', alignItems: 'center', gap: 12},
  biometricIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderWidth: 1, borderColor: theme.colors.accentCyan,
    alignItems: 'center', justifyContent: 'center',
  },
  biometricInfo: {flex: 1},
  biometricTitle: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
  },
  biometricSub: {fontSize: 11, color: theme.colors.textSecondary, marginTop: 2},
  biometricBadge: {
    backgroundColor: 'rgba(0,229,160,0.1)',
    borderRadius: theme.spacing.radius.full,
    borderWidth: 1, borderColor: theme.colors.accentCyan,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  biometricBadgeText: {fontSize: 11, color: theme.colors.accentCyan, fontWeight: '700'},

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
    borderRadius: theme.spacing.radius.md,
    borderWidth: 1.5, borderColor: theme.colors.error,
    backgroundColor: 'rgba(255,82,82,0.08)',
    marginBottom: theme.spacing.md,
  },
  logoutText: {
    fontSize: theme.typography.sizes.bodyMedium,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.error,
  },
  version: {textAlign: 'center', fontSize: 11, color: '#3A4A60'},

  // Modal styles
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
    gap: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold as any,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: theme.typography.sizes.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.spacing.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    fontSize: theme.typography.sizes.bodyMedium,
    color: theme.colors.textPrimary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
});

export default ProfileScreen;
