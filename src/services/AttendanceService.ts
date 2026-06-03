/**
 * AuthEdge — Attendance Service
 */

import { AttendanceRepository, SyncQueueRepository } from '../database';
import { toDBDate, toDBTime, CONSTANTS } from '../utils';

export const AttendanceService = {
  /**
   * Records a user's attendance check-in for today.
   */
  async markAttendance(
    userId: number,
    verificationMethod: 'face' | 'pin' | 'manual' = 'face',
    confidenceScore: number = 0.95,
    location: string = CONSTANTS.DEFAULT_LOCATION
  ): Promise<any> {
    try {
      const todayDate = toDBDate();
      const currentTime = toDBTime();
      
      console.log(`[AttendanceService] Marking attendance for User ID: ${userId} at ${currentTime}`);

      // Check if already checked in today
      const existing = await AttendanceRepository.getTodayRecord(userId, todayDate);
      if (existing) {
        console.log('[AttendanceService] Attendance already marked for today:', existing);
        return existing;
      }

      // Determine attendance status based on shift start time (9:00 AM)
      let status = 'present';
      if (currentTime > CONSTANTS.SHIFT_START_TIME) {
        status = 'late';
      }

      const attendanceData = {
        userId,
        date: todayDate,
        checkInTime: currentTime,
        status,
        verificationMethod,
        confidenceScore,
        location,
      };

      const recordId = await AttendanceRepository.markAttendance(attendanceData);
      
      const newRecord = {
        id: recordId,
        ...attendanceData
      };

      // Queue in Sync Queue
      await SyncQueueRepository.enqueue('attendance', recordId, 'insert', newRecord);
      
      console.log('[AttendanceService] Attendance marked successfully. Record ID:', recordId);
      return newRecord;
    } catch (error) {
      console.warn('[AttendanceService] Error marking attendance:', error);
      throw error;
    }
  },

  /**
   * Records check-out for today.
   */
  async markCheckOut(userId: number): Promise<void> {
    try {
      const todayDate = toDBDate();
      const currentTime = toDBTime();

      await AttendanceRepository.markCheckOut(userId, todayDate, currentTime);
      
      const record = await AttendanceRepository.getTodayRecord(userId, todayDate);
      if (record) {
        await SyncQueueRepository.enqueue('attendance', record.id, 'update', {
          id: record.id,
          check_out_time: currentTime,
        });
      }
      
      console.log('[AttendanceService] Check-out recorded at:', currentTime);
    } catch (error) {
      console.warn('[AttendanceService] Error marking check-out:', error);
      throw error;
    }
  },

  /**
   * Checks if user has marked attendance today.
   */
  async isMarkedToday(userId: number): Promise<boolean> {
    try {
      const todayDate = toDBDate();
      const record = await AttendanceRepository.getTodayRecord(userId, todayDate);
      return !!record;
    } catch (error) {
      console.warn('[AttendanceService] Error checking today status:', error);
      return false;
    }
  },

  /**
   * Gets today's attendance record for the user.
   */
  async getTodayRecord(userId: number): Promise<any | null> {
    try {
      const todayDate = toDBDate();
      return await AttendanceRepository.getTodayRecord(userId, todayDate);
    } catch (error) {
      console.warn('[AttendanceService] Error getting today record:', error);
      return null;
    }
  },

  /**
   * Gets recent attendance records (e.g. for dashboard feed).
   */
  async getRecentRecords(userId: number, limit: number = 5): Promise<any[]> {
    try {
      return await AttendanceRepository.getRecentRecords(userId, limit);
    } catch (error) {
      console.warn('[AttendanceService] Error getting recent records:', error);
      return [];
    }
  },

  /**
   * Computes monthly statistics: present, late, absent, working days, and percent.
   */
  async getMonthlyStats(userId: number, yearMonth: string): Promise<{
    presentCount: number;
    absentCount: number;
    lateCount: number;
    totalDays: number;
    percentage: number;
  }> {
    try {
      const stats = await AttendanceRepository.getMonthlyStats(userId, yearMonth);
      
      // Calculate total working days in month (excluding weekends) up to current date
      // Or just use count of records in DB as standard calculation
      const presentCount = stats.present;
      const lateCount = stats.late;
      const absentCount = stats.absent;
      const totalDays = stats.total;
      
      const attendedCount = presentCount + lateCount;
      const percentage = totalDays > 0 ? Math.round((attendedCount / totalDays) * 100) : 0;
      
      return {
        presentCount,
        absentCount,
        lateCount,
        totalDays,
        percentage
      };
    } catch (error) {
      console.warn('[AttendanceService] Error getting monthly stats:', error);
      return {
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        totalDays: 0,
        percentage: 0
      };
    }
  },

  /**
   * Returns calendar data structure for History Screen: { 'YYYY-MM-DD': { selected: true, marked: true, dotColor: '...' } }
   */
  async getMonthCalendarData(userId: number, yearMonth: string): Promise<Record<string, any>> {
    try {
      const records = await AttendanceRepository.getRecordsByMonth(userId, yearMonth);
      const calendarData: Record<string, any> = {};

      for (const r of records) {
        let dotColor = '#00E5A0'; // Present (cyan/green)
        if (r.status === 'late') {
          dotColor = '#FFB300'; // Late (orange)
        } else if (r.status === 'absent') {
          dotColor = '#FF5252'; // Absent (red)
        }

        calendarData[r.date] = {
          marked: true,
          dotColor: dotColor,
          customStyles: {
            container: {
              backgroundColor: 'rgba(6, 11, 24, 0.6)',
              borderWidth: 1,
              borderColor: dotColor,
            },
            text: {
              color: '#FFFFFF',
            }
          },
          // raw db record
          record: r
        };
      }

      return calendarData;
    } catch (error) {
      console.warn('[AttendanceService] Error building calendar data:', error);
      return {};
    }
  }
};
export default AttendanceService;
