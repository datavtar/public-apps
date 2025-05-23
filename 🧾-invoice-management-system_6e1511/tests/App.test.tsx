import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../src/App';

// Mock local storage
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

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="ai-layer-mock">AILayer Mock</div>,
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders without crashing', () => {
    render(<App />);
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByText('Loading invoices...')).toBeInTheDocument();
  });

  test('renders dashboard view after loading', async () => {
    render(<App />);
    // Wait for loading to finish (adjust timeout as needed)
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('navigates to invoices list view', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    }, { timeout: 2000 });

    const invoicesLink = screen.getByRole('button', { name: /^Invoices$/i });
    fireEvent.click(invoicesLink);

    await waitFor(() => {
      expect(screen.getByText('Invoices')).toBeInTheDocument();
    });
  });

  test('navigates to add invoice view', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    }, { timeout: 2000 });

    const newInvoiceLink = screen.getByRole('button', { name: /^New Invoice$/i });
    fireEvent.click(newInvoiceLink);

    await waitFor(() => {
      expect(screen.getByText('Create New Invoice')).toBeInTheDocument();
    });
  });

  test('displays error message when local storage fails to load', async () => {
    // Mock local storage to throw an error
    const localStorageGetItemMock = jest.spyOn(window.localStorage, 'getItem');
    localStorageGetItemMock.mockImplementation(() => {
      throw new Error('Failed to load from local storage');
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load invoices/i)).toBeInTheDocument();
    });

    localStorageGetItemMock.mockRestore(); // Restore the original implementation
  });

  test('AILayer component is rendered', () => {
    render(<App />);
    expect(screen.getByTestId('ai-layer-mock')).toBeInTheDocument();
  });
});