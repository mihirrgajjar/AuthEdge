/**
 * AuthEdge — Global State Types
 */

export interface User {
  id: number;
  full_name: string;
  email: string | null;
  employee_id: string;
  pin_hash: string;
  face_enrolled: number;
  face_angles_count: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: 'present' | 'absent' | 'pending' | 'late';
  verification_method: 'face' | 'pin' | 'manual';
  confidence_score: number | null;
  location: string | null;
  created_at: string;
}

export interface MonthlyStats {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalDays: number;
  percentage: number;
}

export interface SyncStats {
  pending: number;
  synced: number;
  failed: number;
}

export interface AppSettings {
  resolution: '1080p' | '720p' | '480p';
  front_camera: boolean;
  auto_sync: boolean;
  sync_frequency: string;
}
