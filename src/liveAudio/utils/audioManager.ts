/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Manager for audio recording and playback
 */
export class AudioManager {
  private inputAudioContext: AudioContext;
  private outputAudioContext: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private mediaStream?: MediaStream;
  private sourceNode?: MediaStreamAudioSourceNode;
  private scriptProcessorNode?: ScriptProcessorNode;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private nextStartTime = 0;
  
  /**
   * Creates a new audio manager
   * @param inputSampleRate - Sample rate for input audio (mic)
   * @param outputSampleRate - Sample rate for output audio (playback)
   */
  constructor(inputSampleRate = 16000, outputSampleRate = 24000) {
    // Create audio contexts
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
      sampleRate: inputSampleRate 
    });
    
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
      sampleRate: outputSampleRate 
    });
    
    // Create gain nodes
    this.inputNode = this.inputAudioContext.createGain();
    this.outputNode = this.outputAudioContext.createGain();
    
    // Connect output to speakers
    this.outputNode.connect(this.outputAudioContext.destination);
    
    // Initialize playback time
    this.nextStartTime = this.outputAudioContext.currentTime;
  }
  
  /**
   * Starts recording from the microphone
   * @param onAudioData - Callback function for audio data
   * @returns Whether recording started successfully
   */
  async startRecording(onAudioData: (audioData: Float32Array) => void): Promise<boolean> {
    try {
      await this.inputAudioContext.resume();
      await this.outputAudioContext.resume();
      
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      
      // Create audio processing pipeline
      this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(1024, 1, 1);
      
      // Connect nodes
      this.sourceNode.connect(this.inputNode);
      this.sourceNode.connect(this.scriptProcessorNode);
      this.scriptProcessorNode.connect(this.inputAudioContext.destination);
      
      // Process audio data
      this.scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Call the callback with audio data
        onAudioData(inputData);
      };
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      return false;
    }
  }
  
  /**
   * Stops recording from the microphone
   */
  stopRecording(): void {
    // Disconnect audio nodes
    if (this.scriptProcessorNode && this.sourceNode) {
      try {
        this.sourceNode.disconnect(this.scriptProcessorNode);
        this.scriptProcessorNode.disconnect(this.inputAudioContext.destination);
        this.sourceNode.disconnect(this.inputNode);
      } catch (e) {
        console.error('Error disconnecting audio nodes:', e);
      }
    }
    
    this.scriptProcessorNode = undefined;
    this.sourceNode = undefined;
    
    // Stop all tracks in the media stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = undefined;
    }
  }
  
  /**
   * Plays an audio buffer
   * @param audioBuffer - The audio buffer to play
   */
  playAudioBuffer(audioBuffer: AudioBuffer): void {
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputNode);
    
    // Keep track of sources for cleanup
    this.sources.add(source);
    
    // Start playing at the next available time
    source.start(this.nextStartTime);
    
    // Update the next start time
    this.nextStartTime = Math.max(
      this.outputAudioContext.currentTime,
      this.nextStartTime + audioBuffer.duration
    );
    
    // Remove from tracked sources when done
    source.onended = () => {
      this.sources.delete(source);
    };
  }
  
  /**
   * Stops all playing audio
   */
  stopAllAudio(): void {
    this.sources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors from already stopped sources
      }
    });
    this.sources.clear();
  }
  
  /**
   * Gets the input audio context
   */
  getInputAudioContext(): AudioContext {
    return this.inputAudioContext;
  }
  
  /**
   * Gets the output audio context
   */
  getOutputAudioContext(): AudioContext {
    return this.outputAudioContext;
  }
  
  /**
   * Gets the input gain node
   */
  getInputNode(): GainNode {
    return this.inputNode;
  }
  
  /**
   * Gets the output gain node
   */
  getOutputNode(): GainNode {
    return this.outputNode;
  }
  
  /**
   * Resets the audio contexts and nodes
   */
  reset(): void {
    this.stopRecording();
    this.stopAllAudio();
    this.nextStartTime = this.outputAudioContext.currentTime;
  }
}
