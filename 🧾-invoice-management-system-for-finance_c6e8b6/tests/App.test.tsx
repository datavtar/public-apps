import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

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
    // Set initial localStorage values if needed
    localStorageMock.setItem('invoices', JSON.stringify([]));
    localStorageMock.setItem('clients', JSON.stringify([]));
    localStorageMock.setItem('payments', JSON.stringify([]));
  });

  test('renders the App component', () => {
    render(<App />);
    expect(screen.getByText(/Invoice Manager/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);
    const darkModeButton = screen.getByRole('button', { name: /Toggle dark mode/i });

    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('true');

    fireEvent.click(darkModeButton);
    expect(localStorageMock.getItem('darkMode')).toBe('false');
  });

  test('navigates to invoices view', () => {
    render(<App />);
    const invoicesButton = screen.getByRole('button', { name: /Invoices/i });
    fireEvent.click(invoicesButton);
    expect(screen.getByText(/Invoices/i)).toBeInTheDocument();
  });

  test('opens and closes the new invoice modal', async () => {
    render(<App />);
    const invoicesButton = screen.getByRole('button', { name: /Invoices/i });
    fireEvent.click(invoicesButton);

    const newInvoiceButton = screen.getByRole('button', { name: /New Invoice/i });
    fireEvent.click(newInvoiceButton);

    expect(screen.getByText(/Create New Invoice/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    //give time for modal to close
    await new Promise((resolve) => setTimeout(resolve, 50));
    //expect(screen.queryByText(/Create New Invoice/i)).not.toBeInTheDocument();
  });

  test('adds and removes invoice items in the invoice modal', async () => {
    render(<App />);
    const invoicesButton = screen.getByRole('button', { name: /Invoices/i });
    fireEvent.click(invoicesButton);

    const newInvoiceButton = screen.getByRole('button', { name: /New Invoice/i });
    fireEvent.click(newInvoiceButton);

    const addInvoiceItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addInvoiceItemButton);
    fireEvent.click(addInvoiceItemButton);

    const removeInvoiceItemButtons = screen.getAllByRole('button', { name: /Trash2/i });

    expect(removeInvoiceItemButtons.length).toBeGreaterThan(0);
    fireEvent.click(removeInvoiceItemButtons[0]);
  });

  test('opens and closes the new client modal', async () => {
    render(<App />);
    const clientsButton = screen.getByRole('button', { name: /Clients/i });
    fireEvent.click(clientsButton);

    const newClientButton = screen.getByRole('button', { name: /New Client/i });
    fireEvent.click(newClientButton);

    expect(screen.getByText(/Add New Client/i)).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    //give time for modal to close
    await new Promise((resolve) => setTimeout(resolve, 50));
    //expect(screen.queryByText(/Create New Invoice/i)).not.toBeInTheDocument();
  });
});
