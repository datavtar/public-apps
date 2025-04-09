import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
    clear(): void {
      store = {};
    },
    removeItem(key: string): void {
      delete store[key];
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
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
});


describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    window.matchMedia.mockClear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders dashboard after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Logistics Dashboard')).toBeInTheDocument();
    });
  });

  test('adds a shipment', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Logistics Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /shipments/i }));
    fireEvent.click(screen.getByRole('button', { name: /add shipment/i }));

    fireEvent.change(screen.getByLabelText(/tracking number/i), { target: { value: 'TEST1234' } });
    fireEvent.change(screen.getByLabelText(/carrier/i), { target: { value: 'Test Carrier' } });
    fireEvent.change(screen.getByLabelText(/origin/i), { target: { value: 'Test Origin' } });
    fireEvent.change(screen.getByLabelText(/destination/i), { target: { value: 'Test Destination' } });
    fireEvent.change(screen.getByLabelText(/departure date/i), { target: { value: '2024-01-01' } });
    fireEvent.change(screen.getByLabelText(/estimated arrival date/i), { target: { value: '2024-01-10' } });

    fireEvent.click(screen.getByRole('button', { name: /create shipment/i }));

    await waitFor(() => {
      expect(screen.getByText('TEST1234')).toBeInTheDocument();
    });
  });

  test('toggles dark mode', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Logistics Dashboard')).toBeInTheDocument();
      });

      const darkModeButton = screen.getByRole('button', { name: /switch to dark mode/i });
      fireEvent.click(darkModeButton);

      expect(localStorage.getItem('darkMode')).toBe('true');
  });
});