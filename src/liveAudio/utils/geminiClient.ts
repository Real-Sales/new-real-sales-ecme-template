/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for handling Gemini API communication
 */
export class GeminiClient {
  private apiKey: string;
  private model: string;
  private sessionId: string | null = null;
  private abortController: AbortController | null = null;
  
  /**
   * Create GeminiClient instance
   * @param apiKey - Gemini API key
   * @param model - Gemini model name to use
   */
  constructor(apiKey: string, model: string = 'gemini-2.5-flash-preview-native-audio-dialog') {
    this.apiKey = apiKey;
    this.model = model;
  }

  /**
   * Start a new Gemini session
   * @returns The session ID
   */
  async startSession(): Promise<string> {
    // Cancel any existing request
    if (this.abortController) {
      this.abortController.abort();
    }
    
    // Generate a random session ID
    this.sessionId = Math.random().toString(36).substring(2, 15);
    return this.sessionId;
  }

  /**
   * End the current Gemini session
   */
  endSession(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.sessionId = null;
  }

  /**
   * Check if there's an active session
   * @returns True if session is active, false otherwise
   */
  hasActiveSession(): boolean {
    return this.sessionId !== null;
  }

  /**
   * Get the current session ID
   * @returns Current session ID or null
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Create API endpoint URL
   * @param method - API method to call
   * @returns Complete URL
   */
  private createUrl(method: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:${method}?key=${this.apiKey}`;
  }

  /**
   * Send audio data to Gemini
   * @param audioBlob - Audio data as Blob
   * @param metadata - Optional metadata to include
   * @returns Promise with Gemini response
   */
  async sendAudio(audioBlob: Blob, metadata?: Record<string, any>): Promise<any> {
    if (!this.sessionId) {
      throw new Error('No active session. Call startSession first.');
    }
    
    try {
      // Create new abort controller for this request
      this.abortController = new AbortController();
      
      // Prepare form data with audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      
      // Add metadata if provided
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      // Make the API request
      const response = await fetch(this.createUrl('streamGenerateContent'), {
        method: 'POST',
        body: formData,
        signal: this.abortController.signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Request was aborted, this is expected during session termination
        return null;
      }
      throw error;
    }
  }

  /**
   * Send text message to Gemini
   * @param text - Text message to send
   * @returns Promise with Gemini response
   */
  async sendText(text: string): Promise<any> {
    if (!this.sessionId) {
      throw new Error('No active session. Call startSession first.');
    }
    
    try {
      // Create new abort controller for this request
      this.abortController = new AbortController();
      
      // Prepare request data
      const requestData = {
        contents: [
          {
            role: 'user',
            parts: [{ text }]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40
        }
      };
      
      // Make the API request
      const response = await fetch(this.createUrl('generateContent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: this.abortController.signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Request was aborted, this is expected during session termination
        return null;
      }
      throw error;
    }
  }

  /**
   * Send image to Gemini
   * @param imageBlob - Image data as Blob
   * @param metadata - Optional metadata to include
   * @returns Promise with Gemini response
   */
  async sendImage(imageBlob: Blob, metadata?: Record<string, any>): Promise<any> {
    if (!this.sessionId) {
      throw new Error('No active session. Call startSession first.');
    }
    
    try {
      // Create new abort controller for this request
      this.abortController = new AbortController();
      
      // Convert blob to base64
      const base64Image = await this.blobToBase64(imageBlob);
      
      // Prepare request data
      const requestData = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: imageBlob.type,
                  data: base64Image.split(',')[1] // Remove data URL prefix
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          topP: 0.8,
          topK: 40
        }
      };
      
      // Add metadata if provided
      if (metadata) {
        requestData.contents[0].parts.push({
          text: JSON.stringify(metadata)
        } as any);
      }
      
      // Make the API request
      const response = await fetch(this.createUrl('generateContent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: this.abortController.signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Request was aborted, this is expected during session termination
        return null;
      }
      throw error;
    }
  }

  /**
   * Convert Blob to base64 string
   * @param blob - Blob to convert
   * @returns Promise with base64 string
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
