/**
 * AuthEdge — Global App Context Provider
 *
 * Manages the global reactive state of the application, connecting
 * screens to SQLite services, authentication, settings, and attendance records.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseManager } from '../database';
import {
  AuthService,
  AttendanceService,
  ProfileService,
  SyncService,
  SettingsService
} from '../services';
import { User, AttendanceRecord, MonthlyStats, SyncStats, AppSettings } from './types';
import { toDBDate } from '../utils';

interface AppContextProps {
  // Global Load state
  isLoading: boolean;

  // Authentication states
  isRegistered: boolean;
  isLoggedIn: boolean;
  currentUser: User | null;

  // Attendance states
  isTodayMarked: boolean;
  todayRecord: AttendanceRecord | null;
  monthlyStats: MonthlyStats;
  recentRecords: AttendanceRecord[];

  // Settings states
  settings: AppSettings;
  dbSize: string;
  templatesCount: number;

  // Synchronization states
  syncStats: SyncStats;

  // Actions
  login: (pin: string) => Promise<boolean>;
  register: (name: string, email: string, employeeId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  markAttendance: (method?: 'face' | 'pin' | 'manual', confidence?: number, location?: string) => Promise<boolean>;
  markCheckOut: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
  updateProfile: (updates: { fullName?: string; email?: string; employeeId?: string }) => Promise<boolean>;
  changePin: (oldPin: string, newPin: string) => Promise<boolean>;
  updateSetting: (key: string, value: string) => Promise<void>;
  triggerSync: (onProgress?: (progress: number, currentItemText: string) => void) => Promise<boolean>;
  securePurge: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Attendance states
  const [isTodayMarked, setIsTodayMarked] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    totalDays: 0,
    percentage: 0
  });
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);

  // Settings states
  const [settings, setSettings] = useState<AppSettings>({
    resolution: '1080p',
    front_camera: true,
    auto_sync: false,
    sync_frequency: 'Daily',
  });
  const [dbSize, setDbSize] = useState('32.0 KB');
  const [templatesCount, setTemplatesCount] = useState(0);

  // Sync states
  const [syncStats, setSyncStats] = useState<SyncStats>({
    pending: 0,
    synced: 0,
    failed: 0
  });

  // On App Mount: Initialize DB and Auth Session
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[AppContext] Starting app initialization...');
        // Initialize SQLite Encrypted database
        await DatabaseManager.initDatabase();
        console.log('[AppContext] Database initialization completed.');

        // Check registration and active session
        console.log('[AppContext] Checking registration status...');
        const registered = await AuthService.isRegistered();
        console.log('[AppContext] Registration status checked:', registered);
        setIsRegistered(registered);

        console.log('[AppContext] Getting current user...');
        const activeUser = await AuthService.getCurrentUser();
        console.log('[AppContext] Current user retrieved:', activeUser ? activeUser.full_name : 'None');
        if (activeUser) {
          setCurrentUser(activeUser);
          setIsLoggedIn(true);
        }

        // Load persisted settings
        console.log('[AppContext] Refreshing settings...');
        await refreshSettings();
        console.log('[AppContext] Settings refreshed.');

        // Refresh sync stats
        console.log('[AppContext] Refreshing sync stats...');
        await refreshSyncStats();
        console.log('[AppContext] Sync stats refreshed.');
      } catch (error) {
        console.warn('[AppContext] App initialization failed:', error);
      } finally {
        console.log('[AppContext] Set isLoading to false');
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Whenever user logs in, load their attendance history
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      refreshAttendance();
    } else {
      setIsTodayMarked(false);
      setTodayRecord(null);
      setRecentRecords([]);
      setMonthlyStats({
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        totalDays: 0,
        percentage: 0
      });
    }
  }, [isLoggedIn, currentUser]);

  /**
   * Refreshes attendance records and statistics from the DB.
   */
  const refreshAttendance = async () => {
    if (!currentUser) return;
    try {
      const todayDate = toDBDate();
      const currentYearMonth = todayDate.substring(0, 7); // 'YYYY-MM'

      const marked = await AttendanceService.isMarkedToday(currentUser.id);
      setIsTodayMarked(marked);

      const record = await AttendanceService.getTodayRecord(currentUser.id);
      setTodayRecord(record);

      const stats = await AttendanceService.getMonthlyStats(currentUser.id, currentYearMonth);
      setMonthlyStats(stats);

      const recent = await AttendanceService.getRecentRecords(currentUser.id, 10);
      setRecentRecords(recent);

      await refreshSettings(); // Also refresh size & templates since they depend on rows
    } catch (e) {
      console.warn('[AppContext] Error refreshing attendance:', e);
    }
  };

  /**
   * Refreshes settings, DB size, and face template count.
   */
  const refreshSettings = async () => {
    try {
      const savedSettings = await SettingsService.getSettings();
      setSettings({
        resolution: (savedSettings.resolution as any) || '1080p',
        front_camera: savedSettings.front_camera === 'true',
        auto_sync: savedSettings.auto_sync === 'true',
        sync_frequency: savedSettings.sync_frequency || 'Daily',
      });

      const size = await SettingsService.getDatabaseSize();
      setDbSize(size);

      const count = await SettingsService.getFaceTemplatesCount();
      setTemplatesCount(count);
    } catch (e) {
      console.warn('[AppContext] Error refreshing settings:', e);
    }
  };

  /**
   * Refreshes local sync queue counts.
   */
  const refreshSyncStats = async () => {
    try {
      const stats = await SyncService.getSyncStats();
      setSyncStats(stats);
    } catch (e) {
      console.warn('[AppContext] Error refreshing sync stats:', e);
    }
  };

  /**
   * Action: PIN Login.
   */
  const login = async (pin: string): Promise<boolean> => {
    try {
      const user = await AuthService.login(pin);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[AppContext] Login action error:', e);
      return false;
    }
  };

  /**
   * Action: Registration.
   */
  const register = async (
    name: string,
    email: string,
    employeeId: string,
    pin: string
  ): Promise<boolean> => {
    try {
      const user = await AuthService.register(name, email, employeeId, pin);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setIsRegistered(true);
        await refreshSettings();
        await refreshSyncStats();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[AppContext] Register action error:', e);
      return false;
    }
  };

  /**
   * Action: Logout.
   */
  const logout = async () => {
    try {
      await AuthService.logout();
      setCurrentUser(null);
      setIsLoggedIn(false);
    } catch (e) {
      console.warn('[AppContext] Logout action error:', e);
    }
  };

  /**
   * Action: Mark Attendance.
   */
  const markAttendance = async (
    method: 'face' | 'pin' | 'manual' = 'face',
    confidence: number = 0.95,
    location?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const record = await AttendanceService.markAttendance(
        currentUser.id,
        method,
        confidence,
        location
      );
      if (record) {
        await refreshAttendance();
        await refreshSyncStats();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[AppContext] Mark attendance action error:', e);
      return false;
    }
  };

  /**
   * Action: Check out.
   */
  const markCheckOut = async () => {
    if (!currentUser) return;
    try {
      await AttendanceService.markCheckOut(currentUser.id);
      await refreshAttendance();
      await refreshSyncStats();
    } catch (e) {
      console.warn('[AppContext] Check out action error:', e);
    }
  };

  /**
   * Action: Update User Profile details.
   */
  const updateProfile = async (updates: {
    fullName?: string;
    email?: string;
    employeeId?: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const updated = await ProfileService.updateProfile(currentUser.id, updates);
      if (updated) {
        setCurrentUser(updated);
        await refreshSyncStats();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[AppContext] Update profile action error:', e);
      return false;
    }
  };

  /**
   * Action: Change PIN passcode.
   */
  const changePin = async (oldPin: string, newPin: string): Promise<boolean> => {
    try {
      const success = await AuthService.changePin(oldPin, newPin);
      if (success) {
        // Reload current user to reflect updated pin hash
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
        await refreshSyncStats();
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[AppContext] Change PIN action error:', e);
      return false;
    }
  };

  /**
   * Action: Save settings updates in DB.
   */
  const updateSetting = async (key: string, value: string): Promise<void> => {
    try {
      await SettingsService.updateSetting(key, value);
      await refreshSettings();
    } catch (e) {
      console.warn('[AppContext] Update setting action error:', e);
    }
  };

  /**
   * Action: Force Synchronization.
   */
  const triggerSync = async (
    onProgress?: (progress: number, currentItemText: string) => void
  ): Promise<boolean> => {
    try {
      const result = await SyncService.triggerSync(onProgress);
      await refreshSyncStats();
      return result;
    } catch (e) {
      console.warn('[AppContext] Trigger sync action error:', e);
      return false;
    }
  };

  /**
   * Action: NIST 800-88 Compliant Secure Erase.
   */
  const securePurge = async () => {
    try {
      setIsLoading(true);
      await DatabaseManager.purgeAllData();
      
      // Reset all context auth states
      setCurrentUser(null);
      setIsLoggedIn(false);
      setIsRegistered(false);
      
      // Refresh default settings & sync counters
      await refreshSettings();
      await refreshSyncStats();
    } catch (e) {
      console.warn('[AppContext] Secure purge action failed:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isLoading,
        isRegistered,
        isLoggedIn,
        currentUser,
        isTodayMarked,
        todayRecord,
        monthlyStats,
        recentRecords,
        settings,
        dbSize,
        templatesCount,
        syncStats,
        login,
        register,
        logout,
        markAttendance,
        markCheckOut,
        refreshAttendance,
        updateProfile,
        changePin,
        updateSetting,
        triggerSync,
        securePurge
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
export default AppContext;
