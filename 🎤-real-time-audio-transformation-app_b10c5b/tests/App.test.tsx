import '@testing-library/jest-dom'
import * as React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../src/App'


const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });


// Mock the browser APIs used for audio recording
const mockGetUserMedia = jest.fn();
const mockMediaRecorderStart = jest.fn();
const mockMediaRecorderStop = jest.fn();
const mockMediaRecorderAddEventListener = jest.fn();

let mockStream: MediaStream;
let mockMediaRecorder: MediaRecorder;


beforeEach(() => {
  mockStream = { getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]) } as any;
  mockMediaRecorder = { start: mockMediaRecorderStart, stop: mockMediaRecorderStop, addEventListener: mockMediaRecorderAddEventListener, state: 'inactive' } as any;

  mockGetUserMedia.mockResolvedValue(mockStream);

  (global.navigator.mediaDevices as any) = {
    getUserMedia: mockGetUserMedia,
  };

  (global as any).MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);

  // Clear localStorage before each test
  localStorage.clear();

  // Reset mocks
  mockGetUserMedia.mockClear();
  mockMediaRecorderStart.mockClear();
  mockMediaRecorderStop.mockClear();
  mockMediaRecorderAddEventListener.mockClear();
});


ddescribe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText(/AI Voice Chat/i)).toBeInTheDocument();
  });

  test('displays API key required badge when API key is not set', () => {
    render(<App />);
    expect(screen.getByText(/API Key Required/i)).toBeInTheDocument();
  });

  test('opens settings when settings button is clicked', async () => {
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);
    await waitFor(() => {
        expect(screen.getByText(/Google API Key/i)).toBeVisible();
    });
  });

  test('shows error message when trying to record without API key', async () => {
    render(<App />);
    const recordButton = screen.getByRole('button', { name: /Start recording/i });
    fireEvent.mouseDown(recordButton);
    await waitFor(() => {
        expect(screen.getByText(/Please set your Google API Key in settings first./i)).toBeVisible();
    });
    fireEvent.mouseUp(recordButton);
  });

  test('can start recording when API key is set', async () => {
    render(<App />);

    // Open settings and set API key
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);

    const apiKeyInput = screen.getByLabelText(/Google API Key/i) as HTMLInputElement;
    fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });

    // Wait for the API key to be saved and the settings to close
    await waitFor(() => {
        fireEvent.click(screen.getByText(/Close/i));
    })

    // Start recording
    const recordButton = screen.getByRole('button', { name: /Start recording/i });
    fireEvent.mouseDown(recordButton);

    // Assert that getUserMedia was called
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    // Clean up after the test
    fireEvent.mouseUp(recordButton);
  });

  test('shows processing message after recording', async () => {
      render(<App />);

      // Open settings and set API key
      const settingsButton = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsButton);

      const apiKeyInput = screen.getByLabelText(/Google API Key/i) as HTMLInputElement;
      fireEvent.change(apiKeyInput, { target: { value: 'test-api-key' } });

      // Wait for the API key to be saved and the settings to close
      await waitFor(() => {
          fireEvent.click(screen.getByText(/Close/i));
      })

      const recordButton = screen.getByRole('button', { name: /Start recording/i });
      fireEvent.mouseDown(recordButton);

      await waitFor(() => {
          fireEvent.mouseUp(recordButton);
      })

      fireEvent.mouseUp(recordButton);

      await waitFor(() => {
          expect(screen.getByText(/Processing with Gemini AI.../i)).toBeVisible();
      })

  });

  test('displays conversation history when messages exist', async () => {
    // Mock localStorage to include a saved message
    const mockMessages = [
      {
        id: '1',
        type: 'user',
        text: 'Test message',
        timestamp: new Date().toISOString(),
        duration: 5
      },
    ];
    localStorage.setItem('audioAppMessages', JSON.stringify(mockMessages));

    render(<App />);

    // Wait for the message to render
    await waitFor(() => {
      expect(screen.getByText(/Test message/i)).toBeInTheDocument();
    });
  });
});
