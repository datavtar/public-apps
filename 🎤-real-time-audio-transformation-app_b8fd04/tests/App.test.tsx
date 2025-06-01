import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock MediaRecorder
class MockMediaRecorder {
  private stream: MediaStream;
  private options: MediaRecorderOptions;
  private data: BlobPart[] = [];
  private state: RecordingState = 'inactive';
  ondataavailable: ((event: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;

  constructor(stream: MediaStream, options: MediaRecorderOptions) {
    this.stream = stream;
    this.options = options;
  }

  start() {
    this.state = 'recording';
    setTimeout(() => {
      if (this.ondataavailable) {
        this.ondataavailable({ data: new Blob(['mock audio data'], { type: 'audio/webm' }) });
      }
    }, 100);
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  getState() {
    return this.state;
  }

  static isTypeSupported(type: string): boolean {
    return true;
  }
}

// Mock navigator.mediaDevices.getUserMedia
const mockGetUserMedia = jest.fn().mockImplementation(() =>
  Promise.resolve({
    getTracks: jest.fn().mockReturnValue([{
      stop: jest.fn()
    }])
  })
);

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  readyState: number = 0; // 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
  closeCode: number | null = null;
  closeReason: string | null = null;

  constructor(url: string) {
    // Simulate connection opening after a short delay
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) {
        this.onopen();
      }
    }, 50);
  }

  send(message: string) {
    // Simulate receiving a message after a short delay
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: JSON.stringify({serverContent: {modelTurn: {parts: [{text: 'Mock AI Response'}]}}}) });
      }
    }, 50);
  }

  close(code?: number, reason?: string) {
    this.readyState = 3; // CLOSED
    this.closeCode = code || 1000;
    this.closeReason = reason || 'Normal closure';

    if (this.onclose) {
      this.onclose({ code: this.closeCode, reason: this.closeReason });
    }
  }
}

(global as any).WebSocket = MockWebSocket;
(global as any).MediaRecorder = MockMediaRecorder;


beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  (window as any).MediaRecorder = MockMediaRecorder;
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: mockGetUserMedia,
    },
  });
});

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/AI Voice Chat/i);
  expect(linkElement).toBeInTheDocument();
});

test('shows API Key Required badge when API key is not set', () => {
  render(<App />);
  expect(screen.getByText(/API Key Required/i)).toBeInTheDocument();
});

test('opens settings modal when settings button is clicked', async () => {
  render(<App />);
  const settingsButton = screen.getByRole('button', { name: /Settings/i });
  fireEvent.click(settingsButton);
  await waitFor(() => {
    expect(screen.getByText(/Google API Key/i)).toBeInTheDocument();
  });
});

test('connects to WebSocket when API key is set and connect button is clicked', async () => {
  render(<App />);

  // Open settings and set API key
  const settingsButton = screen.getByRole('button', { name: /Settings/i });
  fireEvent.click(settingsButton);
  const apiKeyInput = screen.getByLabelText(/Google API Key/i) as HTMLInputElement;
  fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });

  // Close settings
  const closeButton = screen.getByRole('button', {name: 'Close'});
  fireEvent.click(closeButton);

  const connectButton = screen.getByRole('button', { name: /Connect/i });
  fireEvent.click(connectButton);
  await waitFor(() => {
    expect(screen.getByText(/Connected/i)).toBeInTheDocument();
  });
});

test('disconnects from WebSocket when disconnect button is clicked', async () => {
  render(<App />);

   // Open settings and set API key
  const settingsButton = screen.getByRole('button', { name: /Settings/i });
  fireEvent.click(settingsButton);
  const apiKeyInput = screen.getByLabelText(/Google API Key/i) as HTMLInputElement;
  fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });

  // Close settings
  const closeButton = screen.getByRole('button', {name: 'Close'});
  fireEvent.click(closeButton);

  const connectButton = screen.getByRole('button', { name: /Connect/i });
  fireEvent.click(connectButton);

  await waitFor(() => {
      expect(screen.getByText(/Connected/i)).toBeInTheDocument();
  });

  const disconnectButton = screen.getByRole('button', { name: /Disconnect/i });
  fireEvent.click(disconnectButton);

  await waitFor(() => {
    expect(screen.getByText(/Disconnected/i)).toBeInTheDocument();
  });
});

test('starts recording when record button is clicked and stops when clicked again', async () => {
  render(<App />);

  // Open settings and set API key
  const settingsButton = screen.getByRole('button', { name: /Settings/i });
  fireEvent.click(settingsButton);
  const apiKeyInput = screen.getByLabelText(/Google API Key/i) as HTMLInputElement;
  fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });

  // Close settings
  const closeButton = screen.getByRole('button', {name: 'Close'});
  fireEvent.click(closeButton);

  const recordButton = screen.getByRole('button', { name: /Start recording/i });
  fireEvent.click(recordButton);

  await waitFor(() => {
    expect(screen.getByText(/Recording.../i)).toBeInTheDocument();
  });

  const stopButton = screen.getByRole('button', { name: /Stop recording/i });
  fireEvent.click(stopButton);

  await waitFor(() => {
      expect(screen.getByText(/Processing with Gemini AI.../i)).toBeInTheDocument();
  });

   await waitFor(() => {
       expect(screen.getByText(/Click to speak or press Space/i)).toBeInTheDocument();
   }, {timeout: 3000})

});

test('displays error message when API key is missing and record button is clicked', async () => {
    render(<App />);
    const recordButton = screen.getByRole('button', { name: /Start recording/i });
    fireEvent.click(recordButton);
    await waitFor(() => {
        expect(screen.getByText(/Please set your Google API Key in settings first./i)).toBeInTheDocument();
    });
});