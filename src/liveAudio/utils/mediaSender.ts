/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Modality, Session } from '@google/genai';
import { createBlob } from '../utils';

/**
 * Handles sending different types of media to Gemini
 */
export class MediaSender {
  private session: Session;
  
  /**
   * Creates a new media sender
   * @param session - The Gemini session to use
   */
  constructor(session: Session) {
    this.session = session;
  }
  
  /**
   * Updates the session reference
   * @param session - The new session to use
   */
  updateSession(session: Session): void {
    this.session = session;
  }
  
  /**
   * Sends a text message to Gemini
   * @param text - The text to send
   */
  async sendText(text: string): Promise<void> {
    await this.session.sendMultiModalContent([
      {
        modality: Modality.TEXT,
        text,
      },
    ]);
    
    await this.session.commitTurn();
  }
  
  /**
   * Sends an image with text to Gemini
   * @param imageData - Base64 encoded image data
   * @param mimeType - MIME type of the image
   * @param text - Text to accompany the image
   */
  async sendImageWithText(imageData: string, mimeType: string = 'image/jpeg', text: string = 'explain'): Promise<void> {
    await this.session.sendMultiModalContent([
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
    
    await this.session.commitTurn();
  }
  
  /**
   * Sends audio data in chunks to Gemini
   * @param audioData - The audio data to send
   */
  async sendAudioChunks(audioData: Uint8Array): Promise<void> {
    const chunkSize = 2048; // Chunk size for 16-bit audio (1024 samples * 2 bytes)
    
    for (let i = 0; i < audioData.length; i += chunkSize) {
      const chunk = audioData.slice(i, i + chunkSize);
      const float32Data = new Float32Array(chunk.length / 2);
      const int16View = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.length / 2);
      
      for (let j = 0; j < int16View.length; j++) {
        float32Data[j] = int16View[j] / 32768.0;
      }
      
      const blob = createBlob(float32Data);
      
      try {
        await this.session.sendMultiModalContent([
          {
            modality: Modality.AUDIO,
            audio: blob,
          },
        ]);
      } catch (error) {
        console.error('Error sending audio chunk:', error);
        throw error;
      }
    }
    
    await this.session.commitTurn();
  }
  
  /**
   * Sends a single audio chunk to Gemini (useful for streaming)
   * @param audioData - Float32Array audio data
   */
  async sendAudioChunk(audioData: Float32Array): Promise<void> {
    const blob = createBlob(audioData);
    
    await this.session.sendMultiModalContent([
      {
        modality: Modality.AUDIO,
        audio: blob,
      },
    ]);
  }
  
  /**
   * Commits the current turn (useful after sending multiple audio chunks)
   */
  async commitTurn(): Promise<void> {
    await this.session.commitTurn();
  }
}
