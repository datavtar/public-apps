import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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



describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading NIFTY Analyzer')).toBeInTheDocument();
  });

  test('renders error state when there is an error', async () => {
    // Mock the fetch to simulate an error
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.reject(new Error('Failed to fetch'))
    );

    const { rerender } = render(<App />);

    // Wait for the loading state to disappear and error to appear
    await waitFor(() => {
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
    });

    // Restore the original fetch function
    (global.fetch as jest.Mock).mockRestore();
  });

  test('renders the main content after loading', async () => {
    render(<App />);

    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading NIFTY Analyzer')).not.toBeInTheDocument();
    }, { timeout: 2000 });

    // Check if the main content is rendered
    expect(screen.getByText('NIFTY Options Analyzer')).toBeInTheDocument();
  });

});