/**
 * getUserMedia when `navigator.mediaDevices` is missing (non-HTTPS outside localhost,
 * some embedded WebViews, legacy browsers). Avoids reading `.getUserMedia` on undefined.
 */
export function getUserMediaCompat(constraints: MediaStreamConstraints): Promise<MediaStream> {
  if (typeof navigator === 'undefined') {
    return Promise.reject(new Error('Microphone is not available in this environment.'));
  }

  const md = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
  if (md) {
    return md(constraints);
  }

  const nav = navigator;
  type LegacyGUM = (
    c: MediaStreamConstraints,
    ok: (s: MediaStream) => void,
    err: (e: Error) => void,
  ) => void;
  const legacy = (
    (nav as { getUserMedia?: LegacyGUM }).getUserMedia?.bind(nav) ||
    (nav as { webkitGetUserMedia?: LegacyGUM }).webkitGetUserMedia?.bind(nav) ||
    (nav as { mozGetUserMedia?: LegacyGUM }).mozGetUserMedia?.bind(nav) ||
    (nav as { msGetUserMedia?: LegacyGUM }).msGetUserMedia?.bind(nav)
  );

  if (!legacy) {
    return Promise.reject(
      new Error(
        'Microphone requires a secure context (HTTPS or localhost). Open this app over HTTPS or use localhost.',
      ),
    );
  }

  return new Promise((resolve, reject) => {
    legacy(constraints, resolve, reject);
  });
}
