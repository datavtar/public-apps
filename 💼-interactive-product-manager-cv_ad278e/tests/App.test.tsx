import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';


// Mock localStorage to prevent errors during testing
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

// Mock the matchMedia function
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),  
    removeEventListener: jest.fn(),  
    dispatchEvent: jest.fn(),  
  })),
});



test('renders without crashing', async () => {
  render(<App />);
  // Wait for the loading state to disappear before checking for elements
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  // Now check for elements that should be present after loading
  expect(screen.getByText(/alex johnson/i)).toBeInTheDocument();
  expect(screen.getByText(/senior product manager/i)).toBeInTheDocument();
});


test('shows loading state initially', () => {
  render(<App />);
  expect(screen.getByText(/loading cv data/i)).toBeInTheDocument();
});


test('displays error message when data fails to load', async () => {
  // Mock localStorage to simulate no data
  localStorageMock.clear();

  const originalConsoleError = console.error;
  console.error = jest.fn();

  render(<App />);

  // Mock the data fetch to simulate an error
  localStorageMock.getItem = jest.fn().mockImplementation(() => null);

  // Wait for the loading state to disappear and the error message to appear
  await waitFor(() => {
    expect(screen.queryByText(/loading cv data/i)).not.toBeInTheDocument();
    expect(screen.getByText(/failed to load cv data/i)).toBeInTheDocument();
  });

  console.error = originalConsoleError;
});