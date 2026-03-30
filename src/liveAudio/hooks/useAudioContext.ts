/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Hook to manage audio contexts for input and output
 * @returns Audio context objects and nodes
 */
export function useAudioContext() {
  // Create audio contexts with appropriate sample rates
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
    sampleRate: 16000 
  });
  
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ 
    sampleRate: 24000 
  });
  
  // Create gain nodes for processing
  const inputNode = inputAudioContext.createGain();
  const outputNode = outputAudioContext.createGain();
  
  // Connect output node to destination (speakers)
  outputNode.connect(outputAudioContext.destination);
  
  // Function to reset the audio time
  const resetAudioTime = () => {
    return outputAudioContext.currentTime;
  };

  // Function to resume audio contexts (needed for user interaction)
  const resumeAudioContexts = async () => {
    await inputAudioContext.resume();
    await outputAudioContext.resume();
  };

  return {
    inputAudioContext,
    outputAudioContext,
    inputNode,
    outputNode,
    resetAudioTime,
    resumeAudioContexts
  };
}
