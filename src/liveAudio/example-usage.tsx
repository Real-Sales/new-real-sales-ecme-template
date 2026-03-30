import React, { useEffect, useState } from 'react';

interface ExampleUsageProps {
  apiToken: string;
}

const ExampleUsage: React.FC<ExampleUsageProps> = ({ apiToken }) => {
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'opened' | 'closed'>('idle');
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'clearing'>('idle');
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Listen for session events
    const handleSessionOpened = () => {
      setSessionStatus('opened');
      setError('');
    };

    const handleSessionClosed = (event: CustomEvent) => {
      const { reason } = event.detail;
      setSessionStatus('closed');
      
      if (reason === 'token_inactive') {
        setError('Session closed: Token is inactive. Please refresh or login again.');
        // You could redirect to login page here
      } else {
        setError('Session closed: ' + reason);
      }
    };

    const handlePlaybackState = (event: CustomEvent) => {
      const { state } = event.detail;
      setPlaybackState(state);
    };

    const handleStatusUpdate = (event: CustomEvent) => {
      const { status: newStatus } = event.detail;
      setStatus(newStatus);
    };

    // Add event listeners
    window.addEventListener('liveAudioSessionOpened', handleSessionOpened);
    window.addEventListener('liveAudioSessionClosed', handleSessionClosed as EventListener);
    window.addEventListener('liveAudioPlayback', handlePlaybackState as EventListener);
    window.addEventListener('liveAudioStatus', handleStatusUpdate as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('liveAudioSessionOpened', handleSessionOpened);
      window.removeEventListener('liveAudioSessionClosed', handleSessionClosed as EventListener);
      window.removeEventListener('liveAudioPlayback', handlePlaybackState as EventListener);
      window.removeEventListener('liveAudioStatus', handleStatusUpdate as EventListener);
    };
  }, []);

  const sendTextMessage = () => {
    const text = prompt('Enter your message:');
    if (text) {
      document.dispatchEvent(new CustomEvent('sendLiveText', {
        detail: {
          text,
          usedToken: apiToken
        }
      }));
    }
  };

  const sendImage = () => {
    // Simulate image data (in real app, you'd get this from file input or camera)
    const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...'; // truncated
    
    document.dispatchEvent(new CustomEvent('sendImage', {
      detail: {
        imageData: mockImageData,
        mimeType: 'image/jpeg',
        text: 'Explain what you see in this image',
        usedToken: apiToken
      }
    }));
  };

  const startMicrophone = () => {
    document.dispatchEvent(new CustomEvent('liveAudioStartMic'));
  };

  const stopMicrophone = () => {
    document.dispatchEvent(new CustomEvent('liveAudioStopMic'));
  };

  return (
    <div className="example-usage">
      <h2>GdmLiveAudio Example Usage</h2>
      
      {/* Status Display */}
      <div className="status-section">
        <h3>Session Status</h3>
        <p>Status: <span className={`status-${sessionStatus}`}>{sessionStatus}</span></p>
        <p>Playback: <span className={`playback-${playbackState}`}>{playbackState}</span></p>
        {status && <p>Message: {status}</p>}
        {error && <p className="error">Error: {error}</p>}
      </div>

      {/* Controls */}
      <div className="controls-section">
        <h3>Controls</h3>
        <button onClick={sendTextMessage} disabled={sessionStatus !== 'opened'}>
          Send Text Message
        </button>
        <button onClick={sendImage} disabled={sessionStatus !== 'opened'}>
          Send Image
        </button>
        <button onClick={startMicrophone} disabled={sessionStatus !== 'opened'}>
          Start Microphone
        </button>
        <button onClick={stopMicrophone} disabled={sessionStatus !== 'opened'}>
          Stop Microphone
        </button>
      </div>

      {/* Live Audio Component */}
      <div className="live-audio-section">
        <h3>Live Audio Component</h3>
        <gdm-live-audio></gdm-live-audio>
      </div>

      {/* Instructions */}
      <div className="instructions">
        <h3>How to Use</h3>
        <ol>
          <li>Wait for the session to open (status will show "opened")</li>
          <li>Use the controls above to interact with the AI</li>
          <li>The component will automatically validate your token every 5 minutes</li>
          <li>If the token becomes inactive, the session will automatically close</li>
          <li>Listen for events to handle session state changes</li>
        </ol>
      </div>

      <style jsx>{`
        .example-usage {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .status-section, .controls-section, .live-audio-section, .instructions {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .controls-section button {
          margin: 5px;
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          background: #007bff;
          color: white;
          cursor: pointer;
        }
        
        .controls-section button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .controls-section button:hover:not(:disabled) {
          background: #0056b3;
        }
        
        .status-opened { color: #28a745; font-weight: bold; }
        .status-closed { color: #dc3545; font-weight: bold; }
        .status-idle { color: #6c757d; font-weight: bold; }
        
        .playback-playing { color: #007bff; font-weight: bold; }
        .playback-idle { color: #6c757d; font-weight: bold; }
        .playback-clearing { color: #ffc107; font-weight: bold; }
        
        .error {
          color: #dc3545;
          background: #f8d7da;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #f5c6cb;
        }
        
        .instructions ol {
          padding-left: 20px;
        }
        
        .instructions li {
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default ExampleUsage;

