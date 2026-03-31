/**
 * Frequency-bin energy in a Hz range (matches AudioVisualizer useAudioAnalyzer semantics).
 */
export function getRangeVolumeFromAnalyser(
  analyser: AnalyserNode,
  dataArray: Uint8Array,
  sampleRate: number,
  minHz: number,
  maxHz: number,
): number {
  const binCount = analyser.frequencyBinCount;
  const nyquist = sampleRate / 2;

  const startIndex = Math.floor((minHz / nyquist) * binCount);
  const endIndex = Math.floor((maxHz / nyquist) * binCount);

  const start = Math.max(0, startIndex);
  const end = Math.min(binCount - 1, endIndex);

  let sum = 0;
  let count = 0;

  analyser.getByteFrequencyData(dataArray);

  for (let i = start; i <= end; i++) {
    sum += dataArray[i];
    count++;
  }

  if (count === 0) return 0;
  return (sum / count) / 255;
}
