import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';


// Mock the localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
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

// Mock the browser matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});


// Mock the camera access
const mockGetUserMedia = jest.fn();



beforeEach(() => {
  mockGetUserMedia.mockReset();
  (navigator.mediaDevices.getUserMedia as jest.Mock) = mockGetUserMedia;
});



test('renders NutriSnap title', () => {
  render(<App />);
  expect(screen.getByText('NutriSnap')).toBeInTheDocument();
});

test('renders camera tab initially', () => {
  render(<App />);
  expect(screen.getByText('Take a photo of your food')).toBeInTheDocument();
});

test('navigates to history tab', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: /history/i }));
  expect(screen.getByText('Recent Analyses')).toBeInTheDocument();
});

test('navigates to info tab', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: /about/i }));
  expect(screen.getByText('About NutriSnap')).toBeInTheDocument();
});

test('displays camera access denied error', async () => {
  mockGetUserMedia.mockRejectedValue(new Error('Camera access denied'));
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /open camera/i }));

  await waitFor(() => {
    expect(screen.getByText('Camera access denied. Please check your permissions.')).toBeInTheDocument();
  });
});

test('displays analyzing state', async () => {
  render(<App />);
  const openCameraButton = screen.getByRole('button', { name: /open camera/i });
  fireEvent.click(openCameraButton);
  
  mockGetUserMedia.mockResolvedValueOnce({
    getTracks: () => [{
      stop: jest.fn()
    }]
  } as any);

  await waitFor(() => {
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.dispatchEvent(new Event('loadeddata'));
    }
  });

  const captureButton = await screen.findByRole('button', {name: /take photo/i});
  fireEvent.click(captureButton);

  // Wait for the image to be captured and displayed
  await waitFor(() => expect(screen.getByText('Analyzing your food...')).toBeInTheDocument());

});
