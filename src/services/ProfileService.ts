/**
 * AuthEdge — Profile Service
 */

import { UserRepository, SyncQueueRepository } from '../database';

export const ProfileService = {
  /**
   * Retrieves profile details for a user.
   */
  async getProfile(userId: number): Promise<any | null> {
    try {
      return await UserRepository.findById(userId);
    } catch (error) {
      console.warn('[ProfileService] Error getting user profile:', error);
      return null;
    }
  },

  /**
   * Updates user profile fields and queues changes in the sync queue.
   */
  async updateProfile(
    userId: number,
    updates: {
      fullName?: string;
      email?: string;
      employeeId?: string;
    }
  ): Promise<any> {
    try {
      console.log('[ProfileService] Updating profile for User ID:', userId, updates);
      
      await UserRepository.update(userId, {
        fullName: updates.fullName,
        email: updates.email,
        employeeId: updates.employeeId,
      });

      const updatedUser = await UserRepository.findById(userId);

      // Queue in Sync Queue
      await SyncQueueRepository.enqueue('users', userId, 'update', {
        id: userId,
        full_name: updates.fullName,
        email: updates.email,
        employee_id: updates.employeeId,
      });

      console.log('[ProfileService] Profile updated successfully.');
      return updatedUser;
    } catch (error) {
      console.warn('[ProfileService] Error updating user profile:', error);
      throw error;
    }
  }
};
export default ProfileService;
