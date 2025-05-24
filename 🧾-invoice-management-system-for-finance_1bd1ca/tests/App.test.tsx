import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

// Mock the AILayer component
jest.mock('../src/components/AILayer', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="ai-layer-mock">AILayer Mock</div>
  };
});


describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('renders header with navigation links', () => {
    render(<App />);
    expect(screen.getByText(/Invoice Management System/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Invoices/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Invoice/i })).toBeInTheDocument();
  });

  test('renders dashboard by default', () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  test('shows loading state initially', () => {
    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders invoice list when invoice link is clicked', async () => {
    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      const loadingElement = screen.queryByRole('status');
      expect(loadingElement).not.toBeInTheDocument();
    });

    const invoicesLink = screen.getByRole('button', { name: /Invoices/i });
    invoicesLink.click();
    await waitFor(() => screen.getByText(/Invoices/i))
    expect(screen.getByText(/Invoices/i)).toBeInTheDocument();
  });

  test('renders new invoice form when new invoice link is clicked', async () => {
    render(<App />);

     // Wait for loading to finish
     await waitFor(() => {
      const loadingElement = screen.queryByRole('status');
      expect(loadingElement).not.toBeInTheDocument();
    });

    const newInvoiceLink = screen.getByRole('button', { name: /New Invoice/i });
    newInvoiceLink.click();
    await waitFor(() => screen.getByText(/Create New Invoice/i));
    expect(screen.getByText(/Create New Invoice/i)).toBeInTheDocument();
  });

  test('renders AILayer component', () => {
    render(<App />);
    const aiLayerMock = screen.getByTestId('ai-layer-mock');
    expect(aiLayerMock).toBeInTheDocument();
  });
});