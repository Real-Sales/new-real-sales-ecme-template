/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility for creating and emitting custom events
 */
export const EventEmitter = {
  /**
   * Emits a status update event for React components
   * @param status - Status message to broadcast
   */
  emitStatusUpdate: (status: string): void => {
    try {
      const event = new CustomEvent('liveAudioStatus', { 
        detail: { status } 
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to emit status update event:', error);
    }
  },
  
  /**
   * Emits an error event for React components
   * @param error - Error message to broadcast
   */
  emitError: (error: string): void => {
    try {
      const event = new CustomEvent('liveAudioError', { 
        detail: { error } 
      });
      document.dispatchEvent(event);
    } catch (e) {
      console.error('Failed to emit error event:', e);
    }
  },
  
  /**
   * Emits a session opened event
   */
  emitSessionOpened: (): void => {
    try {
      const event = new CustomEvent('liveAudioSessionOpened');
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to emit session opened event:', error);
    }
  }
};
