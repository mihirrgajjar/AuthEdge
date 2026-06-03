/**
 * AuthEdge — Main Bottom Tab Navigator
 * 5 tabs: Dashboard · Attendance · History · Profile · Settings
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {theme} from '../theme';

import HomeDashboardScreen from '../screens/tabs/HomeDashboardScreen';
import AttendanceScreen    from '../screens/tabs/AttendanceScreen';
import HistoryScreen       from '../screens/tabs/HistoryScreen';
import ProfileScreen       from '../screens/tabs/ProfileScreen';
import SettingsScreen      from '../screens/SettingsScreen';

// ─── Tab Icons ────────────────────────────────────────────────────────────────
const DashboardIcon = ({active}: {active: boolean}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      fill={active ? 'rgba(0,229,160,0.1)' : 'none'}
    />
    <Path
      d="M9 22V12h6v10"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const AttendanceIcon = ({active}: {active: boolean}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2" strokeLinecap="round"
    />
    <Path
      d="M9 12l2 2 4-4"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);

const HistoryIcon = ({active}: {active: boolean}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3h18v18H3V3z"
      stroke="none" fill="none"
    />
    <Path
      d="M8 2v4M16 2v4M3 10h18"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2" strokeLinecap="round"
    />
    <Path
      d="M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <Path
      d="M9 14h1M13 14h1M9 17h1M13 17h1"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2.5" strokeLinecap="round"
    />
  </Svg>
);

const ProfileIcon = ({active}: {active: boolean}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12" cy="8" r="4"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2"
      fill={active ? 'rgba(0,229,160,0.1)' : 'none'}
    />
    <Path
      d="M4 20c0-4 3.58-7 8-7s8 3 8 7"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2" strokeLinecap="round"
    />
  </Svg>
);

const SettingsIcon = ({active}: {active: boolean}) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12" cy="12" r="3"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="2"
    />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={active ? theme.colors.accentCyan : theme.colors.textSecondary}
      strokeWidth="1.5"
    />
  </Svg>
);

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
const TAB_ITEMS = [
  {key: 'Dashboard',  label: 'Dashboard',  Icon: DashboardIcon},
  {key: 'Attendance', label: 'Attendance', Icon: AttendanceIcon},
  {key: 'History',    label: 'History',    Icon: HistoryIcon},
  {key: 'Profile',    label: 'Profile',    Icon: ProfileIcon},
  {key: 'Settings',   label: 'Settings',   Icon: SettingsIcon},
];

function CustomTabBar({state, navigation}: any) {
  return (
    <View style={tabStyles.bar}>
      {TAB_ITEMS.map((tab, index) => {
        const active = state.index === index;
        return (
          <TouchableOpacity
            key={tab.key}
            style={tabStyles.tab}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(tab.key)}>
            <View style={[tabStyles.iconWrap, active && tabStyles.iconWrapActive]}>
              <tab.Icon active={active} />
            </View>
            <Text style={[tabStyles.label, active && tabStyles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceDark,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceBorder,
    paddingBottom: 20,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  iconWrap: {
    width: 38, height: 32,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(0,229,160,0.1)',
  },
  label: {
    fontSize: 9,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelActive: {
    color: theme.colors.accentCyan,
    fontWeight: '700',
  },
});

// ─── Navigator ────────────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator();

// Wrap SettingsScreen so it doesn't need navigation.goBack()
const SettingsTabScreen = () => <SettingsScreen navigation={{goBack: () => {}}} route={{} as any} />;

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="Dashboard"  component={HomeDashboardScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="History"    component={HistoryScreen} />
      <Tab.Screen name="Profile"    component={ProfileScreen} />
      <Tab.Screen name="Settings"   component={SettingsTabScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
