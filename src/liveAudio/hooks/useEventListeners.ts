/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Session } from '@google/genai';

// Type definitions for event handlers
type ImageHandler = (imageData: string, mimeType: string, text: string) => Promise<void>;
type TextHandler = (text: string) => Promise<void>;
type AudioHandler = (audioData: Uint8Array) => Promise<void>;

/**
 * Hook to set up and manage event listeners for React-to-WebComponent communication
 */
export function useEventListeners(
  handlers: {
    onImage: ImageHandler;
    onText: TextHandler;
    onStartMic: () => Promise<void>;
    onStopMic: () => void;
    onImageWithAudio: (
      imageData: string, 
      imageMimeType: string, 
      audioData: string, 
      audioMimeType: string, 
      audioSampleRate: number,
      usePreRecorded: boolean,
      textFallback: string
    ) => Promise<void>;
  }
) {
  /**
   * Sets up all event listeners for external control
   */
  const setupEventListeners = (): () => void => {
    // Image event listener
    const imageListener = (event: any) => {
      const { imageData, mimeType, text } = event.detail;
      handlers.onImage(imageData, mimeType, text || 'explain what is in this image');
    };
    
    // Combined image and audio event listener
    const imageWithAudioListener = (event: any) => {
      const { 
        imageData, 
        imageMimeType, 
        audioData, 
        audioMimeType, 
        audioSampleRate,
        usePreRecorded,
        textFallback 
      } = event.detail;
      
      handlers.onImageWithAudio(
        imageData, 
        imageMimeType, 
        audioData, 
        audioMimeType, 
        audioSampleRate || 16000,
        usePreRecorded || false,
        textFallback || 'explain what is in this image'
      );
    };
    
    // Text event listener
    const testTextListener = (event: any) => {
      const { text } = event.detail;
      handlers.onText(text || 'Hello, can you hear me?');
    };
    
    // Generic text sending
    const liveTextListener = (event: any) => {
      const { text } = event.detail || {};
      if (text && typeof text === 'string') {
        handlers.onText(text);
      }
    };
    
    // Microphone control listeners
    const startMicListener = async () => {
      await handlers.onStartMic();
    };
    
    const stopMicListener = () => {
      handlers.onStopMic();
    };
    
    // Register all event listeners
    document.addEventListener('sendImage', imageListener);
    document.addEventListener('sendImageWithAudio', imageWithAudioListener);
    document.addEventListener('sendTestText', testTextListener);
    document.addEventListener('sendLiveText', liveTextListener);
    document.addEventListener('liveAudioStartMic', startMicListener);
    document.addEventListener('liveAudioStopMic', stopMicListener);
    
    // Return cleanup function
    return () => {
      document.removeEventListener('sendImage', imageListener);
      document.removeEventListener('sendImageWithAudio', imageWithAudioListener);
      document.removeEventListener('sendTestText', testTextListener);
      document.removeEventListener('sendLiveText', liveTextListener);
      document.removeEventListener('liveAudioStartMic', startMicListener);
      document.removeEventListener('liveAudioStopMic', stopMicListener);
    };
  };
  
  /**
   * Emits a status update event for React components
   * @param status - Status message to broadcast
   */
  const emitStatusUpdate = (status: string): void => {
    try {
      const event = new CustomEvent('liveAudioStatus', { 
        detail: { status } 
      });
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to emit status update event:', error);
    }
  };
  
  /**
   * Emits a session opened event
   */
  const emitSessionOpened = (): void => {
    try {
      const event = new CustomEvent('liveAudioSessionOpened');
      document.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to emit session opened event:', error);
    }
  };
  
  return {
    setupEventListeners,
    emitStatusUpdate,
    emitSessionOpened
  };
}
