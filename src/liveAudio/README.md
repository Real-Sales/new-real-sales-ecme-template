# GdmLiveAudio with Token Validation

This component now includes automatic token validation to ensure the session remains active and secure.

## Features

- **Automatic Token Validation**: Checks token status every 5 minutes
- **Session Auto-Close**: Automatically closes session if token becomes inactive
- **Event-Driven**: Dispatches events for external components to react to session changes

## Usage

### Basic Setup

```typescript
import { GdmLiveAudio } from './GdmLiveAudio';
import { apiIsTokenActive } from '../../services/UsageService';

// The component will automatically validate the VITE_GEMINI_API_KEY
// and close the session if it becomes inactive

// You can also manually check token status:
const isActive = await apiIsTokenActive('your-token-here');
```

### Sending Messages with Token Validation

```typescript
// Send text message with token validation
document.dispatchEvent(new CustomEvent('sendLiveText', {
  detail: {
    text: 'Hello, how are you?',
    usedToken: 'your-api-token-here' // Optional: will use env var if not provided
  }
}));

// Send image with token validation
document.dispatchEvent(new CustomEvent('sendImage', {
  detail: {
    imageData: 'base64-image-data',
    mimeType: 'image/jpeg',
    text: 'Explain this image',
    usedToken: 'your-api-token-here' // Optional: will use env var if not provided
  }
}));

// Send combined image and audio with token validation
document.dispatchEvent(new CustomEvent('sendImageWithAudio', {
  detail: {
    imageData: 'base64-image-data',
    imageMimeType: 'image/jpeg',
    audioData: 'base64-audio-data',
    audioMimeType: 'audio/wav',
    audioSampleRate: 16000,
    usePreRecorded: true,
    textFallback: 'Explain this image and audio',
    usedToken: 'your-api-token-here' // Optional: will use env var if not provided
  }
}));
```

### Listening to Session Events

```typescript
// Listen for session opened
window.addEventListener('liveAudioSessionOpened', () => {
  console.log('Live audio session opened');
});

// Listen for session closed
window.addEventListener('liveAudioSessionClosed', (event) => {
  const { reason } = event.detail;
  console.log('Live audio session closed:', reason);
  
  if (reason === 'token_inactive') {
    // Handle inactive token - redirect to login, show error, etc.
    console.log('Token is inactive, please refresh or login again');
  }
});

// Listen for playback state changes
window.addEventListener('liveAudioPlayback', (event) => {
  const { state } = event.detail;
  console.log('Playback state:', state); // 'playing', 'idle', 'clearing'
});

// Listen for status updates
window.addEventListener('liveAudioStatus', (event) => {
  const { status } = event.detail;
  console.log('Status:', status);
});
```

### External Controls

```typescript
// Start microphone from external component
document.dispatchEvent(new CustomEvent('liveAudioStartMic'));

// Stop microphone from external component
document.dispatchEvent(new CustomEvent('liveAudioStopMic'));
```

## API Functions

The service provides both function-based and class-based APIs:

### Function-based API (Recommended)
```typescript
import { apiGetUsageStatus, apiIsTokenActive } from '../../services/UsageService';

// Get detailed usage status
const status = await apiGetUsageStatus<UsageStatusResponse>('your-token-here');

// Check if token is active (returns boolean)
const isActive = await apiIsTokenActive('your-token-here');
```

### Class-based API (Legacy)
```typescript
import UsageService from '../../services/UsageService';

const usageService = UsageService;
const isActive = await usageService.isTokenActive('your-token-here');
```

## API Endpoint

The service expects a usage API endpoint at `/usage/status/{usedToken}` that returns:

```json
{
  "isActive": true,
  "message": "Token is valid",
  "remainingTokens": 1000,
  "totalTokens": 5000,
  "lastUsed": "2024-01-01T00:00:00Z"
}
```

## Environment Variables

Set `VITE_GEMINI_API_KEY` in your `.env` file:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

## Token Validation Behavior

1. **On Session Open**: Starts periodic validation (every 5 minutes)
2. **Before Each Request**: Validates token if provided in event detail
3. **On Validation Failure**: Automatically closes session and dispatches events
4. **On Session Close**: Stops periodic validation

## Security Features

- Automatic session closure on inactive tokens
- Periodic token validation
- Event-driven architecture for external monitoring
- Graceful error handling and cleanup
