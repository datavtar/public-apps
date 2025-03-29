import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../src/App';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
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
(navigator.mediaDevices as any) = {
  getUserMedia: mockGetUserMedia,
};

beforeEach(() => {
  localStorage.clear();
  mockGetUserMedia.mockReset();
  mockGetUserMedia.mockResolvedValue({
    getTracks: () => [{
      stop: jest.fn(),
    }],
  });
});

describe('App Component', () => {
  test('renders the app', () => {
    render(<App />);
    expect(screen.getByText('Nutrition Snap')).toBeInTheDocument();
  });

  test('switches between scan and history tabs', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'History tab' }));
    expect(screen.getByText('Your Food History')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Scan tab' }));
    expect(screen.getByText('Upload a food image')).toBeInTheDocument();
  });

  test('opens and closes the info modal', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { 'aria-label': 'App information' }));
    expect(screen.getByText('About Nutrition Snap')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { 'aria-label': 'Close info' }));
    expect(screen.queryByText('About Nutrition Snap')).not.toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { 'aria-label': 'Switch to dark mode' });
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('true');
    fireEvent.click(darkModeButton);
    expect(localStorage.getItem('darkMode')).toBe('false');
  });

  test('opens camera and captures image', async () => {
    render(<App />);
    
    // Mock camera stream
    const mockStream = {
        getTracks: () => [{
            stop: jest.fn(),
        }],
    };

    mockGetUserMedia.mockResolvedValue(mockStream);

    fireEvent.click(screen.getByRole('button', { name: 'Camera' }));

    // Wait for the camera to open
    await waitFor(() => {
      expect(mockGetUserMedia).toHaveBeenCalled();
    });

    // Capture the image
    const captureButton = screen.getByRole('button', {name: 'Take photo'});
    fireEvent.click(captureButton);
  });

    test('uploads an image', async () => {
      render(<App />);
      const file = new File(['(⌐□□)'], 'test.png', { type: 'image/png' });
      const input = screen.getByRole('button', {name: 'Upload a food image'});
  
      // Mock click to trigger file selection
      fireEvent.click(input)

      const fileInput = screen.getByRole('button', { name: 'Upload a food image' }).closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      // Simulate file upload by manually setting the files property on the file input element
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });

      fireEvent.change(fileInput);
      await waitFor(() => {
        expect(screen.getByAltText('Captured food')).toBeInTheDocument();
      });
    });

  test('analyzes the food and displays results', async () => {
      render(<App />);
      const file = new File(['(⌐□□)'], 'test.png', { type: 'image/png' });
      const input = screen.getByRole('button', {name: 'Upload a food image'});
  
      // Mock click to trigger file selection
      fireEvent.click(input)

      const fileInput = screen.getByRole('button', { name: 'Upload a food image' }).closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

      // Simulate file upload by manually setting the files property on the file input element
      Object.defineProperty(fileInput, 'files', {
        value: [file],
      });

      fireEvent.change(fileInput);

    //   fireEvent.upload(fileInput, file)

      await waitFor(() => {
        expect(screen.getByAltText('Captured food')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByRole('button', { name: 'Analyze food' }));
      
      await waitFor(() => {
          expect(screen.getByText('Ingredients:')).toBeInTheDocument();
      }, {timeout: 2000});
  });

  test('resets the scan after analysis', async () => {
    render(<App />);
    const file = new File(['(⌐□□)'], 'test.png', { type: 'image/png' });
    const input = screen.getByRole('button', {name: 'Upload a food image'});

    // Mock click to trigger file selection
    fireEvent.click(input)

    const fileInput = screen.getByRole('button', { name: 'Upload a food image' }).closest('div')?.querySelector('input[type="file"]') as HTMLInputElement

    // Simulate file upload by manually setting the files property on the file input element
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);
    await waitFor(() => {
      expect(screen.getByAltText('Captured food')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Analyze food' }));

    await waitFor(() => {
        expect(screen.getByText('Ingredients:')).toBeInTheDocument();
    }, {timeout: 2000});

    fireEvent.click(screen.getByRole('button', { name: 'Scan new food' }));
    expect(screen.getByText('Upload a food image')).toBeInTheDocument();
  });

  test('displays history and food details', async () => {
    // Mock nutrition data in local storage
    const mockNutritionData = [{
      id: '123',
      image: 'mock-image.png',
      name: 'Test Food',
      calories: 100,
      ingredients: ['Ingredient 1'],
      advantages: ['Advantage 1'],
      disadvantages: ['Disadvantage 1'],
      dateAdded: new Date().toISOString()
    }];
    localStorage.setItem('nutritionData', JSON.stringify(mockNutritionData));

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'History tab' }));

    await waitFor(() => {
      expect(screen.getByText('Test Food')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Food'));

    await waitFor(() => {
      expect(screen.getByText('Calories')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Close details' }));
    expect(screen.queryByText('Calories')).not.toBeInTheDocument();
  });
});
