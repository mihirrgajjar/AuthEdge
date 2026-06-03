/**
 * AuthEdge App — Root Navigation Types
 *
 * Type-safe route definitions for the entire navigation stack.
 * Every screen in the app is registered here with its expected params.
 */

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Onboarding: undefined;
  Login: undefined;
  Dashboard: undefined;
  Enrollment: undefined;
  Verification: {
    userId?: string;
  };
  Settings: undefined;
  SyncStatus: undefined;
};

/** Generic screen props helper — use in each screen component */
export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/** Route name literals for programmatic navigation */
export const ROUTES = {
  SPLASH: 'Splash',
  HOME: 'Home',
  ONBOARDING: 'Onboarding',
  LOGIN: 'Login',
  DASHBOARD: 'Dashboard',
  ENROLLMENT: 'Enrollment',
  VERIFICATION: 'Verification',
  SETTINGS: 'Settings',
  SYNC_STATUS: 'SyncStatus',
} as const;
