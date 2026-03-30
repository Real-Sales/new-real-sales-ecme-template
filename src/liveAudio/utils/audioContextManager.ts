/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Class for handling audio context and processing nodes
 */
export class AudioContextManager {
  audioContext: AudioContext | null = null;
  gainNode: GainNode | null = null;
  analyser: AnalyserNode | null = null;
  processor: ScriptProcessorNode | null = null;
  stream: MediaStream | null = null;
  source: MediaStreamAudioSourceNode | null = null;
  processorBufferSize = 4096;
  sampleRate = 16000;
  
  /**
   * Initialize audio context and processing nodes
   */
  initialize(): void {
    if (this.audioContext) return;
    
    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: this.sampleRate,
    });
    
    // Create gain node
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 1.0;
    
    // Create analyser node for visualizations
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    
    // Create processor node for handling audio data
    this.processor = this.audioContext.createScriptProcessor(
      this.processorBufferSize,
      1,
      1
    );
  }

  /**
   * Connect microphone stream to audio processing nodes
   * @param stream - Media stream from getUserMedia
   * @param processCallback - Callback for audio processing
   */
  connectMicrophone(stream: MediaStream, processCallback: (audioData: Float32Array) => void): void {
    if (!this.audioContext) this.initialize();
    
    this.stream = stream;
    this.source = this.audioContext!.createMediaStreamSource(stream);
    
    // Connect the audio processing chain
    this.source.connect(this.gainNode!);
    this.gainNode!.connect(this.analyser!);
    this.analyser!.connect(this.processor!);
    this.processor!.connect(this.audioContext!.destination);
    
    // Set up audio processing callback
    this.processor!.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      processCallback(inputData);
    };
  }

  /**
   * Disconnect and clean up all audio nodes
   */
  disconnect(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
    }
    
    if (this.gainNode) {
      this.gainNode.disconnect();
    }
    
    if (this.source) {
      this.source.disconnect();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Close and clean up audio context and all resources
   */
  close(): void {
    this.disconnect();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.audioContext = null;
    this.gainNode = null;
    this.analyser = null;
    this.processor = null;
    this.source = null;
  }

  /**
   * Get frequency data for visualizations
   * @returns Uint8Array containing frequency data
   */
  getFrequencyData(): Uint8Array | null {
    if (!this.analyser) return null;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  /**
   * Resume audio context if it's suspended
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Suspend audio context
   */
  async suspend(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'running') {
      await this.audioContext.suspend();
    }
  }
}
