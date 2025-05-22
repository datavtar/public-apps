import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
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

// Mock the camera functionality
const mockTakePhoto = jest.fn(() => 'mock-image-data');

jest.mock('react-camera-pro', () => {
  return {
    Camera: React.forwardRef((props, ref) => {
      React.useImperativeHandle(ref, () => ({
        takePhoto: mockTakePhoto,
      }));
      return <div data-testid="camera-component">Camera Mock</div>;
    }),
  };
});

beforeEach(() => {
  localStorage.clear();
  mockTakePhoto.mockClear();
});

test('renders NutriSnap title', () => {
  render(<App />);
  const titleElement = screen.getByText(/NutriSnap/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders default "Snap Your Food" view', () => {
  render(<App />);
  expect(screen.getByText(/Snap Your Food/i)).toBeInTheDocument();
});

test('opens camera when "Open Camera" button is clicked', async () => {
  render(<App />);
  const openCameraButton = screen.getByRole('button', { name: /Open Camera/i });
  fireEvent.click(openCameraButton);
  expect(screen.getByTestId('camera-component')).toBeInTheDocument();
});

test('closes camera when close button is clicked', async () => {
  render(<App />);
  const openCameraButton = screen.getByRole('button', { name: /Open Camera/i });
  fireEvent.click(openCameraButton);
  const closeCameraButton = screen.getByRole('button', { name: /Close camera/i });
  fireEvent.click(closeCameraButton);
  await waitFor(() => {
    expect(screen.queryByTestId('camera-component')).not.toBeInTheDocument();
  });
});

test('captures image when take photo button is clicked', async () => {
  render(<App />);
  const openCameraButton = screen.getByRole('button', { name: /Open Camera/i });
  fireEvent.click(openCameraButton);
  const takePhotoButton = screen.getByRole('button', { name: /Take photo/i });
  fireEvent.click(takePhotoButton);
  await waitFor(() => {
    expect(mockTakePhoto).toHaveBeenCalled();
  });
});

test('shows analyzing food message after capturing image', async () => {
  render(<App />);
  const openCameraButton = screen.getByRole('button', { name: /Open Camera/i });
  fireEvent.click(openCameraButton);
  const takePhotoButton = screen.getByRole('button', { name: /Take photo/i });
  fireEvent.click(takePhotoButton);
  await waitFor(() => {
      expect(screen.getByText(/Analyzing your food.../i)).toBeInTheDocument();
  });
});

test('displays detected food and nutrition information after image capture (mocked)', async () => {
    render(<App />);
    const openCameraButton = screen.getByRole('button', { name: /Open Camera/i });
    fireEvent.click(openCameraButton);
    const takePhotoButton = screen.getByRole('button', { name: /Take photo/i });
    fireEvent.click(takePhotoButton);

    // Wait for the mock food recognition to complete
    await waitFor(() => {
        expect(screen.getByLabelText(/Food Name/i)).toBeInTheDocument();
    });

    // Assert that the food name input is present
    expect(screen.getByLabelText(/Food Name/i)).toBeInTheDocument();

    // Assert that the detected food select is present
    expect(screen.getByLabelText(/Detected Food/i)).toBeInTheDocument();

    // Assert that the meal type select is present
    expect(screen.getByLabelText(/Meal Type/i)).toBeInTheDocument();

    // Assert that nutrition information is displayed
    expect(screen.getByText(/Nutrition Information/i)).toBeInTheDocument();
});

test('navigates to the log tab', () => {
  render(<App />);
  const logTabButton = screen.getByRole('button', { name: /Log/i });
  fireEvent.click(logTabButton);
  expect(screen.getByText(/No meals logged for this day/i)).toBeInTheDocument();
});

test('navigates to the insights tab', () => {
  render(<App />);
  const insightsTabButton = screen.getByRole('button', { name: /Insights/i });
  fireEvent.click(insightsTabButton);
  expect(screen.getByText(/Weekly Calorie Intake/i)).toBeInTheDocument();
});

test('navigates to the profile tab', () => {
  render(<App />);
  const profileTabButton = screen.getByRole('button', { name: /Profile/i });
  fireEvent.click(profileTabButton);
  expect(screen.getByText(/Your Profile/i)).toBeInTheDocument();
});
