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
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});



ddescribe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders the component', () => {
    render(<App />);
    expect(screen.getByText('Private Equity Portfolio Manager')).toBeInTheDocument();
  });

  test('initially displays the Funds tab', () => {
    render(<App />);
    expect(screen.getByText(/Funds/i)).toBeInTheDocument();
  });

  test('can switch to the Portfolio Companies tab', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Portfolio Companies/i }));
    await waitFor(() => {
      expect(screen.getByText(/Company Name/i)).toBeVisible();
    });
  });

  test('displays summary metrics', async () => {
    render(<App />);
    await waitFor(() => {
        expect(screen.getByText(/Total AUM/i)).toBeVisible();
        expect(screen.getByText(/Weighted IRR/i)).toBeVisible();
    })
  });

  test('can open and close the add fund modal', async () => {
    render(<App />);

    // Open the add fund modal
    fireEvent.click(screen.getByRole('button', { name: /Add Fund/i }));
    await waitFor(() => {
        expect(screen.getByText(/Add New Fund/i)).toBeVisible();
    })

    // Close the add fund modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
  });

  test('can open and close the add company modal', async () => {
    render(<App />);

    // Switch to the companies tab
    fireEvent.click(screen.getByRole('button', { name: /Portfolio Companies/i }));

    // Open the add company modal
    fireEvent.click(screen.getByRole('button', { name: /Add Company/i }));

    await waitFor(() => {
        expect(screen.getByText(/Add New Portfolio Company/i)).toBeVisible();
    })

    // Close the add company modal
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
  });
});