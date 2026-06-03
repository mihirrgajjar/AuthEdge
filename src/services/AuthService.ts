/**
 * AuthEdge — Authentication & Session Service
 */

import { UserRepository, SessionRepository, SyncQueueRepository } from '../database';
import { hashPin, verifyPin } from '../utils';

export const AuthService = {
  /**
   * Registers a new user.
   */
  async register(
    fullName: string,
    email: string,
    employeeId: string,
    pin: string
  ): Promise<any> {
    try {
      console.log('[AuthService] Initiating registration for:', fullName);
      
      const pinHash = hashPin(pin);
      
      const userId = await UserRepository.create({
        fullName,
        email,
        employeeId,
        pinHash,
        faceEnrolled: 1, // Face capture is completed as step 1 in UI
        faceAnglesCount: 3, // 3 angles captured
      });

      const user = await UserRepository.findById(userId);
      if (!user) {
        throw new Error('User creation failed - could not retrieve inserted user');
      }

      // Create session
      await SessionRepository.create(userId);

      // Queue for cloud sync
      await SyncQueueRepository.enqueue('users', userId, 'insert', {
        id: userId,
        full_name: fullName,
        email,
        employee_id: employeeId,
        face_enrolled: 1,
        face_angles_count: 3
      });

      console.log('[AuthService] User registered and logged in successfully.');
      return user;
    } catch (error) {
      console.warn('[AuthService] Registration error:', error);
      throw error;
    }
  },

  /**
   * Logs in a user by verifying their PIN.
   */
  async login(pin: string): Promise<any | null> {
    try {
      const user = await UserRepository.getFirstUser();
      if (!user) {
        console.log('[AuthService] Login failed: No user registered on this device.');
        return null;
      }

      const isValid = verifyPin(pin, user.pin_hash);
      if (!isValid) {
        console.log('[AuthService] Login failed: Invalid PIN.');
        return null;
      }

      // Create login session
      await SessionRepository.create(user.id);
      console.log('[AuthService] Login successful for:', user.full_name);
      return user;
    } catch (error) {
      console.warn('[AuthService] Login error:', error);
      throw error;
    }
  },

  /**
   * Logs out the current user, deactivating the active session.
   */
  async logout(): Promise<void> {
    try {
      await SessionRepository.deactivateAll();
      console.log('[AuthService] Session logged out successfully.');
    } catch (error) {
      console.warn('[AuthService] Logout error:', error);
      throw error;
    }
  },

  /**
   * Gets the currently authenticated user from active session.
   */
  async getCurrentUser(): Promise<any | null> {
    try {
      const session = await SessionRepository.getActive();
      if (!session) return null;

      const user = await UserRepository.findById(session.user_id);
      return user;
    } catch (error) {
      console.warn('[AuthService] Get current user error:', error);
      return null;
    }
  },

  /**
   * Checks if any user profile is registered on this device.
   */
  async isRegistered(): Promise<boolean> {
    try {
      const count = await UserRepository.count();
      return count > 0;
    } catch (error) {
      console.warn('[AuthService] Check registration status error:', error);
      return false;
    }
  },

  /**
   * Changes the PIN of the currently logged-in user.
   */
  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User session not active');
      }

      const isOldValid = verifyPin(oldPin, user.pin_hash);
      if (!isOldValid) {
        console.log('[AuthService] Change PIN failed: Old PIN is incorrect');
        return false;
      }

      const newHash = hashPin(newPin);
      await UserRepository.update(user.id, { pinHash: newHash });

      // Queue profile update for sync (we encrypt PIN locally, do not push raw PIN)
      await SyncQueueRepository.enqueue('users', user.id, 'update', {
        id: user.id,
        pin_hash_changed: true,
      });

      console.log('[AuthService] PIN changed successfully.');
      return true;
    } catch (error) {
      console.warn('[AuthService] Change PIN error:', error);
      throw error;
    }
  }
};
export default AuthService;
