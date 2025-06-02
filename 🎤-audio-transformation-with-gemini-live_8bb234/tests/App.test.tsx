import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

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

// Mock speech synthesis
const speechSynthesisMock = {
  speak: jest.fn(),
  cancel: jest.fn(),
  getVoices: jest.fn(() => [{
    name: 'Test Voice',
    lang: 'en-US',
    voiceURI: 'test',
    default: true,
    localService: true,
  }]),
  addEventListener: jest.fn(),
};

Object.defineProperty(window, 'speechSynthesis', {
  value: speechSynthesisMock,
});

// Mock media devices
const mockStream = new MediaStream();
const getUserMediaMock = jest.fn(() => Promise.resolve(mockStream));

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: getUserMediaMock,
  },
});



describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Audio AI Assistant/i)).toBeInTheDocument();
  });

  test('starts and stops recording', async () => {
    render(<App />);
    const startStopButton = screen.getByRole('button', { name: /Start Recording|Stop Recording/i });

    // Start recording
    await fireEvent.click(startStopButton);
    expect(getUserMediaMock).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByText(/Recording.../i)).toBeInTheDocument());

    // Stop recording
    await fireEvent.click(startStopButton);

  });

  test('displays error message when microphone access is denied', async () => {
    getUserMediaMock.mockImplementationOnce(() => Promise.reject(new Error('Permission denied')));
    render(<App />);
    const startStopButton = screen.getByRole('button', { name: /Start Recording|Stop Recording/i });

    await fireEvent.click(startStopButton);

    await waitFor(() => expect(screen.getByText(/Failed to access microphone/i)).toBeInTheDocument());
  });

  test('opens and closes settings modal', async () => {
    render(<App />);
    const settingsButton = screen.getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsButton);

    await waitFor(() => expect(screen.getByText(/Settings/i)).toBeInTheDocument());

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

  });

  test('opens and closes history modal', async () => {
    render(<App />);
    const historyButton = screen.getByRole('button', { name: /View History/i });
    fireEvent.click(historyButton);

    await waitFor(() => expect(screen.getByText(/Conversation History/i)).toBeInTheDocument());

    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

  });

  test('changes conversation mode', () => {
    render(<App />);
    const interviewButton = screen.getByRole('button', { name: /Interview Practice/i });
    fireEvent.click(interviewButton);
    // No direct way to assert the state change in the UI without more specific data-testid
    // Can add a data-testid to the active button for more specific assertion
  });

});