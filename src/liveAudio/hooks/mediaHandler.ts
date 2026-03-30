/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Modality, Session } from '@google/genai';
import { createBlob } from '../utils';

/**
 * Utility functions for handling media content in Gemini API
 */
export class MediaHandler {
  /**
   * Sends a text message to the Gemini session
   * @param session - Active Gemini session
   * @param text - Text message to send
   */
  static async sendTextMessage(session: Session, text: string): Promise<void> {
    try {
      await session.sendTurn([
        {
          modality: Modality.TEXT,
          text,
        },
      ]);
      await session.commitTurn();
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }
  
  /**
   * Sends an image with text to the Gemini session
   * @param session - Active Gemini session
   * @param imageData - Base64 encoded image data
   * @param mimeType - MIME type of the image
   * @param text - Text prompt to accompany the image
   */
  static async sendImageWithText(
    session: Session, 
    imageData: string, 
    mimeType: string = 'image/jpeg', 
    text: string = 'explain'
  ): Promise<void> {
    try {
      await session.sendTurn([
        {
          modality: Modality.IMAGE,
          image: {
            data: imageData,
            mimeType,
          }
        },
        {
          modality: Modality.TEXT,
          text,
        },
      ]);
      await session.commitTurn();
    } catch (error) {
      console.error('Error sending image with text:', error);
      throw error;
    }
  }
  
  /**
   * Sends audio data to the Gemini session in chunks
   * @param session - Active Gemini session
   * @param audioData - Audio data as Uint8Array
   */
  static async sendAudioInChunks(session: Session, audioData: Uint8Array): Promise<void> {
    const chunkSize = 2048; // Chunk size for 16-bit audio (1024 samples * 2 bytes)
    
    try {
      for (let i = 0; i < audioData.length; i += chunkSize) {
        const chunk = audioData.slice(i, i + chunkSize);
        const float32Data = new Float32Array(chunk.length / 2);
        const int16View = new Int16Array(chunk.buffer);
        
        for (let j = 0; j < int16View.length; j++) {
          float32Data[j] = int16View[j] / 32768.0;
        }
        
        const blob = createBlob(float32Data);
        
        await session.sendTurn([
          {
            modality: Modality.AUDIO,
            audio: blob,
          },
        ]);
      }
      
      // Commit the turn after all chunks are sent
      await session.commitTurn();
    } catch (error) {
      console.error('Error sending audio chunks:', error);
      throw error;
    }
  }
  
  /**
   * Converts base64 audio data to Uint8Array
   * @param audioData - Base64 encoded audio data
   * @returns Decoded audio data as Uint8Array
   */
  static base64AudioToUint8Array(audioData: string): Uint8Array {
    const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    return binaryAudio;
  }
}
