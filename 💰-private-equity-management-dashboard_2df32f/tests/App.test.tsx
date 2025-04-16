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

// Mock window.matchMedia
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



describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('renders loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Across 0 investments')).toBeInTheDocument();
  });

  test('renders error state when loading fails', async () => {
    const originalLocalStorage = window.localStorage;
    Object.defineProperty(window, 'localStorage', { configurable: true, writable: true, value: { getItem: () => { throw new Error('Failed to load data'); } } });
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try refreshing the page.')).toBeInTheDocument();
    });

    Object.defineProperty(window, 'localStorage', { configurable: true, writable: true, value: originalLocalStorage });
  });

  test('adds a new investment', async () => {
    render(<App />);

    // Wait for initial loading to complete
    await waitFor(() => expect(screen.queryByText('Across 0 investments')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /^Add Investment$/i }));

    fireEvent.change(screen.getByLabelText(/Company Name/i), { target: { value: 'Test Company' } });
    fireEvent.change(screen.getByLabelText(/Investment Amount/i), { target: { value: '1000000' } });
    fireEvent.change(screen.getByLabelText(/Investment Date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/Fund Name/i), { target: { value: 'Test Fund' } });
    fireEvent.change(screen.getByLabelText(/Sector/i), { target: { value: 'Technology' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'Active' } });

    fireEvent.click(screen.getByRole('button', { name: /^Add Investment$/i }));

    await waitFor(() => expect(screen.getByText('Test Company')).toBeInTheDocument());
  });
});