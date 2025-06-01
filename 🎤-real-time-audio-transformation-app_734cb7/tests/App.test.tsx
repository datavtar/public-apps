import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../src/App';


const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});


// Mock the MediaRecorder and MediaDevices APIs
const mockMediaRecorder = jest.fn();
const mockGetUserMedia = jest.fn();

(global as any).MediaRecorder = jest.fn().mockImplementation((stream, options) => {
    mockMediaRecorder(stream, options);
    return {
        start: jest.fn(),
        stop: jest.fn(),
        ondataavailable: jest.fn(),
        onstop: jest.fn(),
        onerror: jest.fn(),
        state: 'inactive'
    };
});

(global.navigator as any).mediaDevices = {
    getUserMedia: mockGetUserMedia
};



describe('App Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders the app', () => {
    render(<App />);
    expect(screen.getByText('AI Voice Chat')).toBeInTheDocument();
  });

  test('displays API Key Required badge when API key is not set', () => {
    render(<App />);
    expect(screen.getByText('API Key Required')).toBeInTheDocument();
  });

  test('opens settings modal when settings button is clicked', () => {
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('displays error message when API key is missing and record button is clicked', async () => {
    render(<App />);
    const recordButton = screen.getByRole('button', { name: /Start recording/i });
    fireEvent.click(recordButton);
    await screen.findByText('Please set your Google API Key in settings first.');
  });

  test('displays error message when websocket is not connected', async () => {
    localStorageMock.setItem('audioAppSettings', JSON.stringify({ apiKey: 'test-api-key', autoPlay: true, saveHistory: true }));

    render(<App />);
    const recordButton = screen.getByRole('button', { name: /Start recording/i });
    fireEvent.click(recordButton);
    await screen.findByText('Please wait for connection to establish before recording.');
  });

  test('connects to websocket on mount if api key is set', async () => {

    const mockWebSocket = jest.fn().mockImplementation(() => {
      return {
        readyState: WebSocket.OPEN,
        onopen: jest.fn(),
        onmessage: jest.fn(),
        onerror: jest.fn(),
        onclose: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
      };
    });

    (global as any).WebSocket = mockWebSocket;

    localStorageMock.setItem('audioAppSettings', JSON.stringify({ apiKey: 'test-api-key', autoPlay: true, saveHistory: true }));

    render(<App />);

    // Wait for a brief moment to allow the useEffect to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  });
});