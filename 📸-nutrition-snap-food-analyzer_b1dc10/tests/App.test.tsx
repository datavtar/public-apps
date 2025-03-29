import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock local storage
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

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the camera access
const mockGetUserMedia = jest.fn();

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
});

beforeEach(() => {
  localStorage.clear();
  mockGetUserMedia.mockClear();
});

describe('App Component', () => {
  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('NutritionSnap')).toBeInTheDocument();
  });

  test('initial tab is Camera', () => {
    render(<App />);
    expect(screen.getByText('Start Camera')).toBeInTheDocument();
  });

  test('navigates to History tab', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /history/i }));
    expect(screen.getByText('No food items yet')).toBeInTheDocument();
  });

  test('navigates back to Camera tab from History', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /history/i }));
    fireEvent.click(screen.getByRole('button', { name: /get started/i }));
    expect(screen.getByText('Start Camera')).toBeInTheDocument();
  });

  test('displays camera error message when camera permission is denied', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start camera/i }));

    await waitFor(() => {
      expect(screen.getByText('Unable to access camera. Please make sure you have granted camera permissions.')).toBeInTheDocument();
    });
  });

  test('shows analyzing state when capturing image', async () => {
      mockGetUserMedia.mockResolvedValue({
          getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
      });

      render(<App />);
      fireEvent.click(screen.getByRole('button', { name: /start camera/i }));

      // Wait for camera to start
      await waitFor(() => expect(mockGetUserMedia).toHaveBeenCalled());

      // Mock video width and height
      const videoElement = screen.getByRole('presentation') as HTMLVideoElement;
      Object.defineProperty(videoElement, 'videoWidth', { value: 640 });
      Object.defineProperty(videoElement, 'videoHeight', { value: 480 });

      // Click capture button
      fireEvent.click(screen.getByRole('button', { name: /capture/i }));
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  test('renders food details after capturing image', async () => {
    mockGetUserMedia.mockResolvedValue({
        getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start camera/i }));

    // Wait for camera to start
    await waitFor(() => expect(mockGetUserMedia).toHaveBeenCalled());

    // Mock video width and height
    const videoElement = screen.getByRole('presentation') as HTMLVideoElement;
    Object.defineProperty(videoElement, 'videoWidth', { value: 640 });
    Object.defineProperty(videoElement, 'videoHeight', { value: 480 });

    // Click capture button
    fireEvent.click(screen.getByRole('button', { name: /capture/i }));

    // Wait for analyzing to finish and food details to load
    await waitFor(() => {
        expect(screen.getByText('Nutrition Information')).toBeInTheDocument();
    });

    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('Advantages')).toBeInTheDocument();
    expect(screen.getByText('Disadvantages')).toBeInTheDocument();
});
});