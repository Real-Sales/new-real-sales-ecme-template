/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Handles event listeners for external components
 */
export class EventHandler {
  // Event handler callbacks
  private onImageHandler: (imageData: string, mimeType: string, text: string) => Promise<void>;
  private onImageWithAudioHandler: (
    imageData: string, 
    imageMimeType: string, 
    audioData: string, 
    audioMimeType: string, 
    audioSampleRate: number,
    usePreRecorded: boolean,
    textFallback: string
  ) => Promise<void>;
  private onTextHandler: (text: string) => Promise<void>;
  private onStartMicHandler: () => Promise<void>;
  private onStopMicHandler: () => void;

  /**
   * Creates a new event handler
   * @param handlers - Object containing event handler callbacks
   */
  constructor(handlers: {
    onImage: (imageData: string, mimeType: string, text: string) => Promise<void>;
    onImageWithAudio: (
      imageData: string, 
      imageMimeType: string, 
      audioData: string, 
      audioMimeType: string, 
      audioSampleRate: number,
      usePreRecorded: boolean,
      textFallback: string
    ) => Promise<void>;
    onText: (text: string) => Promise<void>;
    onStartMic: () => Promise<void>;
    onStopMic: () => void;
  }) {
    this.onImageHandler = handlers.onImage;
    this.onImageWithAudioHandler = handlers.onImageWithAudio;
    this.onTextHandler = handlers.onText;
    this.onStartMicHandler = handlers.onStartMic;
    this.onStopMicHandler = handlers.onStopMic;
  }

  /**
   * Sets up all event listeners
   */
  setupEventListeners(): void {
    // Image event
    document.addEventListener('sendImage', this.handleImageEvent);
    
    // Image with audio event
    document.addEventListener('sendImageWithAudio', this.handleImageWithAudioEvent);
    
    // Text events
    document.addEventListener('sendTestText', this.handleTestTextEvent);
    document.addEventListener('sendLiveText', this.handleLiveTextEvent);
    
    // Microphone control events
    document.addEventListener('liveAudioStartMic', this.handleStartMicEvent);
    document.addEventListener('liveAudioStopMic', this.handleStopMicEvent);
  }

  /**
   * Removes all event listeners
   */
  removeEventListeners(): void {
    document.removeEventListener('sendImage', this.handleImageEvent);
    document.removeEventListener('sendImageWithAudio', this.handleImageWithAudioEvent);
    document.removeEventListener('sendTestText', this.handleTestTextEvent);
    document.removeEventListener('sendLiveText', this.handleLiveTextEvent);
    document.removeEventListener('liveAudioStartMic', this.handleStartMicEvent);
    document.removeEventListener('liveAudioStopMic', this.handleStopMicEvent);
  }

  /**
   * Handles image events
   */
  private handleImageEvent = (event: any): void => {
    const { imageData, mimeType, text } = event.detail;
    this.onImageHandler(
      imageData, 
      mimeType, 
      text || 'explain what is in this image'
    );
  };

  /**
   * Handles image with audio events
   */
  private handleImageWithAudioEvent = (event: any): void => {
    const { 
      imageData, 
      imageMimeType, 
      audioData, 
      audioMimeType, 
      audioSampleRate,
      usePreRecorded,
      textFallback 
    } = event.detail;
    
    this.onImageWithAudioHandler(
      imageData, 
      imageMimeType, 
      audioData, 
      audioMimeType, 
      audioSampleRate || 16000,
      usePreRecorded || false,
      textFallback || 'explain what is in this image'
    );
  };

  /**
   * Handles test text events
   */
  private handleTestTextEvent = (event: any): void => {
    const { text } = event.detail;
    this.onTextHandler(text || 'Hello, can you hear me?');
  };

  /**
   * Handles live text events
   */
  private handleLiveTextEvent = (event: any): void => {
    const { text } = event.detail || {};
    if (text && typeof text === 'string') {
      this.onTextHandler(text);
    }
  };

  /**
   * Handles start microphone events
   */
  private handleStartMicEvent = async (): Promise<void> => {
    await this.onStartMicHandler();
  };

  /**
   * Handles stop microphone events
   */
  private handleStopMicEvent = (): void => {
    this.onStopMicHandler();
  };
}
