import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading Invoice System...')).toBeInTheDocument();
  });

  test('renders error state when loading fails', async () => {
    localStorage.setItem('finance_invoices_data', 'invalid json');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try refreshing.')).toBeInTheDocument();
    });
  });

 test('renders dashboard view', async () => {
        render(<App />);

        // Wait for loading to complete
        await waitFor(() => {
            expect(screen.queryByText('Loading Invoice System...')).not.toBeInTheDocument();
        });

        // Check if dashboard elements are present (adjust based on your dashboard content)
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

  test('navigates to invoices view', async () => {
      render(<App />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading Invoice System...')).not.toBeInTheDocument();
      });

      const invoicesButton = screen.getByRole('button', { name: /Invoices/i });
      fireEvent.click(invoicesButton);

      await waitFor(() => {
        expect(screen.getByText('Manage Invoices')).toBeInTheDocument();
      });
    });
});
