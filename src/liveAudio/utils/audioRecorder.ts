/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for handling audio recording functionality
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private recordingStartTime = 0;
  
  /**
   * Initialize media recorder with audio stream
   * @param stream - Media stream from getUserMedia
   */
  initialize(stream: MediaStream): void {
    if (this.mediaRecorder) return;
    
    // Create MediaRecorder instance
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm',
    });
    
    // Set up event handlers
    this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
    this.mediaRecorder.onstop = this.handleRecordingStopped.bind(this);
    
    this.audioChunks = [];
  }

  /**
   * Start recording audio
   */
  startRecording(): void {
    if (!this.mediaRecorder || this.isRecording) return;
    
    this.audioChunks = [];
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.mediaRecorder.start(100); // Collect data every 100ms
  }

  /**
   * Stop recording audio
   * @returns Promise that resolves to the recorded audio as a Blob
   */
  stopRecording(): Promise<Blob> {
    if (!this.mediaRecorder || !this.isRecording) {
      return Promise.resolve(new Blob([]));
    }
    
    return new Promise((resolve) => {
      const onStop = () => {
        if (this.mediaRecorder) {
          this.mediaRecorder.onstop = this.handleRecordingStopped.bind(this);
        }
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      };
      
      if (this.mediaRecorder) {
        this.mediaRecorder.onstop = onStop;
        this.mediaRecorder.stop();
      }
      this.isRecording = false;
    });
  }

  /**
   * Handle data available event from MediaRecorder
   * @param event - BlobEvent from MediaRecorder
   */
  private handleDataAvailable(event: BlobEvent): void {
    if (event.data.size > 0) {
      this.audioChunks.push(event.data);
    }
  }

  /**
   * Handle recording stopped event
   */
  private handleRecordingStopped(): void {
    this.isRecording = false;
  }

  /**
   * Check if recording is currently active
   * @returns True if recording, false otherwise
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get the current recording duration in milliseconds
   * @returns Duration in milliseconds
   */
  getRecordingDuration(): number {
    if (!this.isRecording) return 0;
    return Date.now() - this.recordingStartTime;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }
}
