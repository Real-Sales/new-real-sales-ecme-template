/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Hook to manage microphone recording state and stream
 * @param inputAudioContext - The audio context for input
 * @returns Recording state and control functions
 */
export function useRecording(inputAudioContext: AudioContext) {
  let mediaStream: MediaStream | undefined;
  let sourceNode: MediaStreamAudioSourceNode | undefined;
  let scriptProcessorNode: ScriptProcessorNode | undefined;
  
  /**
   * Initializes microphone recording
   * @param onAudioData - Callback for audio data chunks
   * @returns Success status
   */
  const startRecording = async (
    onAudioData: (audioData: Float32Array) => void
  ): Promise<boolean> => {
    try {
      // Request microphone access
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      
      // Create audio processing pipeline
      sourceNode = inputAudioContext.createMediaStreamSource(mediaStream);
      scriptProcessorNode = inputAudioContext.createScriptProcessor(1024, 1, 1);
      
      // Connect nodes
      sourceNode.connect(scriptProcessorNode);
      scriptProcessorNode.connect(inputAudioContext.destination);
      
      // Process audio data
      scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Send audio data chunk to callback
        onAudioData(inputData);
      };
      
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return false;
    }
  };
  
  /**
   * Stops microphone recording and cleans up resources
   */
  const stopRecording = (): void => {
    // Disconnect audio nodes
    if (scriptProcessorNode && sourceNode) {
      sourceNode.disconnect(scriptProcessorNode);
      scriptProcessorNode.disconnect(inputAudioContext.destination);
    }
    
    // Clear references
    scriptProcessorNode = undefined;
    sourceNode = undefined;
    
    // Stop all tracks in the media stream
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = undefined;
    }
  };
  
  return {
    startRecording,
    stopRecording
  };
}
