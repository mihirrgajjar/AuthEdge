/**
 * AuthEdge — Cloud Synchronization Service
 *
 * Manages the offline-first sync queue, triggering manual and automatic sync operations
 * with simulated network calls representing AWS S3 / DynamoDB connectivity.
 */

import { SyncQueueRepository } from '../database';

export const SyncService = {
  /**
   * Retrieves synchronization statistics.
   */
  async getSyncStats(): Promise<{
    pending: number;
    synced: number;
    failed: number;
  }> {
    try {
      return await SyncQueueRepository.getStats();
    } catch (error) {
      console.warn('[SyncService] Error getting sync stats:', error);
      return { pending: 0, synced: 0, failed: 0 };
    }
  },

  /**
   * Gets all pending and processed items in the sync queue.
   */
  async getSyncQueue(): Promise<any[]> {
    try {
      return await SyncQueueRepository.getPending();
    } catch (error) {
      console.warn('[SyncService] Error getting sync queue:', error);
      return [];
    }
  },

  /**
   * Process all pending items in the sync queue (simulating AWS sync).
   * Supports progress callback to update UI sync progress bars.
   */
  async triggerSync(
    onProgress?: (progress: number, currentItemText: string) => void
  ): Promise<boolean> {
    try {
      console.log('[SyncService] Initiating manual synchronization...');
      const pendingItems = await SyncQueueRepository.getPending();
      
      if (pendingItems.length === 0) {
        console.log('[SyncService] No pending items to synchronize.');
        if (onProgress) onProgress(1, 'Sync completed - Queue empty');
        return true;
      }

      const total = pendingItems.length;
      for (let i = 0; i < total; i++) {
        const item = pendingItems[i];
        const progress = (i + 1) / total;
        const currentItemText = `Syncing ${item.table_name} (ID: ${item.record_id})...`;
        
        console.log(`[SyncService] [${i+1}/${total}] ${currentItemText}`);
        if (onProgress) onProgress(progress, currentItemText);

        // Simulate network latency (500ms per record upload)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Update database record as synced
        await SyncQueueRepository.updateStatus(item.id, 'synced', item.attempts + 1);
      }

      console.log('[SyncService] Synchronization complete.');
      return true;
    } catch (error) {
      console.warn('[SyncService] Synchronization failed:', error);
      return false;
    }
  }
};
export default SyncService;
