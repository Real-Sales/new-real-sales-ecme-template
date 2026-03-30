/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Functions for converting and manipulating audio data
 */
export class AudioUtils {
  /**
   * Converts base64 audio data to Uint8Array
   * @param audioData - Base64 encoded audio data
   * @returns Decoded audio data as Uint8Array
   */
  static base64ToUint8Array(audioData: string): Uint8Array {
    const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    return binaryAudio;
  }

  /**
   * Converts Float32Array audio data to Int16Array
   * @param float32Data - Float32Array audio data
   * @returns Converted Int16Array audio data
   */
  static float32ToInt16(float32Data: Float32Array): Int16Array {
    const int16Data = new Int16Array(float32Data.length);
    for (let i = 0; i < float32Data.length; i++) {
      // Convert from -1.0...1.0 to -32768...32767
      int16Data[i] = Math.max(-32768, Math.min(32767, float32Data[i] * 32768));
    }
    return int16Data;
  }

  /**
   * Converts Int16Array audio data to Float32Array
   * @param int16Data - Int16Array audio data
   * @returns Converted Float32Array audio data
   */
  static int16ToFloat32(int16Data: Int16Array): Float32Array {
    const float32Data = new Float32Array(int16Data.length);
    for (let i = 0; i < int16Data.length; i++) {
      // Convert from -32768...32767 to -1.0...1.0
      float32Data[i] = int16Data[i] / 32768.0;
    }
    return float32Data;
  }
}
